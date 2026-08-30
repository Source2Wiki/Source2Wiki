// src/components/GameIcon.tsx
import React from 'react';
import { Games } from '@site/src/constants/software';
import { Tools } from '@site/src/constants/software';
import { Socials } from '@site/src/constants/software';
import { SoftwareInfo } from '@site/src/constants/software';
import { useColorMode } from '@docusaurus/theme-common';

interface SoftwareProps {
  name: string;
  size?: number | string; // icon size; defaults to 1em so it matches the surrounding text
  link?: string;
  iconOnly?: boolean;
  label?: string; // overrides the registered pretty name, e.g. a repo name on a github badge
}

export function Game(SoftwareProps: SoftwareProps)
{
  if (!SoftwareProps.name)
  {
    throw new Error(`name parameter missing from Game element`);
  }

  const softwateInfo = Games[SoftwareProps.name];

  if (!softwateInfo)
  {
    throw new Error(`Game name "${SoftwareProps.name}" is invalid, if you want to add a new game, go to src/constants/software`);
  }

  return GetSoftwareHtml(softwateInfo, SoftwareProps);
}

export function Tool(SoftwareProps: React.FC<SoftwareProps>)
{
  if (!SoftwareProps.name)
  {
    throw new Error(`name parameter missing from Tool element`);
  }

  const softwateInfo = Tools[SoftwareProps.name];

  if (!softwateInfo)
  {
    throw new Error(`Tool name "${SoftwareProps.name}" is invalid, if you want to add a new tool, go to src/constants/software`);
  }

  return GetSoftwareHtml(softwateInfo, SoftwareProps);
}

export function Social(SoftwareProps: React.FC<SoftwareProps>)
{
  if (!SoftwareProps.name)
  {
    throw new Error(`name parameter missing from Social element`);
  }

  const softwateInfo = Socials[SoftwareProps.name];

  if (!softwateInfo)
  {
    throw new Error(`Social name "${SoftwareProps.name}" is invalid, if you want to add a new social, go to src/constants/software`);
  }

  return GetSoftwareHtml(softwateInfo, SoftwareProps);
}

const GetSoftwareHtml = (softwateInfo: SoftwareInfo, {
  name,
  size,
  link,
  iconOnly,
  label
}: SoftwareProps): React.JSX.Element =>
{
  const { colorMode } = useColorMode(); // 'light' or 'dark'

  // color overlay for the background
  const overlayColor =
      colorMode === 'light'
        ? 'rgba(255, 255, 255, 0.3)' // lighten in light mode
        : 'rgba(0, 0, 0, 0.4)';      // slightly darken in dark mode

  // scales with the surrounding text unless an explicit size is given
  const iconSize = size === undefined ? '1em' : typeof size === 'number' ? `${size}px` : size;

  const showText = !iconOnly && Boolean(label || softwateInfo.PrettyName);

  const content = (
    <span
      style={{
        backgroundColor: softwateInfo.Color,
        borderRadius: '6px',
        display: 'inline-flex',
        verticalAlign: '-0.14em',
      }}
    >
      <span
        style={{
          backgroundColor: overlayColor,
          borderRadius: '6px',
          padding: '0 0.3em',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        {softwateInfo.IconPath && (
          <img
            src={softwateInfo.IconPath}
            alt={`${softwateInfo.PrettyName} icon`}
            style={{
              width: iconSize,
              height: iconSize,
              display: 'block',
            }}
          />
        )}
        {/* a zero-width space keeps text-less badges at the same height as labeled ones */}
        <span style={{ marginLeft: showText && softwateInfo.IconPath ? '0.25em' : undefined }}>
          {showText ? label ?? softwateInfo.PrettyName : '\u200B'}
        </span>
      </span>
    </span>
  );

  if(link === undefined && softwateInfo.Link)
  {
    link = softwateInfo.Link;
  }

  if (link) {
    return (
      <a 
        target="_blank" 
        rel="noopener noreferrer"
        href={link} 
        style={{ 
          textDecoration: 'none',
          color: 'inherit'
        }}
      >
        {content}
      </a>
    );
  }

  return content;
};