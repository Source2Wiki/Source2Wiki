---
sidebar_position: 12
title: Minimap
description: Creating a single-layered or multi-layered minimap.
---

Creating a minimap in <Game name="cs2"/> is fairly "automatic", in a sense that the entire process of creating minimap files is done by the tool. However, some extra steps are required to ensure that the minimap is displayed correctly in game.

First, create two [`cs_minimap_boundaries`](/Entities/cs_minimap_boundary.mdx) at two opposite boundaries of your map; the volume within these two entities should cover your entire map. For example, place one at the minimum coordinates, and one at the maximum.

To generate a minimap, tick the **compile minimap on load parameter** in the compilation window. Alternatively, type `minimap_create` in game in console.

:::info
The resolution of minimaps can be changed by putting `cs_minimap_create_output_size x` in console, where `x` is the desired resolution  (default is 512). Do note that the maximum resolution of the minimap generation is limited to the game resolution.
:::

The minimap texture is saved as `content/<addon name>/panorama/images/overheadmaps/<map_name>_radar.tga`. However, the minimap material has to be made into a Valve texture and needs some additional parameters to display it properly in game.

Create a new **Generic** or a **Csgo Composite Generic** material in the [Material Editor](/EngineTools/MaterialEditor/getting-started.md), and save the material in the same directory and name as the raw `.tga` file. Next, import the `.tga` as the **color** texture.

When using the **Generic** material, you have to toggle on the **Translucent** parameter in the left hand side menu. Save the material and compile it. In the addon folder under `game/ directory`, the compiled minimap texture should be present. When using the **Csgo Composite Generic** material insetad, an alpha channel needs to be established in the minimap image.

:::note
If you do not see either materials in the list, tick **dev shaders** at the bottom.
:::

A successful compilation results in a compiled material with a unique suffix. Delete this suffix so that the name becomes `<map_name>_tga.vtex_c`.

At this point, the minimap should be correctly displayed. If not, restart the game at least once.

## Multi-layered Minimap
In more complex maps there are likely many overlapping areas across different heights, in which a multi-layered minimap is necessary. Fortunately, <Game name="cs2"/> supports this and the generation is not much different from CS:GO.

In short, a minimap image for each desired layer needs to be generated with these layers defined in the `.txt` file under `game/csgo_addons/<addon name>/resource/overview/`. This text file will have the same name as the map.

First, follow the steps in the previous section for a single-layered minimap, and generate the aforementioned text file. This step will automatically calculate the minimap positioning and scaling based on the [`cs_minimap_boundaries`](/Entities/cs_minimap_boundary.mdx)'s that are placed in the map. Note, the minimap positioning and scaling of all layer must be the same.

Next, the minimap image for each layer needs to be generated. Navigate to the text file, and add the following at the end of the first block:
```
"verticalsections"
{
    "1"
    {
        "AltitudeMin"   	 "-16000"
        "AltitudeMax"   	 "x"
    }
    "2"
    {
        "AltitudeMin"   	 "x+1"
        "AltitudeMax"   	 "y"
    }
    //repeat until…
    "n"
    {
    "AltitudeMin"   	 "z"
    "AltitudeMax"   	 "16000"
    }
}
```

Each block inside the `verticalsections` are the layers to be generated with the minimum and maximum altitudes are entered manually. These layers should be ordered in an ascending or descending order without any overlap in the altitude ranges (notice `x+1` for the minimum value for layer 2). The numbering of layers 1, 2, …, n is just an example - it will not make any difference if this naming is changed.

:::tip
Try to use the least number of layers possible. The minimap images are fairly large in file size, and having many layers will bloat the port unnecessarily.
:::

Now, generate the minimap via the compile window or the in-game console command. If successful, the minimap image for each layer is generated in the content folder. Afterwards, create a .vmat file for each layer, compile, and remove the unnecessary suffix on the compiled materials. 