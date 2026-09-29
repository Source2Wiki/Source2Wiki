import React from 'react';
import DocCategoryGeneratedIndexPage from '@theme-original/DocCategoryGeneratedIndexPage';
import type { Props } from '@theme/DocCategoryGeneratedIndexPage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { PageEmbed } from '@site/src/components/DiscordEmbed/DocEmbed';

// wrapped to give the category pages docusaurus generates, like /category/how-to-edit, the same
// Discord link card as every doc, docs get theirs from src/theme/DocItem/Metadata
export default function DocCategoryGeneratedIndexPageWrapper(props: Props): React.JSX.Element
{
  const { title, description, permalink, image } = props.categoryGeneratedIndex;

  return (
    <>
      <DocCategoryGeneratedIndexPage {...props} />
      <PageEmbed
        title={title}
        description={description ?? ''}
        permalink={permalink}
        image={useBaseUrl(image ?? '', { absolute: true })}
      />
    </>
  );
}
