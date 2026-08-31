import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type { PropSidebarItem } from '@docusaurus/plugin-content-docs';
import styles from './icon.module.css';

// the icon a doc's front matter image puts on its sidebar item, injected by
// sidebarItemsGenerator in docusaurus.config.ts, same source DocCardList reads

export function useSidebarItemIconSrc(item: PropSidebarItem): string | undefined
{
  const rawIcon = (item as { customProps?: { icon?: unknown } }).customProps?.icon;
  const iconImage = typeof rawIcon === 'string' ? rawIcon : undefined;
  const iconSrc = useBaseUrl(iconImage ?? '');
  return iconImage ? iconSrc : undefined;
}

export function SidebarItemIcon({ src }: { src: string }): React.JSX.Element
{
  return <img src={src} alt="" className={styles.icon} />;
}
