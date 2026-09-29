import React from 'react';
import { filterDocCardListItems, useDoc, useDocsVersion, useSidebarBreadcrumbs } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Games } from '@site/src/constants/software';
import { getListEntry } from '@site/src/theme/DocCardList';
import DiscordEmbed, { buttons, gallery, isEmbeddableImage, section, separator, text, toColor, WikiColor } from '.';
import type { EntityEmbed } from './types';

type ListEntry = NonNullable<ReturnType<typeof getListEntry>>;

const DiscordInvite = 'https://discord.gg/W88PUtQKDY';
const GitHubRepo = 'https://github.com/Source2Wiki/Source2Wiki';

// the Discord link card of a doc: the homepage, an entity, or any other page
export default function DocEmbed(): React.JSX.Element
{
  const { metadata, frontMatter, assets } = useDoc();
  const { siteConfig } = useDocusaurusContext();
  const trail = useTrail();

  const absolute = (path: string) => new URL(path, siteConfig.url).href;
  const image = useBaseUrl(assets.image ?? frontMatter.image ?? '', { absolute: true });
  const pageUrl = absolute(metadata.permalink);
  const entity = (frontMatter as { entity_embed?: EntityEmbed }).entity_embed;

  if (metadata.permalink === '/')
  {
    return (
      <DiscordEmbed
        color={WikiColor}
        description={metadata.description}
        render={description => [
          ...section(['## Source2 Wiki', description], null),
          // the site wide social card, what the homepage embedded before this card existed
          gallery(absolute(siteConfig.themeConfig.image as string)),
          // Discord allows 5 buttons a row, and drops the whole card over it
          buttons(
            ['Basics', absolute('/Basics')],
            ['How to edit', absolute('/category/how-to-edit')],
            ['Editor Tools', absolute('/EngineTools')],
            ['Entity List', absolute('/EntityList')],
            ['Community Guides', absolute('/CommunityGuides')],
          ),
          buttons(['Discord', DiscordInvite], ['GitHub', GitHubRepo]),
        ]}
      />
    );
  }

  if (entity)
  {
    // the page is static, so the card can't follow the ?game= of the link, it covers every game
    // and only takes a game's colour when that is the only one
    const games = entity.games.filter(entry => Games[entry.game]);
    const statLines = games.map(entry => stats(entry));
    const sameStats = statLines.every(line => line === statLines[0]);
    // model renders go full width under the text, like the og: embed showed them, sprites stay beside it
    const largeIcon = entity.largeIcon && isEmbeddableImage(image);

    return (
      <DiscordEmbed
        color={games.length === 1 ? toColor(Games[games[0].game].Color) : WikiColor}
        description={entity.description}
        render={description => [
          ...section([
            `${trail}\n-# ${games.map(entry => Games[entry.game].PrettyName).join(' · ')}`,
            `## ${metadata.title}`,
            description,
          ], largeIcon ? null : thumbnail(image, siteConfig.url)),
          ...(largeIcon ? [gallery(image)] : []),
          separator(),
          text(sameStats
            ? statLines[0]
            : games.map((entry, i) => `**${Games[entry.game].PrettyName}**: ${statLines[i]}`).join('\n')),
          buttons(['Read on Source2 Wiki', pageUrl]),
        ]}
      />
    );
  }

  return (
    <PageEmbed
      title={metadata.title}
      description={metadata.description}
      permalink={metadata.permalink}
      image={image}
      editUrl={metadata.editUrl}
    />
  );
}

interface PageEmbedProps {
  title: string;
  description: string;
  permalink: string;
  // absolute, or empty for none
  image: string;
  editUrl?: string | null;
}

// the card of any page that is neither the homepage nor an entity, also used by the category
// pages docusaurus generates, see src/theme/DocCategoryGeneratedIndexPage
export function PageEmbed({ title, description, permalink, image, editUrl }: PageEmbedProps): React.JSX.Element
{
  const breadcrumbs = useSidebarBreadcrumbs();
  const { siteConfig } = useDocusaurusContext();
  const { docs } = useDocsVersion();
  const trail = useTrail();

  const absolute = (path: string) => new URL(path, siteConfig.url).href;

  // a category's own page lists what is inside it under "In this section", so does its card
  const category = breadcrumbs?.at(-1);
  const entries = category?.type === 'category' && category.href === permalink
    ? filterDocCardListItems(category.items)
      .map(item => getListEntry(item, item.type === 'link' && item.docId ? docs[item.docId]?.description : undefined))
      .filter((entry): entry is ListEntry => entry !== null)
    : [];

  const links: [string, string][] = [['Read on Source2 Wiki', absolute(permalink)]];

  if (editUrl?.startsWith('https://github.com/'))
  {
    links.push(['Edit on GitHub', editUrl]);
  }

  return (
    <DiscordEmbed
      color={WikiColor}
      description={description}
      // the list gives way first: its descriptions, then its items from the end
      levels={entries.length + 2}
      render={(description, level) => [
        ...section([trail, `## ${title}`, description], thumbnail(image, siteConfig.url)),
        ...(entries.length > 0 ? [separator(), text(sectionList(entries, level, absolute))] : []),
        buttons(...links),
      ]}
    />
  );
}

// "Source2 Wiki › Editor Tools › Hammer", the site name leads so every card says whose it is
function useTrail(): string
{
  const breadcrumbs = useSidebarBreadcrumbs();
  const { siteConfig } = useDocusaurusContext();

  return `-# ${[siteConfig.title, ...(breadcrumbs ?? []).slice(0, -1).map(item => item.label)].join(' › ')}`;
}

// pages without an image of their own still get the wiki's, so the card reads as the wiki's
function thumbnail(image: string, siteUrl: string): string
{
  return isEmbeddableImage(image) ? image : new URL('/img/social-icon.png', siteUrl).href;
}

function sectionList(entries: ListEntry[], level: number, absolute: (path: string) => string): string
{
  const shown = level < 2 ? entries : entries.slice(0, entries.length - (level - 1));
  const lines = shown.map(({ href, label, description }) =>
    `- [${label.replace(/[[\]]/g, '\\$&')}](${absolute(href)})${level === 0 && description ? ` - ${description}` : ''}`);

  if (shown.length < entries.length)
  {
    lines.push(`-# and ${entries.length - shown.length} more`);
  }

  return ['**In this section**', ...lines].join('\n');
}

function stats({ type, keyvalues, inputs, outputs }: EntityEmbed['games'][number]): string
{
  return [
    type && `${type} Entity`,
    count(keyvalues, 'keyvalue'),
    count(inputs, 'input'),
    count(outputs, 'output'),
  ].filter(Boolean).join(' · ');
}

function count(amount: number, name: string): string
{
  return `${amount} ${name}${amount === 1 ? '' : 's'}`;
}
