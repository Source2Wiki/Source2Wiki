---
sidebar_position: 8
title: Levels
description: Setting up a level system.
---

In some Zombie Escape maps, a level system divides the map into smaller segments. This allows maps to have a sense of progression and prevent maps being tediously long for average players. In source 1, the implementations came in many methods, in which each had their associated problems.

For Source 2, we have developed another system that is much cleaner to use, and easier to understand for novice mappers. Essentially, the new system exploits the skybox to make entities permanent; in layman terms, the skybox allows entities to maintain their configurations in new rounds. As such, any information, including which level the map is on, can be kept indefinitely.

We exploit this and create a [`math_counter`](/Entities/math_counter.mdx) in the skybox which stores the level progression. For every new round, we force the [`math_counter`](/Entities/math_counter.mdx) to output its value to a [`logic_case`](/Entities/logic_case.mdx), which relays outputs to set up the desired level. A prefab to the skybox level system can be found on the <Tool name="github" label="dedicated Github repository" link="https://github.com/Source2ZE/SimpleLevelSystem"/>.

:::info
We really encourage mappers to use this new level system, and to replace existing ones in ported maps. This system is more intuitive to understand and as such is less prone to mistakes. Furthermore, the system does not require VScript or advanced entity works, and isn’t susceptible to random breakages.
:::
