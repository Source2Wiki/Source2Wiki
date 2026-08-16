import { useGameParam } from '@site/src/contexts/GameParamContext';
import { Games } from '@site/src/constants/software';
import React from 'react';

export default function CustomSchemaExplorerLinkNavbarItem(): React.JSX.Element {
  const { gameParam } = useGameParam();

  const href = Games[gameParam]?.HasSchemaExplorer
    ? `https://s2v.app/SchemaExplorer/${gameParam}`
    : 'https://s2v.app/SchemaExplorer';

  return React.createElement(
    'a',
    {
      href: href,
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'navbar__item navbar__link custom-schema-explorer-link',
    },
    'Schema Explorer',
    React.createElement(
      'svg',
      {
        width: '8',
        height: '8',
        viewBox: '0 0 10 10',
        style: { marginLeft: '4px', marginBottom: `2px`, verticalAlign: 'middle', opacity: 0.6 },
        'aria-hidden': 'true',
      },
      React.createElement('path', {
        d: 'M1 9L9 1M9 1H3M9 1V7',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fill: 'none',
      })
    )
  );
}
