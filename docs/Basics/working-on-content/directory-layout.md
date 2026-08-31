---
title: Directory layout
description: Where each file type belongs in a Source 2 install.
sidebar_position: 3
---

import GameTabs from '@site/src/components/GameTabs'
import CS2Folders from './_folders_cs2.mdx'
import Todo from './_folders_todo.mdx'

The folder the engine mounts is not the Steam folder name, so substitute yours in every path below:

| Game | Steam folder | Mod directory |
| --- | --- | --- |
| Counter-Strike 2 | `Counter-Strike Global Offensive` | `csgo` |
| Dota 2 | `dota 2 beta` | `dota` |
| Deadlock | `Deadlock` | `citadel` |
| Half-Life: Alyx | `Half-Life Alyx` | `hlvr` |
| Aperture Desk Job | `Aperture Desk Job` | `steampal` |
| Dota Underlords | `Underlords` | `dac` |
| Artifact Classic | `Artifact` | `dcg` |
| Artifact Foundry | `Artifact 2.0` | `dcg` |

Two of the older titles do not follow the `game/` layout at all. The Lab keeps its Source 2 content in `RobotRepair/vr/`, and SteamVR Home nests it under `tools/steamvr_environments/game/`.

## Why the paths matter

The engine and the tools find assets by path. A folder name is part of an asset's identity: `materials/wall.vmat` compiles to `materials/wall.vmat_c`, and that exact string is what every material, model and map referring to it stores. Nothing searches the disk for a file that is not where its path says it is.

The practical consequence is that folders are not free to rearrange. Renaming or moving one after assets reference it breaks every reference at once, because those paths are stored as plain strings inside the [compiled files](../../FileFormats/index.mdx).

## The content folders

The same folder names appear on both sides of the install: authored under `content/`, compiled under `game/`, at the same relative path. What each one is for:

<GameTabs

        cs2 = {<CS2Folders/>}
        hla = {<Todo/>}
        dota2 = {<Todo/>}
        steamvr = {<Todo/>}

/>

## Addons

An [addon](./addons/index.mdx) is a mod directory of its own, using the same folder names, mounted on top of the main mod. Paths inside it are relative to the addon root, so `content/csgo_addons/my_addon/materials/wall.vmat` is referenced everywhere as `materials/wall.vmat`, exactly as if it shipped with the game. `content/csgo_addons/addon_template/` is the layout Valve ships as a starting point, and the other tools games carry the same template under their own addon directories.

Which of an addon's folders the game mounts, and in what order against the base game, is on [Content mounting](../content-mounting.md). Not every folder survives publishing either: by default the workshop packer keeps only the directories the main mod's `gameinfo.gi` lists and drops the rest without a warning, though that list can be edited, see [Workshop packing](../content-mounting.md#workshop-packing).