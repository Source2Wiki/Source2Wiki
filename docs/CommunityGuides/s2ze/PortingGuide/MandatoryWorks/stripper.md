---
sidebar_position: 1
title: Stripper Configs
description: Applying stripper configs to a CS:GO map before porting to CS2.
---

In Source 1, many Zombie Escape maps made server-side adjustments with stripper configs. These text-based modifications fixed map issues without having to compile the map to a new version. When porting to <Game name="cs2"/>, the stripper config must first be implemented into the map as strippers were meant to be a temporary fix.

To simplify this process, a Python script has been written which automatically applies these configs into a `.vmf` file. More information is found on the <Tool name="github" label="Stripplier Github repository" link="https://github.com/Source2ZE/Stripplier"/>, but to briefly describe the steps:
1. You provide a stripper config `.cfg` together with the Source 1 hammer map file `.vmf` and the compiled map `.bsp`.
2. You run the script and provide the name of the map.
3. That's it! 

:::warning
The provided files must all have the same map name.
:::

:::tip
All modified entities are given a keyvalue of  `"strippered" "1"`, which can be easily filtered for in the Entity Report menu.
:::

After running the script, check if all changes are correctly applied, and save the `.vmf` file at least once.