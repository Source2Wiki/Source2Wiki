// console variables and commands live in Source2Viewer's Schema Explorer, keyed by its own game names
export const CONVAR_EXPLORER_GAMES: Record<string, string> = {
  cs2: 'cs2',
  dota2: 'dota2',
  hla: 'hlvr',
};

export function convarListUrl(game: string = 'cs2'): string
{
  return `https://s2v.app/SchemaExplorer/${CONVAR_EXPLORER_GAMES[game]}/convars`;
}

export function convarUrl(name: string, game: string = 'cs2'): string
{
  return `${convarListUrl(game)}#name=${encodeURIComponent(name)}`;
}
