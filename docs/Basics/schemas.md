---
title: Schemas
description: Source 2' built in reflection system.
sidebar_position: 10
---

Source 2 keeps a description of its own C++ classes at runtime: every class, every field, the field's name, type and offset in memory. That registry is the **schema system**, and a lot of the engine's file handling is built on it.

:::info
The [Schema Explorer](https://s2v.app/SchemaExplorer) publishes the class and field tables per game. Source2Viewer links directly into it from its own enums, for example [`EntityIOTargetType_t`](https://s2v.app/SchemaExplorer/cs2/entity2/EntityIOTargetType_t).
:::

## Why it matters to authors

**Entity properties are schema fields.** The keyvalues set in [Hammer](../EngineTools/HammerEditor/index.mdx) end up bound to real class members. The [FGD](./fgd.md) supplies the label and the default, the schema supplies the actual field.

**Typed data files are schema classes.** A [`.vdata` file](../FileFormats/cs2_detail_props/index.mdx) declares which class it describes, and the engine builds that class from the file. Weapons, abilities, precipitation, subclasses and similar game data all work this way, which is why those files have strict field names and no free-form keys.

**Binary KV3 relies on it.** A compiled KV3 file can store its data without repeating field names, because the schema already knows the layout. See [KV3](../FileFormats/kv3.md#kv3-and-schemas).

## Consequences

Schemas are **per build**. Field names change, fields get added and removed, and offsets shift with almost every game update. Anything that hardcodes a layout breaks on patch day; anything that looks names up keeps working.

Schemas are **per game**. Two Source 2 titles share the engine classes and nothing else, so a field that exists in CS2 need not exist in Dota 2.

Schema names are the names that appear in error messages. When the [console](../EngineTools/VConsole/index.mdx) complains about `CParticleSystemDefinition` or `CCitadelAbility`, that is a schema class name, not a file name.

## Browsing them

The [Schema Explorer](https://s2v.app/SchemaExplorer) lists the classes and fields for the supported games. It is the fastest way to check whether a field exists, and what it is called, before writing it into a data file.

## An example

`C_OP_CurlNoiseForce` is one particle operator, the curl noise force. Its schema class is what the [Particle Editor](../EngineTools/ParticleEditor/index.mdx) builds its property panel from and what a compiled `.vpcf` stores:

| Field | Type | Shown in the editor as |
| --- | --- | --- |
| `m_nNoiseType` | `ParticleDirectionNoiseType_t` | noise type |
| `m_vecNoiseFreq` | `CPerParticleVecInput` | noise frequency |
| `m_vecNoiseScale` | `CPerParticleVecInput` | noise amplitude |
| `m_vecOffset` | `CPerParticleVecInput` | offset |
| `m_vecOffsetRate` | `CPerParticleVecInput` | offset rate |
| `m_flWorleySeed` | `CPerParticleFloatInput` | worley seed |
| `m_flWorleyJitter` | `CPerParticleFloatInput` | worley jitter |

Three things that table shows, and that the [Schema Explorer](https://s2v.app/SchemaExplorer/cs2/particles/C_OP_CurlNoiseForce) shows for any class:

- **The type is rarely just a number.** `CPerParticleVecInput` is a whole structure, not a `Vector`: a value that may be a literal, a control point, a random range, a curve or a noise function, which is why one of these fields is over a kilobyte rather than twelve bytes.
- **The editor's label is not the field name.** The friendly name is metadata on the field, and it does not have to agree: `m_vecNoiseScale` is labelled *noise amplitude*. Going from what you see in the editor to what you find in a `.vpcf` means using that mapping.
- **Defaults live on the class.** Each class carries its default document, which is where values like `m_flLiteralValue` come from. The compiler writes only what differs from it, which is why a `.vpcf` is far shorter than the class it describes.

The same class in Half-Life: Alyx is a different shape: a `bool` called `m_useCurl` and three plain `Vector` fields, 368 bytes against Counter-Strike 2's 8112. Same name, same operator, different schema, which is the per game and per build point above in concrete form.

## Field naming

Field names carry a prefix for the kind of value they hold. Nothing enforces it, so it is a reading aid rather than a hard rule, but it holds across almost the whole schema:

| Prefix | Holds | Example |
| --- | --- | --- |
| `m_fl` | float | `m_flWorleySeed` |
| `m_n` | integer, often an enum | `m_nNoiseType` |
| `m_i` | integer | `m_iHealth` |
| `m_b` | bool | `m_bUseBoundsCenter` |
| `m_v`, `m_vec` | vector | `m_vecNoiseFreq` |
| `m_q` | quaternion | `m_qRotation` |
| `m_h` | handle to another object | `m_hOwnerEntity` |
| `m_str`, `m_sz`, `m_isz` | string | `m_strSnapshotSubset` |
| `m_p` | pointer | `m_pParent` |

The prefix describes the value, not the C++ type, which is how `m_vecNoiseScale` can be a `CPerParticleVecInput` rather than a `Vector`, and it is sometimes ignored outright: `C_OP_SetControlPointOrientation::m_vecRotation` is a `QAngle`.

## Technical details

### Where the schema lives

Every engine module registers its classes with the schema system on load. A registration carries, per class, the class name, its size, and a table of fields with name, type and byte offset. Nothing is read from a file on disk: the type information is compiled into the binaries themselves, which is why a schema dump is only valid for the exact build it came from.

The scale is larger than it sounds. A current CS2 build registers on the order of ten thousand classes and forty thousand fields across its modules, with the biggest contributors being `resourcecompiler`, `server`, `client`, `animationsystem` and `particles`.

### Types

Fields are typed by reference to a per module type table rather than by a type id in the field record. The table covers the builtins (`int8` through `uint64`, `float32`, `float64`, `bool`), pointers, fixed arrays, bitfields, enums and named classes, plus the engine's own atomic types:

| Atomic type | Size |
| --- | --- |
| `Vector2D` | 8 |
| `Vector`, `QAngle` | 12 |
| `Vector4D`, `Quaternion`, `V_uuid_t` | 16 |
| `CTransform` | 32 |
| `matrix3x4_t` | 48 |
| `Color` | 4 |

Those sizes are the reason a compiled entity lump or vdata file can pack a transform into a fixed number of bytes without recording a layout.

### Why it changes every patch

Field offsets are byte offsets into a C++ class. Adding one member anywhere near the top shifts everything after it. Names are far more stable than offsets, so any tool that survives updates looks fields up by name and treats offsets as build specific.

The same applies across games: two Source 2 titles share the engine classes and nothing else, so `CCitadelAbility` exists only in Deadlock and CS2's weapon classes exist only in CS2.