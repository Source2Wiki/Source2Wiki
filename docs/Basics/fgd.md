---
title: FGD files
description: The entity definitions Hammer reads, where they live, and what the syntax means.
sidebar_position: 11
---

An FGD (Forge Game Data) file is a plain text file that tells [Hammer](../EngineTools/HammerEditor/index.mdx) which entities exist, what properties they take, and what inputs and outputs they have. It is the reason the entity list in Hammer knows which settings entities like `light_omni2` have.

:::info
FGDs are **editor metadata only**. The game never reads them. An entity works because it exists in code, described by the [schema](./schemas.md); the FGD only describes it to the tools. Adding a class to an FGD does not create an entity, and a wrong FGD produces a map that compiles but behaves differently than the editor implied.

<Tool name="github" label="sledge-formats" link="https://github.com/LogicAndTrick/sledge-formats"/> can be used to parse modern FGD files.
:::

## Where they live

They are loose text files in the mounted game directories, for example in Counter-Strike 2:

```
game/core/base.fgd                  entities common to all Source 2 games
game/core/lights.fgd                lighting entities
game/core/models_base.fgd           prop entities
game/core/markup_volumes.fgd        nav and markup volumes
game/csgo/csgo.fgd                  CS2's own entities
game/csgo_core/models_gamedata.fgd  extra prop data
```

Hammer picks them up from the search paths, so the available files depend on which directories the game mounts. See [Content mounting](./content-mounting.md#search-paths).

## Syntax

Every example below is the same entity, `logic_relay`, as Counter-Strike 2 ships it in `base.fgd`. It is short enough to quote almost whole:

```
@PointClass base(Targetname, EnableDisable) iconsprite("editor/logic_relay.vmt") = logic_relay :
    "A message forwarder. Fires an OnTrigger output when triggered, and " +
    "can be disabled to prevent forwarding outputs."
[
    spawnflags(flags) =
    [
        1: "Only trigger once" : 0
        2: "Allow fast retrigger" : 0
    ]

    input Trigger(void) : "Trigger the relay, causing its OnTrigger output to fire if it is enabled."
    input Toggle(void) : "Toggle the relay between enabled and disabled."

    output OnSpawn(void) : "Fired when the relay is spawned."
    output OnTrigger(void) : "Fired when the relay is triggered."
]
```

Reading the first line left to right:

| Piece | Meaning |
| --- | --- |
| `@PointClass` | an entity placed as a point. `@SolidClass` is tied to geometry, `@BaseClass` is inherited from and never placed |
| `base(Targetname, EnableDisable)` | inherit the properties, inputs and outputs of these base classes |
| `iconsprite(...)` | a helper: what the editor draws for it. Others include `studioprop()`, `size()` and `line()` |
| `= logic_relay` | the classname, which is what actually ends up in the map |
| `: "..."` | the description shown in Hammer, split over several strings with `+` |
| `[ ... ]` | the property, input and output list |

Inputs and outputs are declared in that same list and take a type, `void` where there is no parameter. A `flags` property carries its bits inline, as `spawnflags` does above; a `choices` property has the same shape with a value and label per line.

### What it inherits

`logic_relay` declares no properties of its own. Everything a mapper sets on it comes from the two base classes it names, and those are ordinary definitions in the same file:

```
@BaseClass = EnableDisable
[
    StartDisabled(boolean) : "Start Disabled" : 0

    input Enable(void) : "Enable this entity."
    input Disable(void) : "Disable this entity."
]
```

A property line is `keyname(type) : "Label" : default : "Help text"`. `StartDisabled` shows the short form with no help text. `Targetname`, the other base class, shows the rest of the shape:

```
targetname(target_source) { sort_priority = 90 } : "Name" : : "The name that other entities refer to this entity by."
```

The braces are metadata for the editor, here sorting the key to the top of the property panel, and the empty default between the two colons is exactly that, no default.

`Targetname` is also where `Kill`, `AddOutput` and `RunScriptCode` come from, which is why nearly every entity accepts them without declaring them.

### Editor configuration

They also carry editor configuration, most visibly auto visgroup rules:

```
@VisGroupFilter { filter_type = "toolsMaterial"  material = "toolsclip.vmat"  group = "Tool Brushes/Clip" }
@VisGroupFilter { filter_type = "entityTag"      tag = "Lighting"             group = "Entities/Lighting" }
```

These are what populate Hammer's automatic visibility groups, either by the [tool material](../ToolTextures/index.mdx) a mesh uses or by a tag on the entity class.

## Technical details

### Parsing one

An FGD is plain text, so a small parser is easy enough, but the syntax is surprisingly complex: base class inheritance, `remove_key`, inline `choices` and `flags` blocks, helpers with arbitrary arguments, and Source 2's own additions. 

<Tool name="github" label="sledge-formats" link="https://github.com/LogicAndTrick/sledge-formats"/> already handles it. Its `Sledge.Formats.GameData` package is an MIT licensed C# FGD reader and writer, published on NuGet, and the wider library covers the other Valve editor formats alongside it.

### Property types

The type in `keyname(type)` decides the editor widget and, for name-like types, whether the value gets rewritten during prefab flattening:

| Type | Meaning |
| --- | --- |
| `float`, `integer`, `boolean`, `string` | plain values |
| `target_destination` | the name of another entity, rewritten by prefab fixup |
| `choices` | fixed list, defined inline |
| `flags` | bitfield of named flags |
| `sound` | a soundevent name |
| `remove_key` | removes an inherited key from a base class |
| `vector` | three floats |
| `color255` | RGB in 0 to 255 |
| `filterclass` | the name of a filter entity |
| `studio` | a model path |
| `angle`, `vecline`, `local_point` | values with a viewport handle |
| `target_name_or_class` | matches by entity name or by classname |
| `model_attachment`, `model_breakpiece` | picked from the referenced model |
| `instance_variable` | a value supplied by the placement |
| `target_source` | a name this entity provides |
| `sprite`, `sequence`, `material`, `materialgroup`, `particlesystem` | asset references, browsable in the editor |

The name-like family is the one to watch, because it is exactly the set that prefab name fixup rewrites.

### Entity I/O target types

Connections are not always name to name. The target of a connection carries a type:

```cpp
enum EntityIOTargetType {
    ClassName = 0, ClassNameDerivesFrom = 1, EntityName = 2,
    ContainsComponent = 3, SpecialActivator = 4, SpecialCaller = 5,
    EHandle = 6, EntityNameOrClassName = 7,
};
```

`EntityNameOrClassName` is why firing at `weapon_ak47` hits every AK in the map: map I/O resolves a target against names **and** classnames. See [`EntityIOTargetType.cs`](https://github.com/ValveResourceFormat/ValveResourceFormat/blob/master/ValveResourceFormat/Resource/Enums/EntityIOTargetType.cs) and the matching [`EntityIOTargetType_t`](https://s2v.app/SchemaExplorer/cs2/entity2/EntityIOTargetType_t) in the Schema Explorer.