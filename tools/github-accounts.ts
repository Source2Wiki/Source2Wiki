/**
 * The GitHub accounts behind commit authors, for the names and pictures in a doc's page history.
 *
 * Git only knows an author's name and email. GitHub knows which account an email belongs to, so
 * each email is looked up once through one of its commits, and the answer is kept in
 * contributors.json next to this file. That file is tracked so builds don't depend on GitHub
 * answering, commit it when a new contributor makes it change. It is keyed by commit: emails are
 * never sent anywhere, written to it, or put in the built site.
 */

import fs from "node:fs";
import path from "node:path";

export interface GitHubAccount {
  login: string;
  /** Numeric user id, what avatar URLs are made of. Unlike the login it survives a rename. */
  id: number;
}

/** Looks up the account that authored a commit, null if its email isn't tied to one. Throws when it can't tell. */
export type AccountLookup = (commitHash: string) => Promise<GitHubAccount | null>;

const Repository = "Source2Wiki/Source2Wiki";

// not github-accounts.json, an import of "./github-accounts" would pick that over this file
export const AccountsFile = path.resolve(__dirname, "contributors.json");

/** The account inside one of GitHub's private commit emails, `{id}+{login}@users.noreply.github.com`. */
export function accountFromNoreplyEmail(email: string): GitHubAccount | null {
  const match = /^(\d+)\+([^@]+)@users\.noreply\.github\.com$/i.exec(email);
  return match !== null ? { login: match[2], id: Number(match[1]) } : null;
}

export const lookupOnGitHub: AccountLookup = async (commitHash) => {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "Source2Wiki" };
  // unauthenticated requests are limited to 60 an hour per IP, which CI runners share
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/repos/${Repository}/commits/${commitHash}`, { headers, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) {
    throw new Error(`GitHub answered ${response.status}`);
  }

  const { author } = (await response.json()) as { author: { login: string; id: number } | null };
  return author !== null ? { login: author.login, id: author.id } : null;
};

/**
 * Email -> account for every given email, null for the ones without an account.
 *
 * `commits` holds one commit by each email to look it up with. Whatever GitHub answers is kept in
 * the accounts file under that commit, a failed lookup isn't, so it is tried again next time and
 * until then falls back to what the email itself gives away.
 */
export async function resolveAccounts(commits: Map<string, string>, lookup: AccountLookup = lookupOnGitHub, accountsFile: string = AccountsFile): Promise<Map<string, GitHubAccount | null>> {
  const known = readAccounts(accountsFile);
  const accounts = new Map<string, GitHubAccount | null>();

  let lookedUp = 0;
  const failures: string[] = [];

  await Promise.all(
    [...commits].map(async ([email, commitHash]) => {
      if (commitHash in known) {
        accounts.set(email, known[commitHash]);
        return;
      }

      try {
        known[commitHash] = await lookup(commitHash);
        accounts.set(email, known[commitHash]);
        lookedUp++;
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
        accounts.set(email, accountFromNoreplyEmail(email));
      }
    }),
  );

  if (lookedUp > 0) {
    // sorted so the file doesn't reshuffle between runs
    const sorted = Object.fromEntries(Object.entries(known).sort(([a], [b]) => a.localeCompare(b)));
    fs.mkdirSync(path.dirname(accountsFile), { recursive: true });
    fs.writeFileSync(accountsFile, JSON.stringify(sorted, null, 2) + "\n");
    console.log(`Looked up the GitHub account of ${lookedUp} contributor(s) for the page history, saved to '${accountsFile}'`);
  }
  if (failures.length > 0) {
    console.log(`Could not look up the GitHub account of ${failures.length} contributor(s) (${failures[0]}), their pictures are left out until the next start`);
  }

  return accounts;
}

/** Commit hash -> the account that authored it, null if its email has none. */
function readAccounts(accountsFile: string): Record<string, GitHubAccount | null> {
  try {
    return JSON.parse(fs.readFileSync(accountsFile, "utf8"));
  } catch {
    return {};
  }
}
