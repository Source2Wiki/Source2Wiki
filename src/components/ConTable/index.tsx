import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import cs2_data from '@site/dump/convars/condump_cs2.json'
import hla_data from '@site/dump/convars/condump_hla.json'
import steamvr_data from '@site/dump/convars/condump_steamvr.json'
import dota2_data from '@site/dump/convars/condump_dota2.json'
import styles from './styles.module.css';
import clsx from "clsx";
import DateRender from "@site/src/components/DateRenderer";
import { useLocation } from '@docusaurus/router';
import { convarUrl } from '@site/src/components/Convar/url';

interface ConTableProps {
  game?: string;
}
interface ConDump{
  Timestamp: number,
  Entries: ConEntry[]
}

interface ConEntry {
  Name: string
  DefaultValue: string
  Description: string;
  flags: string[];
  Cs2WorkshopWhitelisted: boolean
}

const getConRowId = (game: string, name: string) => `${game}-${name}`;

const getFormattedFlags = (flags: string[]) : string => flags.map(flag => flag.trim()).join(" | ");

// the rows never change after they are built, the linked row is highlighted by toggling a class
// on its element, so following a link never re-renders the thousands of rows in the table
const ConRow = React.memo(({ entry, game, onLink }: { entry: ConEntry, game: string, onLink: (name: string) => void }) => (
  <tr id={getConRowId(game, entry.Name)} className={styles.clickableRow}>

    <td>
       <a
         href={convarUrl(entry.Name, game)}
         className={styles.anchor}
         title="Link to this console variable"
         onClick={(e) => {
           // let ctrl/middle click open the link in a new tab like normal
           if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
           e.preventDefault();
           onLink(entry.Name);
         }}
       >
         <code className={styles.code} dangerouslySetInnerHTML={{ __html: entry.Name }}/>
       </a>
    </td>

    <td dangerouslySetInnerHTML={{ __html: entry.Description }} />

    <td>
       <code className={styles.code} dangerouslySetInnerHTML={{ __html: entry.DefaultValue }}/>
    </td>

    {
      entry.flags.length > 0 ? <td> <code className={styles.code} dangerouslySetInnerHTML={{ __html: getFormattedFlags(entry.flags)}}/> </td>
                             :
                               <td dangerouslySetInnerHTML={{ __html: getFormattedFlags(entry.flags)}}/>
    }

  </tr>
));

const ConTable: React.FC<ConTableProps> = ({ game }) => {
  const getConDataForGame = (gameKey?: string) => {
    switch (gameKey) {
      case 'cs2':
        return cs2_data;
      case 'hla':
        return hla_data;
      case 'dota2':
        return dota2_data;
      case 'steamvr':
        return steamvr_data;
      case 'default':
        return null;
    }
  };

  const conData = useMemo(() => getConDataForGame(game), [game]) as ConDump;
  const [searchTerm, setSearchTerm] = useState('');
  const [showWorkshopWhitelistedOnly, setShowWorkshopWhitelistedOnly] = useState(false);
  
  const filteredConData = useMemo(() => {
    
    if (!conData || !conData.Entries) return [];

    let filtered = conData.Entries;
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(conData => 
        conData.Name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by workshop whitelisted (CS2 only)
    if (game === 'cs2' && showWorkshopWhitelistedOnly) {
      filtered = filtered.filter(conData => conData.Cs2WorkshopWhitelisted === true);
    }
    
    return filtered;
  }, [conData, searchTerm, showWorkshopWhitelistedOnly, game]);

  // deep links look like /Convars?game=cs2#mp_team_intro_type, only the table matching ?game=
  // handles the hash, the others may be mounted but hidden behind their tabs
  const location = useLocation();
  const [link, setLink] = useState<{ name: string, count: number } | null>(null);
  const highlightedRow = useRef<HTMLElement | null>(null);
  // only scroll once per followed link, not again whenever the search filter changes
  const scrollPending = useRef(false);

  const linkTo = useCallback((name: string) => {
    // make sure no filter hides the row being linked to
    setSearchTerm('');
    setShowWorkshopWhitelistedOnly(false);
    // a new object every time, so following the same link again still scrolls back to it
    setLink(previous => ({ name, count: (previous?.count ?? 0) + 1 }));
    scrollPending.current = true;
  }, []);

  useEffect(() => {
    if (!location.hash || !conData?.Entries) return;

    // the game tabs fall back to the first tab, cs2, when there's no ?game=
    const linkedGame = new URLSearchParams(location.search).get('game') ?? 'cs2';
    if (linkedGame !== game) return;

    const name = decodeURIComponent(location.hash.slice(1));
    if (conData.Entries.some(entry => entry.Name === name)) linkTo(name);
  }, [location.hash, location.search, conData, game, linkTo]);

  // links clicked inside the table only update the address bar, going through the router would
  // re-render the whole page for what is just a highlight and a scroll
  const onRowLink = useCallback((name: string) => {
    window.history.replaceState(window.history.state, '', convarUrl(name, game ?? ''));
    linkTo(name);
  }, [game, linkTo]);

  // move the highlight and scroll once the unfiltered table has rendered the linked row
  useEffect(() => {
    if (!link) return;

    const row = document.getElementById(getConRowId(game ?? '', link.name));
    if (!row) return;

    highlightedRow.current?.classList.remove(styles.linkedRow);
    row.classList.add(styles.linkedRow);
    highlightedRow.current = row;

    if (scrollPending.current) {
      scrollPending.current = false;
      row.scrollIntoView({ block: 'center' });
    }
  }, [link, filteredConData, game]);

  const rows = useMemo(() => filteredConData.map((entry) => (
    <ConRow key={entry.Name} entry={entry} game={game ?? ''} onLink={onRowLink} />
  )), [filteredConData, game, onRowLink]);

  return (
    <div className={styles.table}>
      <div className={styles.searchBox}>
        <input 
          className={clsx("navbar__search-input", styles.input)} 
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {game === 'cs2' && (
          <label style={{ marginLeft: '15px', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showWorkshopWhitelistedOnly}
              onChange={(e) => setShowWorkshopWhitelistedOnly(e.target.checked)}
              style={{ marginRight: '5px', cursor: 'pointer' }}
            />
            Workshop Whitelisted Only
          </label>
        )}
      </div>
      {filteredConData.length === 0 ? (
        <div className={styles.noResults}>
          No console variables/commands found matching your filters
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap'}}>
            <div className={styles.resultsCount}>
              Showing {filteredConData.length} of {conData.Entries.length} console variables/commands
            </div>
            <div className={styles.resultsCount} style = {{textAlign: 'right',}}>
              Last updated: <DateRender unix={conData.Timestamp} />
            </div>
          </div>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Default Value</th>
                <th>Flags</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ConTable;