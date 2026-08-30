export interface SoftwareInfo
{
    PrettyName: string,
    IconPath?: string,
    Color?: string,
    Link?: string,
    HasSchemaExplorer?: boolean
}

export const Games: Record<string, SoftwareInfo> = {
  "cs2": {PrettyName: "Counter-Strike 2", IconPath: "/img/cs2_icon.png", Color: "#ff981aff", Link: "https://www.counter-strike.net/cs2", HasSchemaExplorer: true},
  "hla": {PrettyName: "Half-Life: Alyx", IconPath: "/img/hla_icon.png", Color: "#0fb4a3ff", Link: "https://www.half-life.com/en/alyx"},
  "dota2": {PrettyName: "Dota 2", IconPath: "/img/dota2_icon.png", Color: "#941818ff", Link: "https://www.dota2.com/", HasSchemaExplorer: true},
  "steamvr": {PrettyName: "Steam VR", IconPath: "/img/steamvr_icon.png", Color: "#5735a6ff", Link: "https://store.steampowered.com/app/250820/SteamVR/"},
  "any": {PrettyName: "Any game"}
};

export const Tools: Record<string, SoftwareInfo> = {
  "s2v": {PrettyName: "Source2 Viewer", IconPath: "/img/tools/s2v.png", Color: "#1bb072ff", Link: "https://s2v.app/"},
  "radgen": {PrettyName: "RadGen", IconPath: "/img/tools/radgen.png", Color: "#91513a", Link: "https://radargenerator.github.io/"},
  "github": {PrettyName: "GitHub", IconPath: "/img/tools/github.png", Color: "#c3c3c3ff", Link: "https://github.com/"},
  "ts": {PrettyName: "TypeScript", IconPath: "/img/tools/typescript.png", Color: "#607993ff", Link: "https://www.typescriptlang.org/" },
  "js": {PrettyName: "JavaScript", IconPath: "/img/tools/javascript.png", Color: "#978d27ff", Link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" }
};

export const Socials: Record<string, SoftwareInfo> = {
  "discord": {PrettyName: "Discord", IconPath: "/img/socials/discord.svg", Color: "#494b5fff", Link: "https://discord.com/"},
};