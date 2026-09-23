// the console variable list page, its game tabs pick the game from ?game= and ConTable
// scrolls to and highlights the convar named in the hash
export const CONVAR_PAGE = '/Convars';

export function convarUrl(name: string, game: string = 'cs2'): string
{
  return `${CONVAR_PAGE}?game=${game}#${encodeURIComponent(name)}`;
}
