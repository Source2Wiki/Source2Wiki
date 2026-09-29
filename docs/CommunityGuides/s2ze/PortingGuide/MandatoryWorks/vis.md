---
sidebar_position: 7
title: VIS
description: Dealing with visibility.
---

Visibility in source 2 is not fully isolated, meaning areas from other levels can be drawn when they should not be. This is more evident on maps that heavily depend on skyboxes or those with many open areas.

If the object that is drawn through different areas is small (i.e. a single mesh or similar), go to the object's properties window and disable **Mesh Merging**. As implied by the name, this encourages the compiler to skip mesh merging and not merge the object in question with meshes from different areas.

This usually works best with individual objects. If you have an entire area displaying through the skybox, then you should continue on to the next subsection.

## Areaportals
`func_areaportal` and `func_areaportalwindow` no longer exist in Source 2. A solution is to manipulate VIS blocks which encourages breaking line of sight between the areas. For this, use [`visibility_hint`](/Entities/visibility_hint.mdx) entity to cut VIS manually, and define the **Hint Type** to specify the desired operation:
* [x, y, z]-axis: cut VIS along an axis.
* Higher resolution [8 units]: increase the resolution (i.e. have smaller voxels) within the volume of visbility_hint.
:::note
This solution does not disable drawing of adjacent areas, which was often used in Source 1 to help with performance.
:::

## Changing Voxel Size
In certain situations, such as in large maps with open areas, it may be advantageous to change the voxel size. This change will drastically reduce the compilation time whilst not having a significant impact in visibility.

With [`visibility_hint`](/Entities/visibility_hint.mdx), specified areas can be marked to use lower or higher resolution than the default (8 units). The method of operation works similarly to a lightprobing volume by changing the volume by dragging the gizmos in each axis. Within the entity properties window, set the **Hint Type** to the desired resolution.

Recommended voxel sizes are 16 or 32, as these values have worked well from our experiences. However, higher voxel size may introduce new VIS issues between different areas. Make sure separations between areas are greater than the VIS voxel size.

:::tip
To set a global voxel resolution, a single [`visibility_hint`](/Entities/visibility_hint.mdx) which covers the entire map can be used.
:::