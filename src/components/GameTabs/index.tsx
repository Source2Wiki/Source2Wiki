import React, { ReactNode } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import './style.css';
import { Games } from '@site/src/constants/software';
import { useGameParam } from '@site/src/contexts/GameParamContext';

const GameTabs: React.FC<Record<string, React.ReactNode>> = (props) => {
  const { gameParam, selectedGame: navbarGame } = useGameParam();
  const { withBaseUrl } = useBaseUrlUtils();
  const gameContent: Record<string, React.ReactNode> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (Games[key] && value && (React.isValidElement(value) || typeof value === 'object')) {
      gameContent[key] = value;
    }
  });

  if (!gameContent || typeof gameContent !== 'object') {
    throw new Error('GameTabs: No valid game content found in props');
  }

  const entries = Object.entries(gameContent);
  if (entries.length === 0) {
    throw new Error('GameTabs element without any tabs');
  }

  const isNavbarGameMissing = navbarGame !== undefined && !(gameParam in gameContent);

  if (entries.length === 1) {
    const [gameKey, content] = entries[0];
    const gameInfo = Games[gameKey];

    return (
      <>
        <p className="game-note">
          <img src={gameInfo.IconPath} alt="" width={16} height={16} />
          <span>{gameInfo.PrettyName} only</span>
          {isNavbarGameMissing && <span>(not available for {navbarGame.PrettyName})</span>}
        </p>
        {content}
      </>
    );
  }

  return (
    <>
      {isNavbarGameMissing && <p className="game-note">Not available for {navbarGame.PrettyName}</p>}
      <Tabs queryString="game" className="game-tabs">
        {entries.map(([gameKey, content]) => {
          const gameInfo = Games[gameKey];
          if (!gameInfo || !content) return null;
          return (
            <TabItem
              key={gameKey}
              value={gameKey}
              label={gameInfo.PrettyName}
              attributes={{style: {'--game-icon': `url(${withBaseUrl(gameInfo.IconPath)})`} as React.CSSProperties}}
            >
              {content}
            </TabItem>
          );
        })}
      </Tabs>
    </>
  );
};

export default GameTabs;
