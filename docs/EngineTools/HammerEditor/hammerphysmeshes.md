---
title: Physics simulation in Hammer
description: How to simulate physics with Hammer meshes and models.
---

This guide will teach you how to simulate physics with your Hammer meshes/models.

:::info
For the physics engine inside Hammer to simulate, the object needs to have **convex collisions**. If not, the simulation will not run.
:::
--- 

## Physics Simulation with Models
1. Add a model to the world (can be any type of prop entity, e.g., **prop_static, prop_dynamic, prop_physics**).  
![hammerphysmeshes_models1](./img/hammerphysmeshes/hammerphysmeshes_models1.png "hammerphysmeshes_models1")
---  

2. Open the simulation tool or press **Shift + C** in case there is no Hammer icon (this happens in SteamVR).  
![hammerphysmeshes_models2](./img/hammerphysmeshes/hammerphysmeshes_models2.png "hammerphysmeshes_models2")
---  

3. Press **Space** to run the simulation.
<div>
<video width="100%" controls>
  <source src="/video/hammerphysmeshes_model.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video> 
</div>
---   

4.  Press **Space** to start or stop the simulation.

---  
### Fix Some Props That Cannot Run in the Physics Simulation
Many times when running the physics simulation, a message appears saying:  
![hammerphysmeshes_models5](./img/hammerphysmeshes/hammerphysmeshes_models5.png "hammerphysmeshes_models5")

This can be fixed if the collision mesh is set to convex collision.  

<details>
<summary>**Games with ModelDoc Editor**</summary>
:::todo
The ModelDoc workflow for physics meshes is not written up yet.
:::
</details>  

<details>
<summary>**Games with Model Editor (only <Game name="steamvr"/>)**</summary>

In the **Physic Meshes** node, enable the **convexify** option.  
![hammerphysmeshes_models3](./img/hammerphysmeshes/hammerphysmeshes_models3.png "hammerphysmeshes_models3")  
![hammerphysmeshes_models4](./img/hammerphysmeshes/hammerphysmeshes_models4.png "hammerphysmeshes_models4")  
</details>  

---  
## Physics Simulation with Meshes
1. Create a new mesh in your world. 
:::warning
Mesh entities are not supported for physics simulation.
:::
![hammerphysmeshes_meshes1](./img/hammerphysmeshes/hammerphysmeshes_mesh1.png "hammerphysmeshes_meshes1")  

---  
2. Open the property panel of the mesh (**Alt+Enter**) and set the collision to **single convex hull** or **multiple convex hulls**.  
![hammerphysmeshes_meshes2](./img/hammerphysmeshes/hammerphysmeshes_mesh2.png "hammerphysmeshes_meshes2")  
![hammerphysmeshes_meshes3](./img/hammerphysmeshes/hammerphysmeshes_mesh3.png "hammerphysmeshes_meshes3")  

--- 
3. Press **Space** to run the simulation.
<div>
<video width="100%" controls>
  <source src="/video/hammerphysmeshes_mesh.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video> 
</div>

--- 
4.  Press **Space** to start or stop the simulation.