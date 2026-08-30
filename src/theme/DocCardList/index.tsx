import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  useCurrentSidebarSiblings,
  filterDocCardListItems,
  useDocById,
  findFirstSidebarItemLink,
} from '@docusaurus/plugin-content-docs/client';
import { extractLeadingEmoji } from '@docusaurus/theme-common/internal';
import type { PropSidebarItem } from '@docusaurus/plugin-content-docs';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

// replaces the default card grid with a plain "In this section" style list,
// the page title as a link followed by its description

// categories without a description list what is inside them, capped at 5 names
const maxCategoryChildren = 5;

function DocCardListForCurrentSidebarCategory({ className }: { className?: string })
{
  const items = useCurrentSidebarSiblings();
  return <DocCardList items={items} className={className} />;
}


const getCategoryChildrenSummary = (children: PropSidebarItem[]): string =>
{
  const labels = children
    .filter((child): child is Exclude<PropSidebarItem, { type: 'html' }> => child.type !== 'html')
    .map(child => extractLeadingEmoji(child.label).rest.trim() || child.label);
  return labels.slice(0, maxCategoryChildren).join(', ') + (labels.length > maxCategoryChildren ? ` and ${labels.length - maxCategoryChildren} more` : '');
};

function DocListItem({ item }: { item: PropSidebarItem })
{
  const doc = useDocById(item.type === 'link' ? item.docId : undefined);

  // an image from the doc's front matter acts as the page/category icon,
  // resolved here because hooks may not run after the early returns below
  const rawIcon = (item as { customProps?: { icon?: unknown } }).customProps?.icon;
  const iconImage = typeof rawIcon === 'string' ? rawIcon : undefined;
  const iconSrc = useBaseUrl(iconImage ?? '');

  // raw html sidebar items carry no label/description, filterDocCardListItems
  // already drops them at runtime, this narrows the type for the accesses below
  if (item.type === 'html')
  {
    return null;
  }

  const href = item.type === 'category'
    ? (item.href ?? findFirstSidebarItemLink(item))
    : item.href;

  if (!href)
  {
    return null;
  }

  // a leading emoji in the label works as a fallback icon
  const { emoji, rest } = extractLeadingEmoji(item.label);
  const label = rest.trim() || item.label;

  const description = item.description
    ?? (item.type === 'category'
      ? getCategoryChildrenSummary(item.items)
      : doc?.description);

  return (
    <li className={styles.item}>
      {iconImage
        ? <img src={iconSrc} alt="" className={clsx(styles.iconImage, 'no-zoom')} />
        : emoji && <span className={styles.icon}>{emoji}</span>}
      <Link to={href}>{label}</Link>
      {description && <> - {description}</>}
    </li>
  );
}

export default function DocCardList(props: { items?: PropSidebarItem[], className?: string }): React.JSX.Element
{
  const { items, className } = props;

  if (!items)
  {
    return <DocCardListForCurrentSidebarCategory className={className} />;
  }

  const filteredItems = filterDocCardListItems(items);

  return (
    <>
      <Heading as="h2" id="in-this-section">In this section</Heading>
      <ul className={clsx(styles.list, className)}>
        {filteredItems.map((item, index) => (
          <DocListItem key={index} item={item} />
        ))}
      </ul>
    </>
  );
}
