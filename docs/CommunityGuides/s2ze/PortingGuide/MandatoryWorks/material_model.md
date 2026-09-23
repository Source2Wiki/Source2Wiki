---
sidebar_position: 6
title: Materials & Models
description: Everything related to working with materials and models.
---

## Missing Material Fatal Error
Due to an exploit that was present in early <Game name="cs2"/>, Valve forced the game to fatally error out when the map contains any missing textures. This causes a crash on a live server as well, hence it is important to identify and replace these missing textures.

As expected, the solution is simple: replace any missing textures from the map. This can be done by loading the map in game in tools mode and inputting `mat_print_error_materials` into the console. This command will print out the names of materials that are missing. By filtering the console for [Error Resource], these missing materials can be more easily identified.

:::info
If the above method does not return any materials, then it is likely that the missing texture is present in a model. This is unfortunately harder to identify, but the [earlier section about using the import tool](import_tool.md#during-importing) provides some guidance.
:::

If you want to test your map without tools mode, load the map with `map_workshop <addon> <map>` in the console. Unlike what the command implies, you do not have to upload the map to the workshop to test.

:::warning
Valve has a history of removing default materials in game updates, and will likely continue to do so in the future. This means stable maps can suddenly crash on a live server after an update, so be advised and consistently check the map for the missing material error.
:::

## Models

### Model Animations
Animation sequence inputs on a [`prop_dynamic`](/Entities/prop_dynamic.mdx) are broken as the name of the command has changed. These must be changed for all animated props present in the map.

### Porting Models
If the import tool fails to import or recognize the models, they may not be imported. In such instances, they are shown as the default error model in hammer and in game. A list of missing models is shown in the map compilation window, near the beginning with their names listed as red error messages.

#### cs_mdl_importer
Some models, most notably any gib models that spawn from a breakable, may be ignored by the import tool. In this case, try running `cs_mdl_importer.exe` found in the game files. Under normal circumstances this executable can be called from anywhere, but if the importer is not set up correctly then it can be found at `game\bin\win64`.

First, create a `.txt` file that lists all the model directories; e.g. in some format of `models/some_folder/some_model.mdl`. When importing multiple models at once, list each directory on separate lines. Once the list is done, execute the tool with the command prompt with the following command:

`cs_mdl_import -i <path_to_s1_csgo> -o <path_to_cs2_addon> -l <path_to_list.txt>`

:::note
Some models can fail to import with the above method, which then requires a manual import. The detailed procedures are written in the [later section about manual model importing](../ExploitingS2/advanced.md#manual-import-of-models).
:::