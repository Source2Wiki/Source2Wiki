import React, { useState, useMemo } from 'react';
import entityData from '@site/static/fgd_dump/entityIndex.json';
import timestampData from '@site/dump/fgd/timestamp.json';
import { Games } from '@site/src/constants/software';
import styles from './styles.module.css';
import clsx from "clsx";
import Link from '@docusaurus/Link';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useGameParam } from '@site/src/contexts/GameParamContext';
import DateRender from "@site/src/components/DateRenderer";

interface Entity {
  Classname: string;
  Description: string;
  Icon: string;
  Games: string[];
}

// every game gets its own column slot in the Games cell
const gameKeys = Object.keys(Games).filter(key => key !== "any");

const EntityTable: React.FC = () => {
  const { gameParam, selectedGame } = useGameParam();
  const entities: Entity[] = entityData;
  const [searchTerm, setSearchTerm] = useState('');
  const isBrowser = useIsBrowser();

  const filteredEntities = useMemo(() => {
    let filtered = entities;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(entity => 
        entity.Classname.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Filter by the game chosen in the navbar
    if (selectedGame) {
      filtered = filtered.filter(entity => entity.Games.includes(gameParam));
    }

    return filtered;
  }, [entities, searchTerm, selectedGame, gameParam]);

  return (
    <div className={styles.entityTableContainer}>
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <input 
            className="navbar__search-input"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {filteredEntities.length === 0 ? (
        <div className={styles.noResults}>
          No entities found
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap'}}>
            <div className={styles.resultsCount} style={{ visibility: isBrowser ? 'visible' : 'hidden' }}>
              Showing {filteredEntities.length} of {entities.length} entities{selectedGame && ` in ${selectedGame.PrettyName}`}
            </div>
            <div className={styles.resultsCount} style = {{textAlign: 'right'}}>
              Last updated: <DateRender unix={timestampData} />
            </div>
           </div>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Classname</th>
                <th className={styles.description}>Description</th>
                <th className={styles.games}>Games</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntities.map((entity, index) => {
                return (
                  <tr key={index} className={styles.row}>
                    <td>
                      <Link to={`/Entities/${entity.Classname}`} className={styles.entityLink}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {entity.Icon && (
                            <img
                              src={entity.Icon}
                              alt=""
                              className="no-zoom"
                              // every row is in the DOM at once, so without this the browser fetches
                              // all four hundred odd icons the moment the page opens
                              loading="lazy"
                              decoding="async"
                              width={42}
                              height={42}
                              style={{ width: '42px', height: '42px' }}
                            />
                          )}
                          <code className={styles.code}>{entity.Classname}</code>
                        </div>
                      </Link>
                    </td>
                    <td className={styles.description} dangerouslySetInnerHTML={{ __html: entity.Description }} />
                    <td className={styles.games}>
                      <div className={styles.gamesIcons}>
                        {gameKeys.map((gameKey) => {
                          if (!entity.Games.includes(gameKey)) {
                            return <span key={gameKey} className={styles.gameSlot} />;
                          }

                          const game = Games[gameKey];
                          return (
                            <img
                              key={gameKey}
                              src={game.IconPath}
                              alt={game.PrettyName}
                              className={clsx(styles.gameIcon, "no-zoom")}
                            />
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default EntityTable;