---
sidebar_position: 3
title: S1 Entities
description: Overview of Source 1 Entities that require replacing.
---

Many Source 1 entities do not work as intended, or outright removed. This section will highlight some of these entities and if applicable provide a suitable replacement.
## Missing Entities
Here are a few of the common missing entities with their substitute:
:::note
Some substitutes may require a third-party plugin (e.g. [CS2Fixes](https://github.com/Source2ZE/CS2Fixes)), so use them at your own discretion.
:::
* `player_speedmod`: recreateable with cs_script.
* `game_ui`: custom implementation via CS2Fixes, recreateable with cs_script.
* `game_text`: recreateable with [`custom_hud_layout`](/Entities/custom_hud_layout.mdx).
* `point_viewcontrol`: replaced with [`team_select`](/Entities/team_select.mdx) for the team select background.
* `point_viewcontrol_multiplayer`: recreateable with `cs_player_camera`, custom implementation via CS2Fixes for more customization options.
* `func_water_analog`: water now works with [`func_water`](/Entities/func_water.mdx). However, moving [`func_water`](/Entities/func_water.mdx) only moves its collision and not the water texture itself.
    * A fix is to parent the [`func_water`](/Entities/func_water.mdx) to the [`func_movelinear`](/Entities/func_movelinear.mdx), with the faces of [`func_movelinear`](/Entities/func_movelinear.mdx) applied with the water texture.
* Particle based entities (`env_steam`, `func_dustmotes`, etc.): recreateable with [particles](./particle.md).
* `point_spotlight`: recreateable with particles.
* `prop_exploding_barrel`: must be recreated manually with e.g. [`prop_dynamic`](/Entities/prop_dynamic.mdx) and [`env_explosion`](/Entities/env_explosion.mdx).
* `env_fire`: recreateable with other entities and particles.
* `env_beam`: recreateable with particles.
* `env_laser`: recreateable with particles.

## Missing Entities From `.fgd`
Some entities missing from the hammer `.fgd` files can be used after substitution from CS:GO files. These entities are:
* `filter_activator_team`
As an example, the following section will explain how to re-enable `filter_activator_team`. The `.fgd` for this entity can be copied directly from CS:GO `.fgd`, or alternatively can be copied from below:
```
@FilterClass base(BaseFilter) size(-8 -8 -8, 8 8 8) = filter_activator_team :
	"A filter that filters by the team of the activator."
[
	filterteam(choices) : "Filter Team Number" : 2 : "The team number to filter by.  If the filter mode is Allow, only entities whose "+
		"team number matches the given team will pass the filter. If the filter mode is Disallow, "+
		"all entities EXCEPT those whose team number matches the given team will pass the filter." =
	[
		2 : "Terrorist"
		3 : "Counter-Terrorist"
	]
]
```
For consistency, this block should be added near other `filter_*` entities in `base.fgd`. Otherwise, place this block at the end of `base.fgd`.
## Entities with Changed Behaviors
### [`func_tracktrain`](/Entities/func_tracktrain.mdx)
The **Orientation Style** of *Face the Direction of Motion* no longer works as intended. Without using scripts, the best solution is to have wider berths on curves and slow down the [`func_tracktrain`](/Entities/func_tracktrain.mdx) as necessary.
### [`env_spark`](/Entities/env_spark.mdx)
This entity is missing the particle responsible for sparks. You can choose to recreate this entity, or manually replace the missing particle.
### Ropes
`Path_particle_rope` is obsolete and is replaced as [`path_particle_rope_clientside`](/Entities/path_particle_rope_clientside.mdx).