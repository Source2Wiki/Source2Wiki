---
description: getting started with particle editor.
title: Introduction
---

# User Interface
1. Start by creating new file by navigating to the windows context menu or by shortcut `Ctrl+N` to view full UI options.
![Interface](./assets/img/lay1.png)
---
# Functions & Properties
These two section works together and are essential to the work with particles.
below function label are 2 buttons, they are usable if there are more than one particles system are opened and serves as next/previous button for easy navigation between multiple particles.
in middle is path&name to the particle and on the right side is a asset menu
![systembuttons](./assets/img/lay2.png)
Base properties are bounds or rather core of the currently opened particle system.
They are really helpful when multiple particle systems are introduced as child relations.
![Base Properties](./assets/img/lay4.png)
:::info
Base Property Lifetime of 1 () can change how some of the functions of system works, especially those which are timed without mentioning `in seconds`
> example could be Operator `Alpha Fade and decay` which has 4 values tied to the lifetime but take proportion of it. with default value they take half second, when value base property lifetime is set to 2 they take 0.5 which equal to 1s
:::
---
## <img src={require('@site/static/img/app_icons/particle_editor_icons/func_operator.png').default} alt="pre emission operator" vertical-align="middle" width="24" height="24" /> Pre emission Operator
rarely used even by valve particle systems they help with manipulation of system before emitter start to create particles.
## <img src={require('@site/static/img/app_icons/particle_editor_icons/func_emitter.png').default} alt="Function emitter" vertical-align="middle" width="24" height="24" /> Emitter
Emitters creates/spawns renderers, their properties set either number,duration or rate to spawn they are limited by base properties maximum particles value.
- Continuous Emitter Index,Duration (s),Start Time,Emission Rate, scale emission by parent count,emit particles for parent particle events,cp with SS data, limit per udpate
- Emit noise
- Emit to Maintrain Count
- Instantaneous Emitter
## <img src={require('@site/static/img/app_icons/particle_editor_icons/func_initializer.png').default} alt="Tool Icon" vertical-align="middle" width="24" height="24" /> Initializer
their job is to take renderers created by emitters and put them to world space or position under various conditions.
- `Position along epitrochoid` this is really beautiful use of math.
Epitrochoid uses 2 radius values & point offset to paint beautiful circular patterns.
using this site we can create one by ourselves, without extensive trial & error due to density tweaking.
particle density just serves as speed for drawing, due to how complex some of the drawings can become.
multiplier in the website
![Base Properties](./assets/img/lay5.png)
`point offset = radius - 10` `Major R = Radius1` `Minor R = Radius 2`
## <img src={require('@site/static/img/app_icons/particle_editor_icons/func_operator.png').default} alt="Tool Icon" vertical-align="middle" width="24" height="24" /> Operator
Manipulates Renderers after their initializion, operators are only who can enable particles to be destroyed if whole system is not deleted by map logic or code.
## <img src={require('@site/static/img/app_icons/particle_editor_icons/func_forcegenerator.png').default} alt="Tool Icon" vertical-align="middle" width="24" height="24" /> Force Generator
changes how system behaves, usually taking from world, or adding on top of the systems functions
## <img src={require('@site/static/img/app_icons/particle_editor_icons/func_constraint.png').default} alt="Tool Icon" vertical-align="middle" width="24" height="24" /> Constraint
limits the system in various aspects mostly in movemement or bounds.
## <img src={require('@site/static/img/app_icons/particle_editor_icons/func_renderer.png').default} alt="Tool Icon" vertical-align="middle" width="24" height="24" /> Renderer
Actual visual part of the particle.

---
# Render viewer
if you have previously worked with any other S2 tool this is familiar viewport with adapted controls.
start with enabling displaying system information, this serves as somewhat perfomance monitor.
![Render viewport](./assets/img/lay6.png)