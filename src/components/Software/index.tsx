import React from 'react';
import { Games, Tools, Socials, SoftwareInfo } from '@site/src/constants/software';
import styles from './styles.module.css';

interface SoftwareProps {
  name: string;
  size?: number | string; // icon size; defaults to 1em so it matches the surrounding text
  link?: string;
  iconOnly?: boolean;
  label?: string; // overrides the registered pretty name, e.g. a repo name on a github badge
}

export function Game(props: SoftwareProps)
{
  return GetRegisteredSoftwareHtml(Games, 'Game', props);
}

export function Tool(props: SoftwareProps)
{
  return GetRegisteredSoftwareHtml(Tools, 'Tool', props);
}

export function Social(props: SoftwareProps)
{
  return GetRegisteredSoftwareHtml(Socials, 'Social', props);
}

const GetRegisteredSoftwareHtml = (registry: Record<string, SoftwareInfo>, kind: string, props: SoftwareProps): React.JSX.Element =>
{
  if (!props.name)
  {
    throw new Error(`name parameter missing from ${kind} element`);
  }

  const softwareInfo = registry[props.name];

  if (!softwareInfo)
  {
    throw new Error(`${kind} name "${props.name}" is invalid, if you want to add a new ${kind.toLowerCase()}, go to src/constants/software`);
  }

  return GetSoftwareHtml(softwareInfo, props);
}

const GetSoftwareHtml = (softwareInfo: SoftwareInfo, {size, link, iconOnly, label}: SoftwareProps): React.JSX.Element =>
{
  // scales with the surrounding text unless an explicit size is given
  const iconSize = size === undefined ? '1em' : typeof size === 'number' ? `${size}px` : size;

  const showText = !iconOnly && Boolean(label || softwareInfo.PrettyName);

  const content = (
    <span
      className={styles.badge}
      style={{ backgroundColor: softwareInfo.Color }}
      title={iconOnly ? softwareInfo.PrettyName : undefined}
    >
      <span className={styles.inner}>
        {softwareInfo.IconPath && (
          <img
            src={softwareInfo.IconPath}
            alt={`${softwareInfo.PrettyName} icon`}
            className={styles.icon}
            style={{ width: iconSize, height: iconSize }}
          />
        )}
        {/* a zero-width space keeps text-less badges at the same height as labeled ones */}
        <span className={showText && softwareInfo.IconPath ? styles.labelWithIcon : undefined}>
          {showText ? label ?? softwareInfo.PrettyName : '\u200B'}
        </span>
      </span>
    </span>
  );

  if (link === undefined && softwareInfo.Link)
  {
    link = softwareInfo.Link;
  }

  if (link) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={link}
        className={styles.link}
        aria-label={iconOnly ? softwareInfo.PrettyName : undefined}
      >
        {content}
      </a>
    );
  }

  return content;
};
