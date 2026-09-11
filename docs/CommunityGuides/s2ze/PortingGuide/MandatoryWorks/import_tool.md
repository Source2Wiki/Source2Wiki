---
sidebar_position: 2
title: Import Tool
description: Using the Valve import tool.
---

Instructions on how to use the import script are explained on the dedicated [Valve Developer Community page](https://developer.valvesoftware.com/wiki/Counter-Strike_2_Workshop_Tools/Level_Design/Maps_Workshop/Import_Tool_Documentation). This section, however, presents additional useful information on using the import tool.

## Before Importing
Be aware of the following before using the import tool. If applicable, the indented bullet describes a fix:
* If using a decompiled `.vmf`, save the map in hammer at least once.
* Any broken entity connections (for example targeting entities with changing targetname), wildcard calls, and reserved targetnames that start with ! (e.g. `!self`, `!activator`, ...) **are not ported**. Even though the importer will output these connections when running, these connections should perferably be checked beforehand in Source 1 hammer.
    * Creating an entity with the same targetname fixes the issue. Using `info_target` is recommended as it is typically rarely used and thus easy to filter for.
* Some Source 1 legacy textures, such as *HINT* and *SKIP*, are deleted. This also deletes any `func` entities that use these textures.
    * To prevent deletions replace these textures (for example to *NODRAW*) before importing.
* A duplicate mesh is generated at the same position of all `func_wall` and `func_wall_toggle`. If uncatered for, these can cause unexpected breakages during gameplay.
    * Change these to `func_brush`, taking note of the **Start Invisible** spawnflag.
* If map leaks are present, the importer’s compiler does not properly cull map geometries. Any void facing faces will not be deleted.
    * As in Source 1, there is no easy way to find map leaks other than doing a map compilation. Fortunately, the import tool VBSP will also generate a `Pointfile` to the leak, which can be opened in Source 1 hammer.
* Turn all surf ramps into `func_brush` to prevent ramp bugs. For more information, refer to the [later section about surf ramps](./qc.md#surf-ramps), or refer to the [dedicated section](https://docs.google.com/document/d/1NPyS_otVjCePwLod-aqHQaogOvjme0Rr4YHd1BFccrI/edit?tab=t.0#heading=h.lzrul7hkjtcw) from S2 Surf Map Porting Guide together with the [Mapping Guide](https://github.com/Chent-AU/CS2-Surf-Mapping#ramp-bugs) by Chent.
* Some default CS:GO skyboxes cannot be imported, in particular HDR skyboxes.
    * Change the 2D Skybox before using the import tool.

## During Importing
Here are some issues that can be encountered during the import:
* The importer can terminate early on missing model textures. A `_refs.txt` file can be found in the output folder which lists all model textures present in the map. The missing textures must be searched manually using this list (using Notepad++ or similar is recommended).
:::warning
Compiled maps with missing texture can crash the game, so make sure this is completely resolved before moving to the next step.
:::
* Some *dev/* textures may not import. Import them later manually or replace them with a different texture. This advice also applies to other textures with similar issues.

### Logging the Import Tool
Another caveat of the import tool is the lack of logging, meaning all outputs are lost when the console window is closed after the import. Furthermore, Windows Terminal has a count limit on displayable output lines, hence lines beyond this limit are not recoverable.

Fortunately, Windows Powershell can be used to log the import tool by adding an extra argument to the import commands:

`<Python import commands> | tee <name of log>.txt`

where the same commands for the import tool are used. To launch the import tool in Powershell, type 'powershell' instead of 'cmd'.

For example, the full command should be similar to:

`python import_map_community.py  "<s1 directory>" "<s1 contents>" "<s2 directory>" addon_name map_name -usebsp | tee output.txt`

This creates a log file named `output.txt` in the directory of the import tool.

During execution, enter 'y' multiple times when a user input is requested, including occasions where the console appears to be stuck at a blank space.

## After Importing
After the import tool finishes, modify the map with the following to make the porting process easier:
* Before anything, save a copy of the imported `.vmap` as a back-up.
* The import tool outputs a main `.vmap` and a few `_prefab .vmap`'s. These prefabs can be collapsed in the main map; select everything in the main `.vmap`, and select **Collapse All Prefabs** via the F1 menu.
* If the map has a 3D skybox, the skybox has to be moved to a separate `.vmap`. The procedures to move your 3D skybox are provided within [Valve's guide](https://developer.valvesoftware.com/wiki/Source_2/Docs/Level_Design/Post_Import_Fixup_steps#Skybox). Make sure to compile the 3D skybox afterwards.
* A duplicate mesh of every `func` entities is created at the world origin. Delete these duplicates.
    * The exceptions are `func_wall` and `func_wall_toggle` as [mentioned earlier](#preparations).
:::warning
An `env_sky` entity is also created at world origin, so do not blindly delete everything at the world origin.
:::
* All decals and overlays are converted to **Static Overlay**. Unfortunately, some static overlays can have incorrect orientations and or scaling, which require manual corrections.
* Geometries in skybox do not block sunlight. This is because these skybox geometries are no longer part of the main map.
    * The official solution used in official Valve maps is to copy the skybox geometries into the main map, adjust them to have correct scalings and positions, and change their textures to *Block Light*.
* **Alphatest** textures in the skybox are not rendered.
    * Simply change them to **Translucent** instead.
* Outputs without a parameter are replaced with `(null)`. This may cause problems for output that do depend on the parameter, for example in a `math_counter`.
    * Select all entities in the map and remove all instances of `(null)` in the output parameter.