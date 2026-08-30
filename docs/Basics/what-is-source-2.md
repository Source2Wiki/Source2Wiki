---
title: What is Source 2
description: Valve's current engine, the games built on it and what it provides.
sidebar_position: 1
---

Source 2 is Valve's current engine and the successor to Source. It shipped for the first time publicly with the [Dota 2 port in 2015](https://www.dota2.com/reborn/part1/) and has been the engine for every Valve title since.

There is no "Source 2 SDK". Valve keeps one up-to-date Source 2 version and does not split it between games. However, only the multiplayer titles, Counter-Strike 2, Deadlock and Dota 2 are kept up to date with the engine. The single player games stay on the version they shipped with and are usually not updated. 

Even with the same engine, each game ships its own shaders, entity classes, game code and tools, so a feature that exists in Counter-Strike 2 may be missing, older, or different in Dota 2.

## Games built on Source 2

| Game | Released | Official tools |
| --- | --- | --- |
| Deadlock | 2024 (in beta) | No |
| Counter-Strike 2 | 2023 | Yes |
| Aperture Desk Job | 2022 | No |
| Artifact Foundry | 2021 (beta) | No |
| Half-Life: Alyx | 2020 | Yes |
| Dota Underlords | 2020 | No |
| Artifact Classic | 2018 | No |
| SteamVR Home | 2016 (as Destinations) | Yes |
| The Lab (Robot Repair) | 2016 | No |
| Dota 2 | 2013 (Source 2 in 2015) | Yes |

Official tools means the game ships the Workshop Tools as a separate download; see [Installing the Workshop Tools](./installS2Sdk/index.mdx). 

## s&box

s&box, by Facepunch, is built on Source 2. Its game code and its editor are C#, and Source 2 stays native underneath. Facepunch published the C# side under the MIT license as [Facepunch/sbox-public](https://github.com/Facepunch/sbox-public), with the documentation in [Facepunch/sbox-docs](https://github.com/Facepunch/sbox-docs). 

It is the public half of the engine and not Source 2 itself: the native binaries under `game/bin` are not in the repository and not under the MIT license, and the build downloads them prebuilt under the s&box EULA.

The C# that meets those binaries is written against Valve's own API, and parts of it are transcribed from Valve's C++ headers (as `.def` files). Their `engine/Tools/InteropGen` compiles them into the managed bindings so the C# code can inter-operate with the native C++ engine.

## What Source 2 provides

The engine is 64 bit only. What follows describes the current titles; the older games ship older versions of the same subsystems.

### Rendering

Source 2 offers a modern, [Physically Based Rendering](https://en.wikipedia.org/wiki/Physically_based_rendering) engine supporting forward+ and deferred rendering as well as extremely high quality, GPU path traced lightmapped global illumination for static geometry with an in-editor live preview, as well as light probe and cubemap based GI for dynamic geometry.

Other features include: 

- GPU driven rendering and culling using meshlets
- Parallax corrected cubemaps with per axis blending
- Powerful post processing editor
- Advanced static/dynamic lighting, specialised light types such as barn and area lights, as well as CSM and ["stationary"](https://dev.epicgames.com/documentation/unreal-engine/stationary-lights?application_version=4.27) lights

Rendering APIs include Direct3D 11 and Vulkan (`rendersystemdx11.dll`, `rendersystemvulkan.dll`). D3D11 is the one backend every game has; titles older than the Vulkan backend fall back on D3D9 and OpenGL.

*See also: [Lightmap Player Volumes](../EngineTools/HammerEditor/Lighting/lightmapPlayerSpace), [Post Processing Editor](../EngineTools/PostProcessingEditor/index.mdx), [Visibility](../EngineTools/HammerEditor/visibility.md)*

### Materials and shaders

A material is made up of a shader and its referenced textures and properties; which textures to sample, how rough or transparent the surface is, etc... 

In Source 2, shaders define material properties, static and dynamic combos, texture channel packing rules, and much more, most of the editable properties seen in the [Material 
Editor](../EngineTools/MaterialEditor) are defined in the shader itself.

:::info
Shaders are compiled ahead of time from `.vfx` sources into `.vcs`, and each game ships its own set. The Workshop Tools ship no shader compiler and no `.vfx` sources, shaders cannot be edited or added.
:::

*See also: [Material Editor](../EngineTools/MaterialEditor/index.mdx), [Tool Textures](../ToolTextures/index.mdx)*

### Particles

Source 2 has a powerful and versatile, if annoying to use particle system. Particle effects cover anything visual that does not come from geometry: fire, smoke, blood, ability effects, explosions. 

Usually, an effect is a definition rather than a hand-animated sequence (tho both are supported), effects can mix sprite, trail, model, rope and light renderers. Procedural movement and animation can be applied to particles, such as simple movement, noise and physics.

*See also: [Particle Editor](../EngineTools/ParticleEditor/index.mdx)*

### Animation

Animations are split into two systems (or 3 depending on how you count).

- Basic animations can be defined in [Model Doc](../EngineTools/ModelDoc/) and played using entity inputs.

- Depending on the version of Source 2, animations can also controlled by a procedural animation-graph system. Two systems exist: AnimGraph (`.vanmgrph`), with an editor of its own (seen in <Game name="hla"/>), and its successor AnimGraph2 (`.vnmgraph`), based on Esoterica. AnimGraph2 is so far only used in newer titles like <Game name="cs2"/>.

in Animgraph systems the graph owns the states, transitions and blends, the engine feeds it parameters during gameplay such as speed or aim direction in order to procedurally drive animations.

*See also: [Animgraph Editor](../EngineTools/AnimgraphEditor/index.mdx), [ModelDoc](../EngineTools/ModelDoc/index.mdx), [Esoterica](https://github.com/BobbyAnguelov/Esoterica)*

### Physics

Rubikon (`vphysics2.dll`) handles rigid bodies, ragdolls, cloth and softbody physics. It supports static as well as dynamic geometry, however dynamic geometry is limited to capsules, spheres, and hulls, mesh colliders are only supported on static geometry.

*See also: [Hammer physics meshes](../EngineTools/HammerEditor/hammerphysmeshes.md)*

### Audio

Most audio is driven by the Sound Event system, code asks for a soundevent by name and its `.vsndevts` definition decides what sound file plays, with what randomisation, volume and mixing. Soundscapes build on top of this, defining entire ambiances using layered sound events with dynamic DSP.

Source 2 also has support for [Steam Audio](https://valvesoftware.github.io/steam-audio/) (`steamaudio.dll`, `phonon.dll`), which can compute realistic audio probes for levels, and offers advanced HRTF functions, placing the result in 3D against the geometry around the listener.

### UI

Panorama (`panorama.dll`) is a browser-like user interface system; layouts are built in XML and styled with CSS, behaviour is scripted in JavaScript, each compiled into a resource of its own. Menus, HUDs and in-world screens are all built with it.

### Entities

Everything in a map that does something is an entity: a class name plus a set of keyvalues, wired to other entities through inputs and outputs. Lights, props, triggers, sound emitters and spawn points are entities; plain geometry is not, though a mesh can be bound to an entity to inherit a specific behaviour, such as becoming a door or a trigger volume.

A subset of them exists only to run logic. Entities such as `logic_relay`, `logic_branch`, `logic_case`, `logic_timer` and `math_counter` provide gating, branching, repetition and stored state, driven by outputs firing inputs. Most of Half-Life: Alyx is built this way: its scenes are wired together by entities rather than being coded.

Which entities an editor offers, and how it presents them, comes from FGD files.

*See also: [Entity List](../EntityList/index.mdx), [FGD files](./fgd.md)*

### Scripting

How much a game exposes to map makers varies. The newer titles ship Pulse, a node graph for logic that would otherwise need code. Counter-Strike 2 adds cs_script, a TypeScript API for server side code execution. Some games embed Lua.

*See also: [cs_script](../Scripting/Counter-Strike%202/cs_script/1-introduction.mdx)*

### Networking

Entity state replicates by itself: fields marked in the schema are tracked, and the server sends each client a delta against what it last acknowledged. Clients predict their own input and interpolate everything else. Transport goes through Steam's networking sockets, so a connection can be relayed instead of exposing a server address.

*See also: [Schemas](./schemas.md), [Convars](../Convars/index.mdx)*

### Schemas

Source 2's built in reflection system, the engine carries a description of its own C++ classes at runtime: every class, every field, with type and offset. 

Entity keyvalues bind to those fields, `.vdata` files declare which class they fill in, and compiled KV3 can drop field names because the schema already knows the layout. It is compiled into the binaries, so it is per game and per build: names are stable, offsets move with almost every patch.

*See also: [Schemas](./schemas.md)*

### File formats

Every asset is authored as a text source and compiled into a `_c` resource, a container of named blocks. The payload inside is usually KV3, Valve's typed key-value format, kept as text while authoring and as one of several binary encodings once compiled; Hammer's map sources are DMX, and configuration older than KV3 is still Source 1 KeyValues.

*See also: [File Formats](../FileFormats/index.mdx), [KV3](../FileFormats/kv3.md), [DMX](../FileFormats/dmx.mdx), [VMAP](../FileFormats/vmap/index.mdx)*

### Content pipeline

Authoring and shipping live in separate trees. Sources are edited under `content\`, the resource compiler turns each one into its `_c` form under `game\`, and the result is packed into VPK archives.[^1] Recovering an asset from a shipped game means decompiling it.

*See also: [Resource Compiler](../EngineTools/ResourceCompiler/index.mdx), [VPK](../FileFormats/vpk.md), [content/ and game/](./working-on-content/content-and-game.md), [Decompiling assets](./working-on-content/decompiling-assets.md), [Compiling maps](./working-on-content/compiling-maps.md)*

### Editors

Hammer, ModelDoc and the rest are the game running in editor mode: `-tools` starts the same executable against the live engine and the game's real content. There is no separate editor build.

*See also: [Editor Tools](../EngineTools/index.mdx), [VConsole](../EngineTools/VConsole/index.mdx), [Convars](../Convars/index.mdx)*

[^1]: A `.vpk` file is not by itself a sign of Source 2: the format predates the engine, Source 1 has shipped VPKs since Left 4 Dead, and Source 1 forks such as Respawn's Titanfall use variants of it that general Source tooling does not read. See [VPK](../FileFormats/vpk.md).
