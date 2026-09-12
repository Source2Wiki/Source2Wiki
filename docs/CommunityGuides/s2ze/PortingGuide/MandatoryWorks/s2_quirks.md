---
sidebar_position: 4
title: Managing S2 Weirdness
description: Fixing unexpected issues related to Source 2 engine.
---

These are some of the quirks that exist in the current version of <Game name="cs2"/>. As the game continuously receives updates, however, solutions presented here are only suggestive. The list will be updated whenever necessary.
:::note
Some issues mentioned here may be fixed on live servers that use a third-party plugin (e.g. <Tool name="github" label="CS2Fixes" link="https://github.com/Source2ZE/CS2Fixes"/>).
:::
* Players get stuck on water floors.
    * Provide additional ladders / extend existing ladders so that they touch the water floors.
    * Add [`trigger_push`](/Entities/trigger_push.mdx) near the water floor, however, this can cause unintended effects by players exploiting a speed boost from these ladders in water.
* **AddOutput** outputs that change an entity’s keyvalue do not work.
    * No good solution, other than to replace them with other entities that can relay the intended output.
    * With CS2Fixes, change the **AddOutput** function to **KeyValues**.
* The random teleportation target mechanism from CS:GO (having multiple [`info_teleport_destination`](/Entities/info_teleport_destination.mdx) with the same **targetname**) no longer works in <Game name="cs2"/>.
    * Change the [`info_teleport_destination`](/Entities/info_teleport_destination.mdx)’s into [`point_teleport`](/Entities/point_teleport.mdx)'s with `!activator` as its target, and change the [`trigger_teleport`](/Entities/trigger_teleport.mdx) into a [`trigger_multiple`](/Entities/trigger_multiple.mdx). Then, create a [`logic_case`](/Entities/logic_case.mdx) and have each case targeting each [`point_teleport`](/Entities/point_teleport.mdx), and have the [`trigger_multiple`](/Entities/trigger_multiple.mdx) output to [`logic_case`](/Entities/logic_case.mdx) with **PickRandomShuffle**.
* Some areas may be drawn in when they should not, including cases when they are completely separated by the void. Refer to the section on [VIS](./vis.md).
* [`team_intro`](/docs/Entities/counterterrorist_team_intro.mdx) stops any music played during its cinematics.
* [`func_movelinear`](/Entities/func_movelinear.mdx) with `mp_solid_teammates 0` kills colliding players if [`func_movelinear`](/Entities/func_movelinear.mdx) has block damage. If not, the entity simply gets stuck until players do not collide with each other. This is problematic especially with maps has [items](./item.md#func_button-kills-teammates-on-moving-objects).
    * Use a [`func_tracktrain`](/Entities/func_tracktrain.mdx) instead.
* Collisions on moving entities are clunky, resulting in players getting stuck in the entity’s mesh. This usually occurs when a player collides into the front or the ceiling of the moving object, making the players clip to the outside.
    * As this is a default behavior of the game, there is not much that can be done other than removing collisions on troublesome parts of the object.
* Any "explosion damage", i.e. having **BLAST** damage on [`trigger_hurt`](/Entities/trigger_hurt.mdx) or any [`env_explosion`](/Entities/env_explosion.mdx) that hurts players, can crash on a live server.
    * For [`trigger_hurt`](/Entities/trigger_hurt.mdx), replace the damage type to something else.
    * For [`env_explosion`](/Entities/env_explosion.mdx), see if the damaging mechanism can be replaced with a [`trigger_hurt`](/Entities/trigger_hurt.mdx).
    * This is fixed with CS2Fixes.
* [`trigger_push`](/Entities/trigger_push.mdx) appends its force every tick; players within a push trigger is sent flying even with a low push force.
    * If you do not require a constant pushing effect, you can tick **Trigger on Start Touch** parameter for the push to be applied only on the tick when the player touches the trigger.
    * Else, you may have to recreate the effect manually by using a repeating timer with [`logic_timer`](/Entities/logic_timer.mdx).
    * This is fixed with CS2Fixes.
* [`trigger_gravity`](/Entities/trigger_gravity.mdx) does not reset the gravity enacted on a player upon leaving the trigger.
    * If possible, create a separate [`trigger_gravity`](/Entities/trigger_gravity.mdx) surrounding the area which resets the player's gravity (default gravity is 1).
    * This is fixed with CS2Fixes.
* [`prop_door_rotating`](/Entities/prop_door_rotating.mdx) can be broken by a HE grenade.
    * Target an input on those doors with **SetUnbreakable**. This comes up as a broken output, but they do work in game; it is simply missing from the hammer `.fgd`.