import React from 'react';
import { useDoc, useSidebarBreadcrumbs } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Games } from '@site/src/constants/software';
import DiscordEmbed, { buttons, isEmbeddableImage, section, separator, text, toColor, WikiColor } from '.';
import type { EntityEmbed } from './types';

const DiscordInvite = 'https://discord.gg/W88PUtQKDY';
const GitHubRepo = 'https://github.com/Source2Wiki/Source2Wiki';

// the Discord link card of a doc: the homepage, an entity, or any other page
export default function DocEmbed(): React.JSX.Element
{
  const { metadata, frontMatter, assets } = useDoc();
  const breadcrumbs = useSidebarBreadcrumbs();
  const { siteConfig } = useDocusaurusContext();

  const absolute = (path: string) => new URL(path, siteConfig.url).href;
  const image = useBaseUrl(assets.image ?? frontMatter.image ?? '', { absolute: true });
  const thumbnail = isEmbeddableImage(image) ? image : null;
  const pageUrl = absolute(metadata.permalink);
  const entity = (frontMatter as { entity_embed?: EntityEmbed }).entity_embed;

  if (metadata.permalink === '/')
  {
    return (
      <DiscordEmbed
        color={WikiColor}
        description={metadata.description}
        render={description => [
          ...section(['## Source2 Wiki', description], absolute('/img/social-icon.png')),
          buttons(
            ['Basics', absolute('/Basics')],
            ['Entity List', absolute('/EntityList')],
            ['Discord', DiscordInvite],
            ['GitHub', GitHubRepo],
          ),
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

    return (
      <DiscordEmbed
        color={games.length === 1 ? toColor(Games[games[0].game].Color) : WikiColor}
        description={entity.description}
        render={description => [
          ...section([
            `-# ${games.map(entry => Games[entry.game].PrettyName).join(' · ')}`,
            `## ${metadata.title}`,
            description,
          ], thumbnail),
          separator(),
          text(sameStats
            ? statLines[0]
            : games.map((entry, i) => `**${Games[entry.game].PrettyName}**: ${statLines[i]}`).join('\n')),
          buttons(['Read on Source2 Wiki', pageUrl]),
        ]}
      />
    );
  }

  const trail = breadcrumbs?.slice(0, -1).map(item => item.label).join(' › ');
  const links: [string, string][] = [['Read on Source2 Wiki', pageUrl]];

  if (metadata.editUrl?.startsWith('https://github.com/'))
  {
    links.push(['Edit on GitHub', metadata.editUrl]);
  }

  return (
    <DiscordEmbed
      color={WikiColor}
      description={metadata.description}
      render={description => [
        ...section([trail ? `-# ${trail}` : '', `## ${metadata.title}`, description], thumbnail),
        buttons(...links),
      ]}
    />
  );
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
