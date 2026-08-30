import React from 'react';
import { PageMetadata } from '@docusaurus/theme-common';
import { useDoc, useSidebarBreadcrumbs } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// makes browser tabs and link embeds read "Title | Group" (the doc's parent
// sidebar category) instead of "Title | Source2 Wiki", embeds still show the
// site name separately through og:site_name
export default function DocItemMetadata(): React.JSX.Element
{
  const { metadata, frontMatter, assets } = useDoc();
  const breadcrumbs = useSidebarBreadcrumbs();
  const { siteConfig } = useDocusaurusContext();

  // nearest parent category, skipping ones named like the doc itself so
  // category index pages don't end up as "Asset Browser | Asset Browser"
  const group = breadcrumbs
    ?.slice(0, -1)
    .reverse()
    .find(item => item.label !== metadata.title)
    ?.label;

  // docs without a parent category keep the default "Title | Source2 Wiki",
  // see src/theme/ThemeProvider/TitleFormatter for how the site name is skipped
  const title = group
    ? `${metadata.title} ${siteConfig.titleDelimiter} ${group}`
    : metadata.title;

  return (
    <PageMetadata
      title={title}
      description={metadata.description}
      keywords={frontMatter.keywords}
      image={assets.image ?? frontMatter.image}
    />
  );
}
