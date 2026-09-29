import { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { useGameParam } from '@site/src/contexts/GameParamContext';
import { CONVAR_EXPLORER_GAMES, convarListUrl, convarUrl } from './url';

// sends the reader straight to the Schema Explorer's convar list for the selected wiki game,
// games it has no list for fall back to cs2
export default function ConvarRedirect(): null
{
  const location = useLocation();
  const { gameParam } = useGameParam();

  useEffect(() => {
    // the url is read first, the context only catches up with it after this page mounts
    let game = new URLSearchParams(location.search).get('game') ?? gameParam;
    let name = decodeURIComponent(location.hash.slice(1));

    // links from when this page had its own table: /Convars?game=cs2#mp_roundtime, and before
    // that the row ids, /Convars#cs2-mp_roundtime
    const rowId = name.match(/^(cs2|hla|dota2|steamvr)-(.+)$/);
    if (rowId)
    {
      [, game, name] = rowId;
    }

    if (!CONVAR_EXPLORER_GAMES[game])
    {
      game = 'cs2';
    }

    window.location.replace(name ? convarUrl(name, game) : convarListUrl(game));
  }, []);

  return null;
}
