---
title: Modifying the game
description: What of a shipped game an addon can replace, what it cannot, and what editing game files costs.
sidebar_position: 9
---

An addon is the supported way to change what a game loads, and [Content mounting](./content-mounting.md) covers how that works. This page is the other half: which of the base game's own content an addon can actually replace, and what happens if you edit the shipped files instead.

## Replacing an asset

Mounting a file at a path the game already uses replaces it, and that is how most overrides work: a material, a texture or a model the game looks up by path at the moment it needs it comes from whichever search path answers first, so an addon wins.

There are some exceptions, for example assets whose path is compiled into the game binaries.[^1] In Counter-Strike 2 that covers paths, such as agent models, grenade models or the C4, and the hardcoded gameplay entities such as the hostage or the chicken. However, generally these can still be replaced using [cs_script](../Scripting/Counter-Strike%202/cs_script/1-introduction.mdx) at runtime. Some hardcoded rules do still apply though, such as the game setting the smoke grenades MaterialGroup via game code, so a smoke grenade replacement model must have the proper MaterialGroups.

## Editing shipped files

Shipped files, `gameinfo.gi` included, can be edited, but in Counter-Strike 2 three mechanisms limit what an edit can do:

- **Signature validation at launch.** The client validates game file signatures when it starts; the shipped paks carry an [RSA signature](../FileFormats/vpk.md#signature) for this. A client with unsigned or altered files is blocked from VAC secure servers: "Some of your game files have been detected to have no signatures or invalid signatures. You will not be allowed to join VAC secure servers." Launching with `-insecure`, from outside Steam, or in tools mode puts the client in the same state.
- **Pure server checks on connection.** Official servers additionally compare the client's loaded files against their own ("Pure server: client file does not match server", "client has loaded extra file(s)"), and a client that has loaded third party files is told to restart before playing on official servers again.
- **Updates and verification restore the originals.** A game update rewrites shipped files it finds modified, and Steam's "Verify integrity of game files" does the same on demand, which is also the way to recover from a broken edit.

[^1]: The mechanism here is my investigation of how the shipped binaries reference those paths, not something definitely confirmed. I am not sure if the hardcoded path is the actual reason these files can't be replaced easily.
