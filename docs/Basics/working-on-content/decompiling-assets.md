---
title: Decompiling assets
description: Recovering editable files from a shipped game's compiled content.
sidebar_position: 5
---

A shipped game contains only [compiled files](../../FileFormats/index.mdx). <Tool name="s2v"/> opens the [VPKs](../../FileFormats/vpk.md), shows what is inside a compiled resource, and decompiles it back toward its source form. 

[Some information is dropped at compile time](./content-and-game.md#why-content-is-split-this-way), so a decompiled file is a reconstruction and not the original. Also <Tool name="s2v"/> does not necessarily support [all file types](../../FileFormats/asset-types.md) fully.

In the viewer, any supported file has **Decompile & Export** on its right click menu, and so does a whole folder. The CLI does the same thing without the browsing.

## Further reading

The <Tool name="s2v"/> documentation covers the tool itself in more detail:

- [Getting started](https://s2v.app/ValveResourceFormat/guides/getting-started.html)
- [Exporting maps](https://s2v.app/ValveResourceFormat/guides/exporting-maps.html)
- [Exporting models](https://s2v.app/ValveResourceFormat/guides/exporting-models.html)
- [Exporting textures](https://s2v.app/ValveResourceFormat/guides/exporting-textures.html)
- [Exporting sounds](https://s2v.app/ValveResourceFormat/guides/exporting-sounds.html)
- [VPK management](https://s2v.app/ValveResourceFormat/guides/vpk-management.html)
- [Command line utility](https://s2v.app/ValveResourceFormat/guides/command-line.html)
