---
title: content/ and game/
description: The two mirrored directory trees every Source 2 install is built around.
sidebar_position: 2
---

A Source 2 install has two parallel trees:

- **`content/`** holds authored source files. Nothing here is ever loaded by the game.
- **`game/`** holds compiled output plus the files the engine reads directly. This is what ships.

Every asset lives in both. The source file is edited under `content/`, a compiler writes the compiled result to the matching path under `game/`, and the game loads that.

Which folders make up each tree, and what belongs in them, is covered in [Directory layout](./directory-layout.md).

## Mirrored paths

The path relative to the mod or addon root is preserved. Only the extension changes:

| Source file under `content/` | Compiled result under `game/` |
| --- | --- |
| `csgo_addons/my_addon/sounds/bird_01.wav` | `csgo_addons/my_addon/sounds/bird_01.vsnd_c` |
| `csgo_addons/my_addon/postprocess/basic_linear_post.vpost` | `csgo_addons/my_addon/postprocess/basic_linear_post.vpost_c` |
| `csgo_addons/my_addon/materials/wall.vmat` | `csgo_addons/my_addon/materials/wall.vmat_c` |
| `csgo_addons/my_addon/maps/my_map.vmap` | `csgo_addons/my_addon/maps/my_map.vpk` |

Maps are the exception: a `.vmap` does not compile to a single file next to itself. It compiles into a VPK holding the whole compiled map, because one map produces many resources (world, world nodes, visibility, entity lumps). See [VPK](../../FileFormats/vpk.md#maps-and-nesting).

## Which side to edit

Almost always the `content` side is the right one to edit, with a few exceptions.

Anything the editors own belongs there: a `.vmap`, `.vmat` or `.vtex` is edited in [Hammer](../../EngineTools/HammerEditor/index.mdx), the [Material Editor](../../EngineTools/MaterialEditor/index.mdx) or [ModelDoc](../../EngineTools/ModelDoc/index.mdx) rather than by hand. Editing those by hand is rarely worth attempting anyway, since depending on the type they are either awkward to write or outright binary.

The files you do edit by hand sit on the `game` side, because nothing compiles them: `addoninfo.txt`, the configs under `cfg/`, and a map's radar overview `.txt`. For the overview, prefer generating it with <Tool name="radgen"/> over writing it yourself, see [RadGen](../../ExternalTools/radgen.mdx).

:::warning
There are rare cases where you need to manually edit compiled files, but it is not recommended if it can be avoided. As an example, there are rarely things that ModelDoc has no way to author yet (something that Valve uses internally but has not publicly shipped). <Tool name="github" suffix="s2assetassembler" link="https://github.com/LionDoge/source2-asset-assembler"/> (`pip install s2assetassembler`) can swap individual blocks in a compiled file or build one from scratch. Note that if you still have the source asset in the `content` side it will override the manually edited asset in `game` once the resourcecompiler compiles it again. Therefore in that case the `content` side should be removed.
:::

## How are files compiled?

`resourcecompiler.exe` in `game/bin/win64/` is the compiler. It dispatches to a per type compiler chosen by extension, `CompileMaterial` for a `.vmat`, `CompileModel` for a `.vmdl`, `CompileMap` for a `.vmap`; [Asset Types](../../FileFormats/asset-types.md) lists the compiler for every type.

It rarely has to be run by hand, because the tools run it:

- the Material Editor, ModelDoc and the [Particle Editor](../../EngineTools/ParticleEditor/index.mdx) compile the open asset on save
- the [Asset Browser](../../EngineTools/AssetBrowser/index.mdx) compiles what it needs to show, and opening an addon for the first time compiles its content
- opening a map compiles everything that map depends on
- Hammer compiles as part of a [map build](../../EngineTools/MapCompiler/index.mdx)
- the command line covers bulk and scripted compiles, see [Resource Compiler](../../EngineTools/ResourceCompiler/index.mdx)

What a map build actually redoes, and what it keeps from the previous one, is on [Compiling maps](./compiling-maps.md).

However, there are rare cases, where the game does not properly recompile an asset. In that case you can manually recompile the file by selecting it in the Asset Browser, right clicking and selecting the Recompile option.

## Why it is split this way

Source files are large, editable, and useless to the runtime. Compiled files are smaller, have a more fixed layout, and load without parsing text. Keeping them in separate trees means the shipping game never has to carry source maps or uncompressed textures, and the tools always know which copy is authoritative for editing. 

Depending on the file type, the compile does more than change the encoding: it derives data that has no counterpart in the file you edited. A `.vmap` has its prefab instances flattened into plain entities, its mesh scaling baked into vertex positions and its geometry split into world nodes, so none of the structure you worked with survives as such. Cloth is an even more extreme case: the vertex weights painted in ModelDoc become a solver structure of nodes, rods and quads that was never written down anywhere in the source. This is the reason [decompiling](./decompiling-assets.md) recovers something workable rather than the original. Therefore, it is not possible to decompile all assets well. As an example, the prefab structure of mesehs is simply lost during compiling and can not be recovered.

:::warning
Deleting something from `content/` does not remove it from `game/`! Stale compiled files keep loading until they are deleted there too, which is a common cause of a change appearing to do nothing. Delete them by hand, or clear your addon's whole folder on the `game/` side and let a full compile rebuild it.

If you clear it, keep the files that only ever exist there and are never regenerated: `addoninfo.txt`, everything under `cfg/`, and the rest listed in [Which side to edit](#which-side-to-edit). Deleting those means writing them again from scratch.
:::

## Naming rules

A path is part of an asset's identity, not just where the file sits, so the compiler is strict about it and rewrites it sometimes.

The compiler states the filename rule itself, *"the filename may only contain lower case alphanumeric characters, dashes, and underscores"*, and enforces a limit of 260 characters on the whole path. Other characters, such as `.` or `$` can cause issues when used in names.

That limit applies to paths the compiler invents as well as the ones you type. Each texture a material references compiles into a texture asset of its own, and the compiler derives its name instead of reusing yours: a texture generated from the material becomes `<material>_vmat_g_<parameter>_<hash>.vtex_c`, one built from a source image becomes `<image>_<extension>_<hash>.vtex_c`. Those names run roughly forty characters longer than the `.vmat` that produced them:

```
materials/.../train_window_old_factory_glass_01_broken_opaque.vmat
materials/.../train_window_old_factory_glass_01_broken_opaque_vmat_g_ttransmissivecolor_e6db66fc.vtex_c
```

Whichever tool you are working in will report it as a compile error.

Names inside an asset are sanitised as well, not only paths. Bone names go through a pass that rewrites characters it does not accept, `$` becoming `_`, and it is applied unevenly: the skeleton in the `.vmdl` keeps the authored name while the mesh and animation import rewrites it, which turns one authored bone into two that no longer match. If two names sanitise to the same string the compiler reports duplicate bones and the animation data for them is lost.