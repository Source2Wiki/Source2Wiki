---
sidebar_position: 11
title: Sounds
description: Implementing custom sounds.
---

Every custom sound or music in the map now has to be defined as a soundevent in the custom soundevent `.vsndevts` file. This `.sndevts` file has to be located in `content/<addon name>/soundevents/`.

First, make sure that the raw sound files are located in the correct directory under `contents/<addon name>/sounds/`.

:::info
In CS:GO sound files were located in `csgo/sound/` folder; notice the spelling difference between `sound` and `sounds`!
:::

If the addon was created in the tools launch menu, then an example `.sndevts` file named `soundevents_addon.vsndevts` is automatically created in this directory. Within this example file, several pre-defined soundevents are present that can be configured to your needs. This file also has detailed comments explaining some of the soundevent parameters, which can be helpful in determining what values to use.

If you wish to hear your custom soundevents in hammer and in game, then your `.vsndevts` file must be named `soundevents_addon.vsndevts`. Only soundevent file of this specific name is read by the game.

If you cannot hear the custom sounds in hammer [Asset Browser](/docs/EngineTools/AssetBrowser/getting-started.md) even if the soundevent file is named correctly as `soundevents_addon.sndevts`, then double check if the syntax within the file is correct and that the sound files have been compiled to `.vsnd_c`.

To play these custom sounds in game, create a [`point_soundevent`](/Entities/point_soundevent.mdx) entity which references a custom soundevent.

:::tip
You can set the volume of a soundevent higher than 1 to a maximum of 10. Don’t tell *Luffaren* that!
:::

In <Game name="cs2"/> there are three different types of soundevents:
* `csgo_mega` is a general soundevent type that you would use for the majority of sounds.
* `csgo_music` is specifically used for music
* `csgo_3d` is used for other general ambient sounds.

:::warning
`ambient_generic` is now considered obsolete and should not be used.
:::