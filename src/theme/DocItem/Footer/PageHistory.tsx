import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDateTimeFormat} from '@docusaurus/theme-common/internal';
import type {PageEdit, WikiContributor} from '@site/tools/page-history';

import styles from './styles.module.css';

const CommitUrl = 'https://github.com/Source2Wiki/Source2Wiki/commit/';

// the author of an edit, by their GitHub account if they have one and their name in git otherwise
interface Person {
  name: string;
  profileUrl?: string;
  avatarUrl?: string;
}

function personOf({author, account}: Pick<PageEdit, 'author' | 'account'>): Person {
  if (account === undefined) {
    return {name: author};
  }

  return {
    name: account.login,
    profileUrl: `https://github.com/${account.login}`,
    // twice the size it is shown at for high density screens, by id as that survives a rename
    avatarUrl: `https://avatars.githubusercontent.com/u/${account.id}?s=64&v=4`,
  };
}

function Avatar({person}: {person: Person}): React.JSX.Element {
  if (person.avatarUrl === undefined) {
    // no account to take a picture from, their initial stands in for it
    return (
      <span className={clsx(styles.avatar, styles.avatarInitial)} aria-hidden="true">
        {person.name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return <img className={styles.avatar} src={person.avatarUrl} alt="" loading="lazy" />;
}

// same format as docusaurus' own last updated line, UTC so the server and browser render the same day
function useDateFormat(): Intl.DateTimeFormat {
  return useDateTimeFormat({
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

interface Contributor {
  person: Person;
  // what hovering their chip says
  title: string;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

// everyone with an edit to the doc, whoever made the most first
function pageContributors(history: PageEdit[]): Contributor[] {
  const edits = new Map<string, {person: Person; count: number}>();
  for (const edit of history) {
    const person = personOf(edit);
    // several git names and emails can belong to one account
    const contributor = edits.get(person.name) ?? {person, count: 0};
    contributor.count++;
    edits.set(person.name, contributor);
  }

  // the sort is stable, so between equals the one with the newest edit stays first
  return [...edits.values()]
    .sort((a, b) => b.count - a.count)
    .map(({person, count}) => ({person, title: `${plural(count, 'edit')} to this page`}));
}

// the doc's contributors, or everyone who contributed to the wiki on docs that ask for
// them (show_wiki_contributors front matter, see tools/page-history.ts)
export function Contributors({history, wikiContributors}: {history: PageEdit[]; wikiContributors?: WikiContributor[]}): React.JSX.Element {
  const contributors =
    wikiContributors !== undefined
      ? wikiContributors.map(contributor => ({
          person: personOf(contributor),
          title: `${plural(contributor.commits, 'commit')} to the wiki`,
        }))
      : pageContributors(history);

  return (
    <div className={styles.contributors}>
      <div className={styles.contributorsTitle}>{wikiContributors !== undefined ? 'Wiki contributors' : 'Contributors'}</div>
      {wikiContributors !== undefined && (
        <p className={styles.contributorsDescription}>
          The Source 2 Wiki is a free and community-driven open-source project, any contributions no matter how small are welcome.
        </p>
      )}
      <ul className={styles.chips}>
        {contributors.map(({person, title}) => {
          const content = (
            <>
              <Avatar person={person} />
              {person.name}
            </>
          );

          return (
            <li key={person.name}>
              {person.profileUrl !== undefined ? (
                <a className={styles.chip} href={person.profileUrl} target="_blank" rel="noopener noreferrer" title={title}>
                  {content}
                </a>
              ) : (
                <span className={styles.chip} title={title}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// who updated the doc last, which is also the toggle for the list of every commit to it, newest first
export function PageHistory({history}: {history: PageEdit[]}): React.JSX.Element {
  const dateFormat = useDateFormat();
  const lastUpdated = new Date(history[0].date);
  const lastPerson = personOf(history[0]);

  return (
    <details className={styles.history}>
      <summary className={styles.summary}>
        {/* takes the place of @theme/LastUpdated */}
        <span className={clsx(ThemeClassNames.common.lastUpdated, styles.lastUpdated)}>
          Last updated
          <time dateTime={lastUpdated.toISOString()} itemProp="dateModified">
            {dateFormat.format(lastUpdated)}
          </time>
          by
          <span className={clsx(styles.person, styles.lastPerson)}>
            <Avatar person={lastPerson} />
            {lastPerson.name}
          </span>
        </span>
        <span className={styles.separator} aria-hidden="true">
          ·
        </span>
        <span className={styles.historyToggle}>See page history</span>
      </summary>
      <ol className={styles.edits}>
        {history.map(edit => {
          const date = new Date(edit.date);
          const person = personOf(edit);
          return (
            <li key={edit.hash} className={styles.edit}>
              <time className={styles.date} dateTime={date.toISOString()}>
                {dateFormat.format(date)}
              </time>
              <span className={clsx(styles.person, styles.author)}>
                <Avatar person={person} />
                {person.name}
              </span>
              <a
                className={styles.message}
                href={CommitUrl + edit.hash}
                target="_blank"
                rel="noopener noreferrer"
                title="View the changes on GitHub">
                {edit.message}
              </a>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
