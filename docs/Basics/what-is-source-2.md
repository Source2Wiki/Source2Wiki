---
title: What is Source 2
description: Valve's current engine, the games built on it and what it provides.
sidebar_position: 1
---

Source 2 is Valve's current engine and the successor to Source. It shipped for the first time publicly with the Dota 2 port in 2015 and has been the engine for every Valve title since.

There is no "Source 2 SDK". Each game ships its own build of the engine and its own tools. Those builds drift apart over time and are not guaranteed to be the same between engines. A feature that exists in Counter-Strike 2 may be missing, older, or different in Dota 2. 

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

## Use outside Valve

### s&box

s&box, by Facepunch, is built on Source 2. Its game code and its editor are C#, and Source 2 stays native underneath. Facepunch published the C# side under the MIT license as [Facepunch/sbox-public](https://github.com/Facepunch/sbox-public), with the documentation in [Facepunch/sbox-docs](https://github.com/Facepunch/sbox-docs). 

It is the public half of the engine and not Source 2 itself: the native binaries under `game/bin` are not in the repository and not under the MIT license, and the build downloads them prebuilt under the s&box EULA.

The C# that meets those binaries is written against Valve's own API, and parts of it are transcribed from Valve's C++ headers (as `.def` files). Their `engine/Tools/InteropGen` compiles them into the managed bindings so the C# code can inter-operate with the native C++ engine.

### Pak Files

A `.vpk` file on its own is not a sign of Source 2. Valve Pak predates the engine, Source 1 has shipped VPKs since Left 4 Dead, and Source 1 forks still do. Respawn's Titanfall, Titanfall 2 and Apex Legends at launch ship `.vpk` archives that keep Valve's `0x55AA1234` magic number but carry a version stamp of `0x00030002` and a modified, compressed layout, which general Source tooling does not read. Apex Legends has since moved its content to Respawn's own RPAK format. See [VPK](../FileFormats/vpk.md).

## What Source 2 provides

The engine is 64 bit only. Every game ships the same subsystems, each at the version its branch was cut with, so what follows describes the current titles and the older ones differ in places:

| Subsystem | What it provides | Read more |
| --- | --- | --- |
| **Materials and shaders** | A material is a shader plus the values it runs with: which textures to sample, how rough or transparent the surface is, etc. Choosing a different shader is what separates a plain wall from water or glass. All shaders themselves are compiled ahead of time from `.vfx` into `.vcs`. | [Material Editor](../EngineTools/MaterialEditor/index.mdx), [Tool Textures](../ToolTextures/index.mdx) |
| **Particles** | Particles are an incredibly powerful system for anything visual that does not come from geometry: fire, smoke, blood, ability effects, grenade explosions and more. Particle effects are built out of definitions rather than animated by hand, and a single one can mix sprites, trails, models, ropes, lights and many other renderers. Particles have a randomness / noise system keeping particles from repeating exactly. | [Particle Editor](../EngineTools/ParticleEditor/index.mdx) |
| **Animation** | Skeletal animation driven by a graph instead of the game explicitly telling a model which clip to play. The graph owns the states, transitions and blends, and gameplay feeds it parameters such as speed or aim direction. A character keeps moving sensibly whatever happens around it. Two system exist: AnimGraph (`.vanmgrph`), with an editor of its own, and its successor AnimGraph2 (`.vnmgraph`), for now only available in Counter-Strike 2 and Deadlock. Animgraph2 is based on Esoterica. | [Animgraph Editor](../EngineTools/AnimgraphEditor/index.mdx), [ModelDoc](../EngineTools/ModelDoc/index.mdx), [Esoterica](https://github.com/BobbyAnguelov/Esoterica) |
| **Entities** | Everything in a map that does something is an entity: a class name plus a set of keyvalues, wired to other entities through inputs and outputs. Lights, props, triggers, sound emitters and spawn points are entities; plain geometry is not, it compiles into the world itself, though a mesh can be bound to an entity to become a door or a trigger volume. The class is game code, so placing one in [Hammer](../EngineTools/HammerEditor/index.mdx) only records what to build, and which classes exist at all is per game. | [Entity List](../EntityList/index.mdx) |
| **Logic entities** | A family of entities that exist only to run logic. Outputs fire inputs: a trigger being touched fires a relay, which after a delay opens a door, starts a choreographed scene and increments a counter. Between `logic_relay`, `logic_branch`, `logic_case`, `logic_timer` and `math_counter` you get gating, branching, repetition and stored state, which makes map logic closer to a visual programming language than to a list of triggers. Half-Life: Alyx is largely written this way: `logic_relay` is one of the most numerous entity classes in its maps, and its set pieces and cutscenes are wired together rather than coded. | [Entity List](../EntityList/index.mdx) |
| **FGD** | Plain text files telling Hammer which entities exist and how to present them: labels, defaults, categories, editor models, inputs and outputs. They are editor metadata only and the game never reads them, so adding a class to an FGD does not create an entity, and a wrong one gives you a map that compiles and then behaves differently than the editor implied. | [FGD files](./fgd.md) |
| **Schemas** | The engine keeps a description of its own C++ classes at runtime: every class, every field, with type and offset. Entity keyvalues bind to those fields, `.vdata` files declare which class they fill in, and compiled KV3 can drop field names because the schema already knows the layout. It is compiled into the binaries, so it is per game and per build: names are stable, offsets move with almost every patch. | [Schemas](./schemas.md) |
| **File formats** | Source 2 uses its own formats end to end. Every asset is authored as a text source file and compiled into a `_c` resource, a container of named blocks, and the payload inside is KV3, Valve's typed key-value format, kept as text while authoring and as one of several binary encodings once compiled. Hammer's map sources are DMX instead, and configuration older than KV3 is still Source 1 KeyValues. | [File Formats](../FileFormats/index.mdx), [KV3](../FileFormats/kv3.md), [DMX](../FileFormats/dmx.mdx), [VMAP](../FileFormats/vmap/index.mdx) |
| **Content pipeline** | Authoring and shipping live in separate trees. Sources are edited under `content\`, the resource compiler turns each one into its `_c` form under `game\`, and the result is packed into VPK archives. Nothing you edit is what the game reads, which is why getting an asset back out of a shipped game means decompiling it. | [Resource Compiler](../EngineTools/ResourceCompiler/index.mdx), [VPK](../FileFormats/vpk.md), [content/ and game/](./working-on-content/content-and-game.md), [Decompiling assets](./working-on-content/decompiling-assets.md), [Compiling maps](./working-on-content/compiling-maps.md) |
| **Editors** | The tools are the game. Launching it with `-tools` starts the same executable in editor mode, so Hammer, ModelDoc and the rest run against the live engine and the game's real content, with no separate editor build to keep in step. | [Editor Tools](../EngineTools/index.mdx), [VConsole](../EngineTools/VConsole/index.mdx), [Convars](../Convars/index.mdx) |
| **Rendering** | Draws the world through Direct3D 11 or Vulkan (`rendersystemdx11.dll`, `rendersystemvulkan.dll`). Lighting is split between what is baked when the map compiles, into lightmaps and probes, and what is computed live. A level can be lit richly without for every light being computed every frame. D3D11 is the one backend every game has; titles older than the Vulkan backend fall back on D3D9 and OpenGL. | [Post Processing Editor](../EngineTools/PostProcessingEditor/index.mdx), [Visibility](../EngineTools/HammerEditor/visibility.md) |
| **Physics** | Rubikon (`vphysics2.dll`) covers rigid bodies, ragdolls, cloth and softbody. What you collide with is (usually) not the visible mesh but a simplified shape authored beside it, on the model or in the map, so a prop can look detailed and still be cheap to collide against. | [Hammer physics meshes](../EngineTools/HammerEditor/hammerphysmeshes.md) |
| **Audio** | Sounds are addressed as events rather than as files. Game code asks for a soundevent by name and its `.vsndevts` definition decides what actually plays, with what randomisation, volume and mixing, so a sound can be reworked without touching code. Steam Audio (`steamaudio.dll`, `phonon.dll`) then places the result in 3D against the geometry around the listener. |  |
| **UI** | Panorama (`panorama.dll`) is a browser-like layer: layouts in XML, styling in CSS, behaviour in JavaScript, each compiled into a resource of its own. Menus, HUDs and in-world screens are all built this way, so UI work in Source 2 looks closer to web development than to engine work. |  |
| **Scripting** | How much a game exposes to map makers varies. The newer titles ship Pulse, a node graph for logic that would otherwise need code; Counter-Strike 2 adds cs_script, a TypeScript API for server side gameplay; some games embed Lua instead. | [cs_script](../Scripting/Counter-Strike%202/cs_script/1-introduction.mdx) |
| **Networking** | Entity state replicates by itself: fields marked in the schema are tracked, and the server sends each client a delta against what it last acknowledged rather than a full world state. Clients predict their own input and interpolate everything else, which is why lag shows up as other players sliding rather than as the world freezing. Transport goes through Steam's networking sockets, so connections can be relayed instead of exposing a server address. | [Schemas](./schemas.md), [Convars](../Convars/index.mdx) |
