/**
 * The games the wiki documents.
 *
 * Kept in step by hand with GameFinder.GameList in WikiPageTools. Only the two fields page
 * generation needs live here: locating an install and reading its VPKs is the dumper's job,
 * everything this side needs is already in \fgd_dump.
 */

export interface Game {
  readonly name: string;
  readonly fileSystemName: string;
}

export const gameList: readonly Game[] = [
  { name: "Counter-Strike 2", fileSystemName: "cs2" },
  { name: "Half-Life: Alyx", fileSystemName: "hla" },
  { name: "Dota 2", fileSystemName: "dota2" },
  { name: "SteamVR Home", fileSystemName: "steamvr" },
];

export function getGameByFileSystemName(name: string | null | undefined): Game | null {
  if (!name) {
    return null;
  }

  return gameList.find((game) => game.fileSystemName === name) ?? null;
}
