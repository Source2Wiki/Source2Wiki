import React, { useState, useMemo, useRef, useEffect } from 'react';
import entityData from '@site/static/fgd_dump/entityIndex.json';
import timestampData from '@site/fgd_dump/timestamp.json';
import { Games } from '@site/src/constants/software';
import styles from './styles.module.css';
import clsx from "clsx";
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import DateRender from "@site/src/components/DateRenderer";

interface Entity {
  Classname: string;
  Description: string;
  Icon: string;
  Games: string[];
}
const EntityTable: React.FC = () => {
  const location = useLocation();
  const entities: Entity[] = entityData;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [showGamePopup, setShowGamePopup] = useState(false);
  const [maxIconWidth, setMaxIconWidth] = React.useState(0);
  const popupRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gameParam = params.get("game");
  
    if (gameParam && Games[gameParam] && gameParam !== "any") {
      setSelectedGames([gameParam]);
    }
    else if (!gameParam || gameParam === "any") {
      setSelectedGames([]);
    }
  }, [location.search]);

  
  const filteredEntities = useMemo(() => {
    let filtered = entities;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(entity => 
        entity.Classname.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Filter by selected games
    if (selectedGames.length > 0) {
      filtered = filtered.filter(entity => 
        entity.Games.some(game => selectedGames.includes(game))
      );
    }
    
    return filtered;
  }, [entities, searchTerm, selectedGames]);

  // Get visible games for each entity (filtered by selected games)
  const getVisibleGames = (entityGames: string[]) => {
    if (selectedGames.length === 0) {
      return entityGames.filter(game => game !== "any");
    }
    return entityGames.filter(game => selectedGames.includes(game) && game !== "any");
  };

  React.useEffect(() => {
    // Calculate max width based on visible games only
    const maxIcons = Math.max(...filteredEntities.map(entity => {
      const visibleGames = getVisibleGames(entity.Games);
      return visibleGames.length;
    }));
    const calculatedWidth = (32 * maxIcons) + 32;
    setMaxIconWidth(calculatedWidth);
  }, [filteredEntities, selectedGames]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowGamePopup(false);
      }
    };

    if (showGamePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGamePopup]);

  const toggleGame = (gameKey: string) => {
    setSelectedGames(prev => 
      prev.includes(gameKey)
        ? prev.filter(g => g !== gameKey)
        : [...prev, gameKey]
    );
  };

  const clearFilters = () => {
    setSelectedGames([]);
  };

  const selectAllGames = () => {
    setSelectedGames(Object.keys(Games).filter(key => key !== "any"));
  };

  return (
    <div className={styles.entityTableContainer}>
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <input 
            className={clsx("navbar__search-input", styles.input)} 
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterBox} ref={popupRef}>
          <button 
            className={clsx(styles.filterButton, { [styles.active]: showGamePopup })}                    
            onClick={() => setShowGamePopup(!showGamePopup)}
          >
            <div className={styles.filterButtonContent}>
              <svg
                className={styles.filterIcon}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 -960 960 960"
                fill="currentColor"
              >
                <path d="M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160h-80Zm40-308 198-252H282l198 252Zm0 0Z" />
              </svg>
              <span>
                Filter by Game {selectedGames.length > 0 && `(${selectedGames.length})`}
              </span>
            </div>
          </button>
          
          {showGamePopup && (
            <div className={styles.gamePopup}>
              <div className={styles.popupHeader}>
                <span className={styles.popupTitle}>Select Games</span>
                <div className={styles.popupActions}>
                  <button 
                    className={styles.popupActionButton}
                    onClick={selectAllGames}
                  >
                    Select All
                  </button>
                  <button 
                    className={styles.popupActionButton}
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className={styles.gameList}>
                {Object.entries(Games)
                  .filter(([key]) => key !== "any")
                  .map(([key, game]) => (
                  <label key={key} className={styles.gameCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedGames.includes(key)}
                      onChange={() => toggleGame(key)}
                    />
                    <img
                      src={game.IconPath}
                      alt={game.PrettyName}
                      className={styles.gameIcon}
                    />
                    <span>{game.PrettyName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {filteredEntities.length === 0 ? (
        <div className={styles.noResults}>
          No entities found matching your filters
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap'}}>
            <div className={styles.resultsCount}>
              Showing {filteredEntities.length} of {entities.length} entities
            </div>
            <div className={styles.resultsCount} style = {{textAlign: 'right'}}>
              Last updated: <DateRender unix={timestampData} />
            </div>
           </div>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Classname</th>
                <th>Description</th>
                <th style={{ width: `${maxIconWidth}px`, minWidth: `${maxIconWidth}px` }}>Games</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntities.map((entity, index) => {
                const visibleGames = getVisibleGames(entity.Games);
                
                return (
                  <tr key={index} className={styles.clickableRow}>
                    <td>
                      <Link to={`/Entities/${entity.Classname}`} className={styles.entityLink}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {entity.Icon && (
                            <img 
                              src={entity.Icon}
                              alt={entity.Classname}
                              style={{ width: '32px', height: '32px' }}
                            />
                          )}
                          <code className={styles.code}>{entity.Classname}</code>
                        </div>
                      </Link>
                    </td>
                    <td dangerouslySetInnerHTML={{ __html: entity.Description }} />
                    <td style={{ width: `${maxIconWidth}px`, minWidth: `${maxIconWidth}px` }}>
                      <div className={styles.gamesIcons}>
                        {visibleGames.map((gameKey) => {
                          const game = Games[gameKey];
                          if (!game) return null;
                          return (<img 
                                  key={gameKey}
                                  src={game.IconPath} 
                                  alt={game.PrettyName}
                                  className={styles.gameIcon}/>);
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