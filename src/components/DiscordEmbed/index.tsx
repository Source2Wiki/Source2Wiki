import React from 'react';
import Head from '@docusaurus/Head';

// Discord's component link embeds, the card Discord shows for a posted link in place of the one it
// builds from the og: tags, https://github.com/discord/discord-api-docs/pull/8606
// Discord's crawler doesn't run javascript, so this only works because the head is prerendered

export type Component = Record<string, unknown>;

// Discord drops the whole card over this, and falls back to the og: tags
const MaxBytes = 3000;

// the only image types Discord will show, svgs don't make it
const ImageExtensions = /\.(png|gif|jpe?g|webp|avif)$/i;

export const WikiColor = 0xf57807;

export function text(content: string): Component
{
  return { type: 10, content };
}

export function separator(): Component
{
  return { type: 14 };
}

export function buttons(...links: [label: string, url: string][]): Component
{
  return { type: 1, components: links.map(([label, url]) => ({ type: 2, style: 5, label, url })) };
}

// a section holds 1-3 texts with the thumbnail beside them, without one the texts go in on their own
export function section(texts: string[], thumbnail: string | null): Component[]
{
  const contents = texts.filter(Boolean).map(text);

  return thumbnail
    ? [{ type: 9, components: contents, accessory: { type: 11, media: { url: thumbnail } } }]
    : contents;
}

export function isEmbeddableImage(url: string | null | undefined): url is string
{
  return !!url && ImageExtensions.test(new URL(url, 'https://x').pathname);
}

// "#ff981aff" to 0xff981a, the alpha is of no use to Discord
export function toColor(hex: string | undefined): number
{
  return hex ? parseInt(hex.replace('#', '').slice(0, 6), 16) : WikiColor;
}

interface DiscordEmbedProps {
  color: number;
  // the only part that shrinks when the card is over Discord's size limit
  description: string;
  render: (description: string) => Component[];
}

export default function DiscordEmbed({ color, description, render }: DiscordEmbedProps): React.JSX.Element | null
{
  const json = fit(color, description, render);

  if (json === null)
  {
    return null;
  }

  return (
    <Head>
      <script id="discord:component-embed" type="application/json">{json}</script>
    </Head>
  );
}

function fit(color: number, description: string, render: DiscordEmbedProps['render']): string | null
{
  for (let length = description.length; ; length = Math.floor(length * 0.8))
  {
    // < escaped so nothing in a description can close the script tag
    const json = JSON.stringify({
      component: { type: 17, accent_color: color, components: render(shorten(description, length)) },
    }).replaceAll('<', '\\u003c');

    if (new TextEncoder().encode(json).length <= MaxBytes)
    {
      return json;
    }

    if (length === 0)
    {
      return null;
    }
  }
}

function shorten(description: string, length: number): string
{
  if (length >= description.length)
  {
    return description;
  }

  if (length < 20)
  {
    return '';
  }

  const cut = description.slice(0, length);
  const wordEnd = cut.lastIndexOf(' ');

  return `${(wordEnd > 0 ? cut.slice(0, wordEnd) : cut).trimEnd()}…`;
}
