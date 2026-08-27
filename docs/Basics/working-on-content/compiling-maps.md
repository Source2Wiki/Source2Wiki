---
title: Compiling maps
description: What a map build produces, what it reuses from the previous build, and what to rebuild after each kind of change.
sidebar_position: 4
---

## Incremental compiles

Compiles in Source 2 are incremental. That means compiling something twice does not necessarily do the work twice. A map build skips stages depending on your compile settings, and nothing else is checked: the compiler never asks which parts of the map changed.

The first compile is the exception. Nothing exists to reuse, so everything is built, and that one can be slow on a large map. Every build after it is as long as your compile settings make it.

## What a build produces

A map compile is not one operation but a list of stages, each writing its own files into the map's `.vpk`. Hammer's [Build Map dialog](../../EngineTools/MapCompiler/index.mdx) is a checkbox per stage, and its presets are nothing more than preset checkbox states. What gets built is the map as it stands the moment you press Build; carry on editing while the compile runs and those changes go into the next build, not this one.

| Stage | Produces | Runs on | Notes |
| --- | --- | --- | --- |
| World | the world itself: `world.vwrld_c` and the world nodes holding the geometry | CPU | visibility and lighting are computed inside it |
| [Visibility](../../EngineTools/HammerEditor/visibility.md) | `world_visibility.vvis_c`, the data that decides what is culled | CPU | runs inside the world stage |
| Entities | the entity lumps under `entities/` | CPU | always brings the world stage with it |
| Physics | `world_physics.vmdl_c`, the collision the player actually touches | CPU | |
| Baked lighting | `lightmaps/*.vtex_c`, one per lightmap channel | GPU | runs inside the world stage |
| LOD | the reduced meshes the world nodes fall back to at distance | CPU | |
| Nav, Grid nav | `<map>.nav`, the mesh bots navigate on | CPU | |
| Steam Audio | reverb, pathing and custom data bakes, `<map>.verb` and friends | CPU, optionally GPU | |

**The time goes into visibility and lighting**, and on a high quality compile both take long. Visibility on the CPU, lighting path traced on the GPU. Building the geometry itself is quick by comparison.

The compiler prints no per stage timings by default. Setting `resourcecompiler_log_compile_stats` makes it report `Compile stats:` and a total at the end of a build, which is the way to find out where your map actually spends its time.

The important structural fact is in the notes column: **visibility and lighting are not stages you can run on their own.** They are computed inside the world stage, so anything that rebuilds geometry rebuilds both.

## What survives between builds

Every build begins by copying the previously compiled [`<map>.vpk`](../../FileFormats/vpk.md) to a temporary directory, and the compiler unzips that package into a staging tree before any stage runs. Stages write into that same tree, and at the end the whole tree is packed back into a new VPK.

Everything the previous build produced is therefore still there, and only the stages you enabled overwrite their part of it. That is the entire mechanism. Visibility survives a build that leaves it out, not because it is cached, but because last build's `world_visibility.vvis_c` was unzipped into the staging tree and nothing replaced it. The same goes for physics, nav, the audio bakes and the lightmaps.

:::warning
Reused output is not checked against the map it came from. Build visibility once and then disable it, and the map keeps culling against the world as it was at that build, which shows up in game as geometry disappearing where it should not. Turning a stage off does not undo it: deleting the map's `.vpk` from the [`game/`](./content-and-game.md) side is the only way to get rid of what it produced.
:::

Nav is the same mechanism from the other side. Nothing is generated until a [`point_nav_walkable`](../../Entities/point_nav_walkable.mdx) exists in the map, so the build after you place the first one has to include the nav stage. After that it is inherited like everything else.

However, lightmaps are unfortunately lost when compiling the world without ticking lightmaps.

:::info
The `Entities only` compile does not delete the lightmap information. So iterating on entities is cheap for exactly for this reason. If you only need to e.g. add more spawns (`info_player_terrorist` and `info_player_counterterrorist`) you do not have to compile the whole map again! `Entities only` is sufficient.
:::

## Cubemaps and light probes

These are baked from inside the game rather than by the hammer map compile. However, the map builder has a checkbox to automatically bake them as well after the whole compile is done. They can be built manually from the game: [`buildcubemaps`](../../Convars/index.mdx) in the console bakes them on the running map.

The results live in `_bakeresourcecache/`, named per entity, and Hammer packs them into a `<map>_bakeresourcecache.vpk` beside the `.vmap`, so the bake survives a fresh checkout or a move to another machine.

## Compiling without Hammer

Hammer runs the compile as a separate process but stays open with the map loaded the whole time, so the editor's memory and video memory are tied up for the duration. Running the build on its own frees that. The [Resource Compiler](../../EngineTools/ResourceCompiler/index.mdx) does it from the command line, and <Tool name="github" suffix="CS2ResourceCompiler" link="https://github.com/dirtkiller23/CS2ResourceCompiler"/> is a community GUI around it offering the same options as the build dialog, that is simpler to use than calling the command line directly.

The assets a map references follow a different rule entirely. They are not stages, and the compiler decides for itself whether each one is out of date by comparing checksums it recorded in the compiled file; see [Resource Compiler](../../EngineTools/ResourceCompiler/index.mdx).
