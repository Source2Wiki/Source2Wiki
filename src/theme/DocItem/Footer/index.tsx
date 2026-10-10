/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ejected from @docusaurus/theme-classic to show who worked on the doc out of its page history
// (edit_history front matter, see tools/page-history.ts): everyone who contributed, who updated
// it last, and the list of edits

import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import TagsListInline from '@theme/TagsListInline';
import EditMetaRow from '@theme/EditMetaRow';
import EditThisPage from '@theme/EditThisPage';
import type {PageEdit, WikiContributor} from '@site/tools/page-history';
import {Contributors, PageHistory} from './PageHistory';

import styles from './styles.module.css';

export default function DocItemFooter(): React.JSX.Element | null {
  const {metadata} = useDoc();
  const {editUrl, lastUpdatedAt, lastUpdatedBy, tags} = metadata;
  // out of the metadata rather than the compiled doc's front matter, the bundler caches
  // compiled docs so theirs can be behind on commits that didn't change the doc's file
  const {edit_history: history = [], wiki_contributors: wikiContributors} = metadata.frontMatter as {
    edit_history?: PageEdit[];
    wiki_contributors?: WikiContributor[];
  };

  const canDisplayTagsRow = tags.length > 0;
  const canDisplayHistory = history.length > 0;
  const canDisplayEditMetaRow = !!(editUrl || lastUpdatedAt || lastUpdatedBy);
  const canDisplayFooter = canDisplayTagsRow || canDisplayEditMetaRow || canDisplayHistory;

  if (!canDisplayFooter) {
    return null;
  }

  return (
    <footer
      className={clsx(ThemeClassNames.docs.docFooter, 'docusaurus-mt-lg')}>
      {canDisplayTagsRow && (
        <div
          className={clsx(
            'row margin-top--sm',
            ThemeClassNames.docs.docFooterTagsRow,
          )}>
          <div className="col">
            <TagsListInline tags={tags} />
          </div>
        </div>
      )}
      {canDisplayHistory ? (
        // takes the place of @theme/EditMetaRow
        <div
          className={clsx(
            styles.pageMeta,
            // the list of everyone is the page's closing credits rather than a note about the doc
            wikiContributors !== undefined && styles.pageMetaCentered,
            ThemeClassNames.docs.docFooterEditMetaRow,
          )}>
          <div className={styles.pageMetaTop}>
            <Contributors history={history} wikiContributors={wikiContributors} />
            {editUrl && (
              <div className={styles.editLink}>
                <EditThisPage editUrl={editUrl} />
              </div>
            )}
          </div>
          <PageHistory history={history} />
        </div>
      ) : (
        // docs git doesn't know yet
        canDisplayEditMetaRow && (
          <EditMetaRow
            className={clsx('margin-top--sm', ThemeClassNames.docs.docFooterEditMetaRow)}
            editUrl={editUrl}
            lastUpdatedAt={lastUpdatedAt}
            lastUpdatedBy={lastUpdatedBy}
          />
        )
      )}
    </footer>
  );
}
