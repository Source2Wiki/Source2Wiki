/**
 * Every commit that touched a doc, or the partials and category file it's built from, for the page
 * history under each doc (see src/theme/DocItem/Footer).
 *
 * The history reaches the page as `edit_history` front matter: docusaurus.config.ts adds it to
 * every doc through markdown.parseFrontMatter (see addPageHistory), generated entity docs write
 * their own since they are not tracked by git (see tools/entity-pages/last-update.ts).
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { GitHubAccount, resolveAccounts } from "./github-accounts";

export interface PageEdit {
  /** Full commit hash. */
  hash: string;
  /** ISO 8601. */
  date: string;
  /** The author's name in git. */
  author: string;
  /** The commit's subject line. */
  message: string;
  /** The author's GitHub account if they have one, added on the way into the front matter by addPageHistory. */
  account?: GitHubAccount;
}

export const HistoryFrontMatterKey = "edit_history";

/** The git log format parseGitLog reads, one header line per commit followed by --name-status lines. */
export const GitLogFormat = "--format=%x00%H%x00%aI%x00%an%x00%s";

/**
 * File path -> its commits, newest first, from a `git log --name-status` using GitLogFormat.
 *
 * The log goes newest to oldest, so renames are followed backwards: once a commit moved a file
 * from `old` to `new`, older commits to `old` belong to whatever `new` is called today.
 */
export function parseGitLog(log: string): Map<string, PageEdit[]> {
  const history = new Map<string, PageEdit[]>();

  // path in older commits -> the file's path today, null once the file at that path was added
  // or deleted since older commits to it are about some other file
  const currentPath = new Map<string, string | null>();
  const resolve = (file: string) => (currentPath.has(file) ? currentPath.get(file)! : file);

  // a commit's renames only apply to the commits before it, so they wait until its file list is done
  let pending: [string, string | null][] = [];
  const applyPending = () => {
    // ended paths first, a path can be renamed away from and onto within the same commit
    for (const [file, current] of pending.filter(([, current]) => current === null)) {
      currentPath.set(file, current);
    }
    for (const [file, current] of pending.filter(([, current]) => current !== null)) {
      currentPath.set(file, current);
    }
    pending = [];
  };

  let commit: PageEdit | null = null;
  for (const line of log.split("\n")) {
    if (line.startsWith("\0")) {
      applyPending();
      const [, hash, date, author, message] = line.split("\0");
      commit = { hash, date, author, message };
      continue;
    }

    if (line.length === 0 || commit === null) {
      continue;
    }

    // "M\tpath", "A\tpath", "D\tpath" or "R095\told\tnew"
    const [status, ...paths] = line.split("\t");
    const file = paths[paths.length - 1];
    const current = resolve(file);

    if (status.startsWith("D")) {
      pending.push([file, null]);
      continue;
    }

    if (current !== null) {
      const edits = history.get(current) ?? [];
      edits.push(commit);
      history.set(current, edits);
    }

    if (status.startsWith("A")) {
      pending.push([file, null]);
    } else if (status.startsWith("R")) {
      pending.push([file, null]);
      pending.push([paths[0], current]);
    }
  }

  return history;
}

const SiteDir = path.resolve(__dirname, "..");

/** Files whose name or a folder starts with `_`, docusaurus' default for partials: imported into docs rather than being pages. */
export function isPartial(filePath: string): boolean {
  return path.relative(SiteDir, filePath).split(path.sep).some((segment) => segment.startsWith("_"));
}

/**
 * The files whose commits make up a doc's history: the doc itself, any partials it imports
 * (and the ones they import), and the folder's _category_ file when the doc is the category's
 * index page, since that file holds the category's label, icon and description.
 */
export function historySources(filePath: string, fileContent: string, readFile = (file: string) => fs.readFileSync(file, "utf8")): string[] {
  const sources = [filePath];

  const folder = path.dirname(filePath);
  const name = path.parse(filePath).name.toLowerCase();
  // docusaurus' category index convention, the folder's index, README or same named doc
  if (name === "index" || name === "readme" || name === path.basename(folder).toLowerCase()) {
    sources.push(...["_category_.json", "_category_.yml", "_category_.yaml"].map((file) => path.join(folder, file)));
  }

  const visited = new Set([filePath]);
  const addPartials = (file: string, content: string) => {
    for (const partial of importedPartials(file, content)) {
      if (visited.has(partial)) {
        continue;
      }
      visited.add(partial);
      sources.push(partial);

      try {
        addPartials(partial, readFile(partial));
      } catch {
        // a missing partial is for the MDX compile to complain about
      }
    }
  };
  addPartials(filePath, fileContent);

  return sources;
}

/** Partial markdown files imported by a doc, relative or through @site. */
function importedPartials(filePath: string, fileContent: string): string[] {
  const partials: string[] = [];

  for (const [, specifier] of fileContent.matchAll(/^\s*import\s[^;]*?from\s*['"]([^'"]+)['"]/gm)) {
    let file: string;
    if (specifier.startsWith(".")) {
      file = path.resolve(path.dirname(filePath), specifier);
    } else if (specifier.startsWith("@site/")) {
      file = path.resolve(SiteDir, specifier.slice("@site/".length));
    } else {
      continue;
    }

    if (/\.mdx?$/.test(file) && isPartial(file)) {
      partials.push(file);
    }
  }

  return partials;
}

interface SiteHistory {
  files: Map<string, PageEdit[]>;
  /** Commit hash -> its position in the log, to merge several files' commits back into log order. */
  order: Map<string, number>;
}

let siteHistory: SiteHistory | null = null;

/** Commits to a doc and everything listed by historySources, newest first, empty for partials or if git doesn't know any of them. */
export function getDocHistory(filePath: string, fileContent: string): PageEdit[] {
  if (isPartial(filePath)) {
    return [];
  }

  if (siteHistory === null) {
    siteHistory = loadSiteHistory();
  }
  const { files, order } = siteHistory;

  const edits = new Map<string, PageEdit>();
  for (const source of historySources(filePath, fileContent)) {
    const relativePath = path.relative(SiteDir, source).split(path.sep).join("/");
    for (const edit of files.get(relativePath) ?? []) {
      edits.set(edit.hash, edit);
    }
  }

  return [...edits.values()].sort((a, b) => order.get(a.hash)! - order.get(b.hash)!);
}

function loadSiteHistory(): SiteHistory {
  let log: string;
  try {
    // one log for the whole site is much faster than one per doc
    log = execFileSync("git", ["-c", "core.quotepath=off", "log", "-M", "--name-status", "--relative", GitLogFormat, "--", "docs"], {
      cwd: SiteDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch {
    console.log("No git history, docs will not carry their page history");
    return { files: new Map(), order: new Map() };
  }

  const hashes = log.split("\n").filter((line) => line.startsWith("\0")).map((line) => line.split("\0")[1]);
  return { files: parseGitLog(log), order: new Map(hashes.map((hash, index) => [hash, index])) };
}

/** Someone with commits anywhere in the wiki, for the list of all contributors on the home page. */
export interface WikiContributor {
  /** Their name in git, the newest one if they committed under several. */
  author: string;
  account?: GitHubAccount;
  commits: number;
}

/** A doc asks for the list of everyone who contributed to the wiki with this in its front matter. */
export const WikiContributorsFlag = "show_wiki_contributors";
export const WikiContributorsFrontMatterKey = "wiki_contributors";

/**
 * Everyone behind the given commits (newest first), whoever has the most commits first.
 * Git names and emails sharing a GitHub account count as one person, bots are left out.
 */
export function countContributors(commits: { author: string; account?: GitHubAccount }[]): WikiContributor[] {
  const contributors = new Map<string, WikiContributor>();

  for (const { author, account } of commits) {
    if (author.endsWith("[bot]")) {
      continue;
    }

    const key = account !== undefined ? `account ${account.id}` : `author ${author}`;
    const contributor = contributors.get(key) ?? { author, ...(account !== undefined ? { account } : {}), commits: 0 };
    contributor.commits++;
    contributors.set(key, contributor);
  }

  // the sort is stable, so between equals the one with the newest commit stays first
  return [...contributors.values()].sort((a, b) => b.commits - a.commits);
}

interface WikiCommits {
  /** Commit hash -> the GitHub account of its author, for the commits whose author has one. */
  accounts: Map<string, GitHubAccount>;
  contributors: WikiContributor[];
}

let wikiCommits: Promise<WikiCommits> | null = null;

async function loadWikiCommits(): Promise<WikiCommits> {
  let log: string;
  try {
    // every commit rather than the ones to docs, entity docs get their history from the dumps
    log = execFileSync("git", ["log", "--format=%H%x00%ae%x00%an%x00%P"], {
      cwd: SiteDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return { accounts: new Map(), contributors: [] };
  }

  const commits = log
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => {
      const [hash, email, author, parents] = line.split("\0");
      return { hash, email: email.toLowerCase(), author, isMerge: parents.includes(" ") };
    });

  // the log is newest first, so each email ends up with its oldest commit, the one most likely to be on GitHub
  const commitByEmail = new Map<string, string>();
  for (const { hash, email } of commits) {
    commitByEmail.set(email, hash);
  }

  const accountByEmail = await resolveAccounts(commitByEmail);

  const accounts = new Map<string, GitHubAccount>();
  for (const { hash, email } of commits) {
    const account = accountByEmail.get(email);
    if (account) {
      accounts.set(hash, account);
    }
  }

  // merging someone's pull request isn't a contribution of its own
  const contributors = countContributors(commits.filter((commit) => !commit.isMerge).map(({ hash, author }) => ({ author, account: accounts.get(hash) })));

  return { accounts, contributors };
}

/**
 * Puts a doc's page history into its front matter, each edit with its author's GitHub account
 * where there is one, and everyone who contributed to the wiki if the doc asks for them.
 * This is docusaurus.config.ts' markdown.parseFrontMatter hook.
 */
export async function addPageHistory(filePath: string, fileContent: string, frontMatter: Record<string, unknown>): Promise<void> {
  // generated entity docs are not tracked by git and bring their own
  const ownHistory = frontMatter[HistoryFrontMatterKey];
  // empty for partials, docusaurus warns about any front matter they have
  const history = Array.isArray(ownHistory) ? (ownHistory as PageEdit[]) : getDocHistory(filePath, fileContent);
  if (history.length === 0) {
    return;
  }

  wikiCommits ??= loadWikiCommits();
  const { accounts, contributors } = await wikiCommits;

  frontMatter[HistoryFrontMatterKey] = history.map((edit) => {
    const account = accounts.get(edit.hash);
    return account !== undefined ? { ...edit, account } : edit;
  });

  if (frontMatter[WikiContributorsFlag] === true) {
    frontMatter[WikiContributorsFrontMatterKey] = contributors;
  }

  // the history also has the doc's partials and category file, docusaurus' own last update
  // would only look at the doc's file and could miss a newer edit
  frontMatter.last_update ??= { date: history[0].date, author: history[0].author };
}
