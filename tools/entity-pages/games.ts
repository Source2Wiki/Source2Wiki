/**
 * The games the wiki documents, taken from the same list the site renders tabs and icons from.
 * A game the site has no entry for could not be shown anyway, so that list decides.
 *
 * WikiPageTools keeps its own list, because finding an install and reading its FGDs needs an
 * app id and content paths that are no business of the wiki. The two only have to agree on
 * these names.
 */

import { Games } from "../../src/constants/software";

/** "any" is a filter option in the UI, not a game. */
export const gameList = Object.keys(Games).filter((game) => game !== "any");

export function getGameByFileSystemName(name: string | null | undefined): string | null {
  return name && gameList.includes(name) ? name : null;
}
