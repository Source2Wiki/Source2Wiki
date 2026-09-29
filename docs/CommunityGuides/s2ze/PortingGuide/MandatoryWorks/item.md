---
sidebar_position: 10
title: Items
description: Fix issues related to items.
---

Items can be crucial for the map flow in some Zombie Escape maps. It is a mechanism that is simple to implement, and yet can bring big variety between each run depending on how the items are used. This section will introduce some issues exclusive to <Game name="cs2"/>, and their relevant solutions.

:::tip
Make sure that the items are imported correctly! Broken outputs are fairly common in items and the import tool [does not handle them correctly](./import_tool.md#before-importing).
:::

### [`func_button`](/Entities/func_button.mdx) kills teammates on moving objects
Players that “collide” with a [`func_button`](/Entities/func_button.mdx) on a moving object, specifically [`func_movelinear`](/Entities/func_movelinear.mdx), will cause collision damage upon them.

Replace any [`func_movelinear`](/Entities/func_movelinear.mdx) which players have to stand on into a [`func_tracktrain`](/Entities/func_tracktrain.mdx) instead. Alternatively, replace the button with a [`func_physbox`](/Entities/func_physbox.mdx), but this blocks bullets from players, which is not ideal in Zombie Escape with many players.

### Item holder cannot see the item
As items are attached to the player and since the textures on the items are not using the character shader, they will become invisible to the item holder.

The fix is to duplicate the item texture and set its shader to **Csgo Character**.

### Playing sounds on the item
As `ambient_generic` is obsolete, a new method is needed to play sounds on items.

Use [`snd_event_point`](/Entities/snd_event_point.mdx), and have the **Source Entity Name** point to the item. Note, you should not target the weapon itself.

:::warning
Although `ambient_generic` is obsolete, the entity still functions in game. It is still recommended to replace them, however, as obsolete entities are often removed in game updates.
:::

### Placing grenades in the map
Any grenade that is picked up by a player will not be intractable unless scrolling through the entire inventory.

Create a new key with String Property Type in the Object Properties menu of the grenade, and insert subclass_name as the key. The value for each grenade is listed below:
* 43    Flashbang
* 44	HE grenade
* 45	Smoke grenade
* 46	Molotov
* 47	Decoy
* 48	Incendiary grenade