---
sidebar_position: 13
title: Applying Zombie:Reborn (ZR)
description: Applying Zombie:Reborn for a smooth live-server experience.
---

With the remake of the Zombie:Reloaded plugin into <Tool name="github" label="CS2Fixes" link="https://github.com/Source2ZE/CS2Fixes"/>, a new feature has been added that allows mappers to disable (and re-enable) zombie respawns at will. This change requires modifications to the 'nukes' at the end of the map, replacing the old inconsistent [`trigger_hurt`](/Entities/trigger_hurt.mdx) based automatic “repeat kill detectors”.

To modify zombie respawns, create an additional output on the entity that triggers the nuke such that:
* Action: `<OnWhatever>`
* Target: `zr_toggle_respawn`
* Output: choose one output listed below:
    * `Disable`	- disable zombie respawn (does nothing if already disabled)
    * `Enable`	- enable zombie respawn (does nothing if already enabled)
* Delay: you can have whatever value here for the delay of the output.

:::danger
`Trigger` output still exists for legacy purposes. However, there have been instances where the `Trigger` output would unintentionally re-enable zombie respawns, such as when triggered via a [`trigger_once`](/Entities/trigger_once.mdx). Thus, do not use the `Trigger` output.
:::

It is very important to not miss this step! If this is not set up correctly, then zombies will infinitely respawn in a loop on live servers, which will make your port unplayable. Additionally, a map may have multiple ways of triggering the nuke; make sure this output is added to all such entities!

:::tip
A possible way of testing zombie respawn toggles offline is to create a [`logic_relay`](/Entities/logic_relay.mdx) with the **targetname** of `zr_toggle_respawn`. Within this relay, add an output that prints to console / chat whenever zombie respawns are modified. Make sure to delete the relay before publishing the map though, otherwise the messages will still print on live servers.
:::