---
title: Content mounting
description: How a Source 2 game finds and mounts its content, gameinfo.gi, search paths, addons, and what an addon can and cannot replace.
sidebar_position: 8
---

A Source 2 game does not reference `pak01_dir.vpk` by name anywhere. Mounting is configured by `gameinfo.gi` files, which list directories; the filesystem discovers the archives inside those directories. The [VPK format](../FileFormats/vpk.md) is documented separately.

## The gameinfo files

`gameinfo.gi` is a mod's configuration: its name, which directories it mounts, and the engine, renderer and tool settings it runs with. Every directory that can be launched as a mod has one, and directories that are only mounted as content do not.

Most games keep all of it in that one file. Counter-Strike 2 is the exception, splitting its configuration over three that layer on each other:

```
csgo/gameinfo.gi            name, search paths, addon configuration
└── csgo_imported/          settings for the content imported from CS:GO
    └── csgo_core/          renderer, scene system, Hammer, ModelDoc, compiler defaults
```

A file names the one it builds on with `LayeredOnMod`, and the child's keys win over the parent's. One key does not merge: `FileSystem/SearchPaths` is replaced outright rather than combined, so any layer that changes mounting has to restate the entire list. The override directories work the same way, and that is all they are: `csgo_lv`, `dota_koreana`, `citadel_french` and friends are a couple of lines naming the mod they layer on, plus a full search path list with themselves at the front.

Two more files sit alongside. `gameinfo_branchspecific.gi` holds the values that differ between Valve's internal branches, such as the Steam app id, so the main file can move between them unchanged. `core/gameinfo.gi` describes the shared `core` directory as a minimal mod of its own, and is only read if `core` is what gets launched.

:::warning
`gameinfo.gi` is an ordinary text file and editing it works, but it is a shipped game file. A client running with a modified one fails the signature check at launch and cannot join VAC secure servers until the original is back, which the next game update or a Steam file verification does for you. See [Modifying the game](./modifying-the-game.md#editing-shipped-files).
:::

## Search paths

The `FileSystem/SearchPaths` block defines every directory the engine mounts. Counter-Strike 2's:

```
FileSystem
{
    SearchPaths
    {
        Game_LowViolence  csgo_lv

        Game    csgo
        Game    csgo_imported
        Game    csgo_core
        Game    core

        Mod     csgo
        Mod     csgo_imported
        Mod     csgo_core

        AddonRoot          csgo_addons
        OfficialAddonRoot  csgo_community_addons
    }
}
```

Each keyword registers the directory under one or more **path IDs**, the labels the engine looks files up by:

| Keyword | Registers | Meaning |
| --- | --- | --- |
| `Game` | `GAME`, plus `CONTENT` for the source side | ordinary game content |
| `Mod` | `MOD` | the mod directory, for files that must come from this game only |
| `AddonRoot` | `ADDONS`, `CONTENTADDONS` | where addons are looked for, compiled and source side |
| `OfficialAddonRoot` | `OFFICIAL_ADDONS` | curated addons, checked before the normal ones |
| `Game_LowViolence` | `GAME` | a content override layer, used for the Perfect World build |

A few more exist for narrower purposes: `Write` and `GameBin` name where the game writes and where its binaries are, `Game_nonTools` is skipped when the engine runs as tools, and the `_Language` variants substitute the current language into the path.

## Archive discovery

When a directory becomes a search path, the filesystem globs it for `pak*_dir.vpk` and mounts every match as its own entry under the same path ID. The filename must be exactly thirteen characters with two decimal digits in the middle: `pak01_dir.vpk` through `pak99_dir.vpk` match, `pak1_dir.vpk` and `pakfoo_dir.vpk` do not. Numbered chunk files are resolved from the directory file that names them.

A single `Game csgo` line therefore mounts the game's entire content, and an additional `pak02_dir.vpk` placed next to Valve's archives is mounted automatically.

## Addons

An [addon](./working-on-content/addons/index.mdx) is mounted by name, by Workshop file id, or by absolute path, and registers under the same `GAME` path ID as the base game's directories. It is an additional search path, not a separate layer, which is what allows an addon file at a path the base game already uses to be loaded in place of the base file.

Two rules restrict what gets mounted:

- **Official addons take priority by name.** If `csgo_community_addons` contains an addon with the requested name, it is mounted and the normal addon roots are not consulted.
- **Retail clients require a packed addon.** `AddonConfig/RestrictFlatFileAddonsToTools` in `gameinfo.gi`, set in Counter-Strike 2, prevents the retail client from mounting an addon that is a loose directory; only the `.vpk` form is accepted. Tools mode ignores this restriction, so an addon under `content\csgo_addons\` can be loaded uncompiled in [Hammer](../EngineTools/HammerEditor/index.mdx).

The addon's source directory under `content\csgo_addons\` is additionally mounted under the `CONTENT` path ID. That path is used for asset lookup and compiling, not by the game. What an addon contains, folder by folder, is on [Directory layout](./working-on-content/directory-layout.md).

:::warning
Tools mode mounts exactly one addon, fixed when the tools are launched. A request to mount a different addon prints a warning and registers nothing: no `GAME` path and no `CONTENT` path. A subscribed map opened in the [Workshop Tools](./installS2Sdk/index.mdx) therefore renders untextured when its content belongs to a different addon than the one the tools were launched with, because its materials and models have no search path. Repacking the addon does not change this; the loose versus packed restriction does not apply in tools mode. Official maps load fine because their files are not packed in the map vpk, but inside the base game files.
:::

## Workshop packing

What a published workshop item contains is decided by the `AddonConfig/VpkDirectories` include and exclude list in the main mod's `gameinfo.gi`. The packer keeps only what the list names and drops the rest without a warning, which is why an asset that works locally can be missing from the published item.

That list is not a hard limit. `gameinfo.gi` is a text file in the game directory, so adding an `"include"` line and packing again publishes whatever you point it at, including directories Valve never listed. What makes it awkward rather than free is that the edit does not survive: a game update rewrites the file, and so does verifying the game files, so it has to be redone after every patch. An edited `gameinfo.gi` also keeps you off official servers for as long as it is in place, see [Modifying the game](./modifying-the-game.md#editing-shipped-files).

Counter-Strike 2's list as shipped:

```
AddonConfig
{
    "VpkDirectories"
    {
        "exclude"       "maps/content_examples"
        "include"       "maps"
        "include"       "cfg/maps"
        "include"       "materials"
        "include"       "models"
        "include"       "panorama/images/overheadmaps"
        "include"       "panorama/images/map_icons"
        "include"       "panorama/layout/custom_game"
        "include"       "panorama/styles/custom_game"
        "include"       "particles"
        "include"       "resource/overviews"
        "include"       "scripts"
        "include"       "sounds"
        "include"       "soundevents"
        "include"       "lighting/postprocessing"
        "include"       "postprocess"
        "include"       "addoninfo.txt"
    }
    "AllowAddonDownload" "1"
    "AllowAddonDownloadForDemos" "1"
    "DisableAddonValidationForDemos" "1"
    "UseOfficialAddons" "1"
    "RestrictFlatFileAddonsToTools" "1"
}
```

Of the current games only CS2 carries a `VpkDirectories` block. The sibling keys in `AddonConfig` control addon behavior at runtime: official addon priority, the packed addon requirement covered above, and the addon download switches.
