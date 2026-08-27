---
title: Addons over existing maps
description: How an addon with no map of its own layers content onto an existing one, the route some of CS2's custom gamemodes take.
sidebar_position: 5
---

An addon does not have to ship a map. It can ship nothing but a script, entities, other files and a config file, and have the game load all of it on top of a map that already exists. That is how a custom gamemode can work in Counter-Strike 2: the addon launches a stock map, and the addon's content is mounted alongside it.

This page describes the mechanism rather than walking through building one. See [Addons](./index.mdx) for what an addon is in the first place.

## The idea

[Mounting](../../content-mounting.md) an addon puts its files in the search path alongside the game's own, so an addon that ships `materials/`, `scripts/` and `cfg/` but no `maps/` contributes those files to whatever map is running.

What remains is getting the addon's own entities into a level it does not own. Two games solve that differently:

| Game | How the overlay happens |
| --- | --- |
| Counter-Strike 2 | The addon ships a config file named after the map, which the game executes on load, and that config loads a small compiled map as an extra spawn group |
| Half-Life: Alyx | `addoninfo.txt` declares a `map_extensions` entry, and the engine loads the extension map whenever its parent map loads |

## Counter-Strike 2

As an example for how this works, you can inspect this workshop item using the <Tool name="s2v"/>: [Shoot With Nades by Lion Doge](https://steamcommunity.com/sharedfiles/filedetails/?id=3777436663). The concept is explained in detail below.

### Launching

You can launch such an addon with a console command:

```
map de_mirage customgamemode=3777436663
```

`customgamemode` names the **addon to mount**, not a gamemode. For a workshop item that is its published file id, the number in the item's URL. For a local addon it is the addon's own name, and the addon has to be one the game can mount: launched into it in tools mode, or started with `-addon <name>`. So a local addon named `custom_gamemode` loads on any map without opening a `.vmap` at all:

```
map de_mirage customgamemode=custom_gamemode
```

`changelevel` and `restart` take the same option, and everything after the map name is parsed as `key=value` options.

The menu does the same thing. Picking a workshop item sets a map group of the form `@workshop/<id>/<map>`, which the server turns into `map <map> customgamemode=<id> nomapvalidation=true`. The `<map>` half of that comes from the addon's own [`maps` key](#what-the-addon-declares) inside the addoninfo.txt! This decides the map an item launches on, rather than the game falling back to whatever map is packed inside it. See [Publishing](./index.mdx#publishing) for what happens when it does fall back.

:::info
`host_workshop_map` is a different thing: a dedicated server command that downloads a workshop item and hosts the map inside it. It cannot put an addon on top of someone else's map.
:::

### Why a config file runs

On level init the game checks whether any addon is mounted. If one is, it runs

```
exec maps/<mapname>.cfg
```

which resolves against the `GAME` search path as `cfg/maps/<mapname>.cfg`. So naming a config after a map, and mounting the addon makes it run when that map loads.

An addon that wants to work on many maps therefore ships one config per map, all with the same contents. In practice that config does two things: it execs a shared config holding the gamemode's rules, so the rules live in one file rather than in every copy, and it loads the payload below. [`cfg/maps`](../directory-layout.md#the-content-folders) is one of the directories a published item carries by default, see [Workshop packing](../../content-mounting.md#workshop-packing).

### Getting entities into the level

The config's job is to bring in the addon's own content:

```
spawn_group_load my_prefab
```

The thing being loaded is a **fully compiled map**, packed as a [VPK inside the addon](../../../FileFormats/vpk.md#maps-and-nesting)! `spawn_group_load` streams it into the running level as an additional spawn group, and its entities spawn. The name is the map's relative path under `maps/`, so where the map sits is a naming choice and nothing more.

That map is usually small. It exists to carry entities and NOT geometry: It can contain a [point_script](../../../Entities/point_script.mdx) to execute code and of course the gamemode's models, sounds, particles and scripts. Naturally, anything used in the script must be packed like ordinary addon files. The [Publishing](./index.mdx#publishing) section covers this.

### What the addon declares

The addon still has to declare a map in [`addoninfo.txt`](./index.mdx#addoninfo):

```
maps = [ "de_mirage" ]
```

The map it names is one the addon does not contain, which is what lets the item launch without packing a map of its own.

Because `maps` belongs to the addon rather than to a config, a gamemode covering several maps can be published either way. One item per map means uploading the same content repeatedly and changing only this key, so each copy opens on a different map. One item for all of them works as well: it opens on the map it advertises, and players reach the rest with the [command above](#launching).

## Half-Life: Alyx

:::todo
The `map_extensions` mechanism is not written up yet.
:::