import React, { ReactNode } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import './style.css';
import { Games } from '@site/src/constants/software';

const GameTabs: React.FC<Record<string, React.ReactNode>> = (props) => {
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

  return (
    <Tabs queryString="game" className="game-tabs">
      {entries.map(([gameKey, content]) => {
        const gameInfo = Games[gameKey];
        if (!gameInfo || !content) return null;
        return (
          <TabItem
            key={gameKey}
            value={gameKey}
            label={gameInfo.PrettyName}
            attributes={{className: gameKey}}
          >
            {content}
          </TabItem>
        );
      })}
    </Tabs>
  );
};

export default GameTabs;