---
title: VPK
description: Valve Pak, the archive format Source ships content in, its header, directory tree, chunk files, hashes and signature.
sidebar_position: 2
---

A VPK (Valve Pak) is the uncompressed archive format Source and Source 2 package content in. Almost everything a game loads at runtime comes out of one.

A VPK appears in three places:

- **the game's content archives**, `pak01_dir.vpk` plus its numbered chunks in the game directory
- **every compiled map**, a self contained VPK of its own
- **workshop items and addons**, which are published and mounted as VPKs

How the engine finds and mounts them is covered in [Content mounting](../Basics/content-mounting.md).

The format is simple: a header, a directory tree naming every file, and the file bytes laid end to end. There is no compression and no encryption, so reading one only requires walking the tree and seeking.

The format dates from Left 4 Dead, where it replaced the GCF archives earlier Source games used. The oldest packages predate the header entirely; the 12 byte version 1 header arrived in a 2009 update, version 2 followed, and the SteamPipe transition backported the format to the whole of Source 1. Source 2 kept it unchanged.

## The _dir file and its chunks

A VPK is usually not one file but a directory file plus a set of numbered data archives:

```
game/csgo/
├── pak01_dir.vpk     the index
├── pak01_000.vpk     data
├── pak01_001.vpk     data
└── ...               more numbered archives
```

`pak01_dir.vpk` holds the tree and, for every entry, which archive holds the data, at what offset, how long it is, and a CRC32 of it. It carries little or no bulk content itself, which is why it stays small. As an example, a current CS2 install splits 48.6 GB of content across 495 numbered archives, indexed by a 7.6 MB directory file.

The `_dir` file is the entry point: tools that ask for a VPK expect that one, and the numbered files are not readable on their own.

A VPK does not have to be split. A compiled map is a single self contained `.vpk` with no `_dir` in its name and no numbered siblings.

## Header

```cpp
struct VPKHeader {
    uint32 signature;              // 0x55AA1234
    uint32 version;                // 1 or 2

    uint32 treeSize;               // bytes of directory tree following this header

    // version 2 only
    uint32 fileDataSectionSize;    // bytes of file data stored in this file
    uint32 archiveMD5SectionSize;
    uint32 otherMD5SectionSize;    // 48, or 0
    uint32 signatureSectionSize;
};
```

Version 1 stops after `treeSize`, giving a 12 byte header. Version 2 adds four section sizes for a 28 byte header.[^1]

:::info
The version is not a Source 1 versus Source 2 distinction. The Lab, a 2016 Source 2 title, ships version 1 paks, and Source 1 CS:GO shipped version 2. Every current Source 2 game writes version 2.
:::

Sections follow in a fixed order, each one directly after the last:

```
header
directory tree            treeSize
file data                 fileDataSectionSize
archive hashes            archiveMD5SectionSize
tree/hash/file MD5s       otherMD5SectionSize
signature descriptor      signatureSectionSize
```

## Directory tree

The tree is three nested levels of strings terminated by a null byte (`\0`), each level ended by an empty string: extension, then directory, then file name. Every file name is followed by its entry:

```cpp
struct VPKDirectoryEntry {
    uint32 crc32;          // CRC32 of the file contents
    uint16 preloadBytes;   // bytes stored inline, immediately after this struct
    uint16 archiveIndex;   // which pak01_NNN.vpk, or 0x7FFF for this file
    uint32 entryOffset;    // offset into that archive
    uint32 entryLength;
    uint16 terminator;     // 0xFFFF
};
```

If `preloadBytes` is non zero, that many bytes of the file follow the struct inline and are the **start** of the file. `entryLength` then counts only the remainder, so the real size is `preloadBytes + entryLength`, and an entry with `entryLength = 0` is stored entirely in its preload bytes.

The CRC32 lets a reader verify an entry's bytes with no other metadata. Verification tools check it, `Source2Viewer-CLI --vpk_verify` and Valve's own vpk tool among them; the hash sections later in the file cover the same data again at the package level.

Because the tree is grouped by extension first, a full path is reassembled as `directory + "/" + fileName + "." + extension`, and a VPK listing tends to come out sorted by type rather than by folder.

Two encoding quirks affect readers:

- A file with no extension, or a file at the package root, stores a single space (`" "`) rather than an empty string, since an empty string terminates the level.
- Directory names are always lower case and always use `/`, on every platform.

Paths inside mirror the mod directory the VPK belongs to, with **compiled** extensions:

```
materials/dev/reflectivity_30.vmat_c
models/props/de_dust/hr_dust/dust_windows/window_ledge.vmdl_c
particles/explosions_fx/explosion_smoke.vpcf_c
soundevents/soundevents_addon.vsndevts_c
```

## Where the bytes live

`archiveIndex` decides where `entryOffset` points:

| Value | Meaning |
| --- | --- |
| `0` to `0x7FFE` | offset into `basename_NNN.vpk`, zero based from the start of that file |
| `0x7FFF` | offset into the file data section of *this* file, so the absolute position is `headerSize + treeSize + entryOffset` |

Both forms appear in shipped content. A `pak01_dir.vpk` normally puts everything in numbered archives and reports `fileDataSectionSize = 0`. A map VPK is the opposite: every entry reports `0x7FFF` and the bytes live in the file data section of the same file. CS2's `maps/de_dust2.vpk` is one example, a single 262 MB file laid out this way.

Offsets and lengths are 32 bit, so a single archive tops out at 4 GiB. Shipped chunks stay far below the limit; CS2's, for example, range from 24 to 120 MB.

:::info
Preload bytes are essentially a Source 1 feature: Source 1 CS:GO, for example, inlines the starts of thousands of files so the engine can begin reading a header without touching a second file. Across every current Source 2 game the count is zero, the sole exception being two entries in Artifact Classic.
:::

## Archive hashes

The archive hash section is a flat array of 28 byte records, one per 1 MiB fraction of chunk data:

```cpp
struct VPKArchiveHash {
    uint16 archiveIndex;   // 0x7FFF for the file data section of this file
    uint16 hashType;       // 0 = MD5, 1 = Blake3
    uint32 offset;         // offset within that archive
    uint32 length;         // 0x100000, or less for the final fraction
    byte   checksum[16];
};
```

Valve's own writer emits both hash types, and mixes them freely within one package as chunks get rewritten by successive updates. Blake3 is the newer of the two, so a package that has not been touched in years is all MD5 and a recently rebuilt one is all Blake3; Deadlock's `pak01_dir.vpk`, for example, is Blake3 only.

Readers handle one special case: a hash type of `0x8000` with an archive index of `0` means the record covers this file's own data section, and gets remapped to `0x7FFF` with MD5. Valve's own tools do not write it, a map VPK hashes its own data section as `0x7FFF` directly; the workshop publishing path is what produces the `0x8000` form.

## The other MD5 section

Exactly 48 bytes when present, three MD5 hashes back to back:

| Offset | Covers |
| --- | --- |
| 0 | the directory tree, `treeSize` bytes from the end of the header |
| 16 | the whole archive hash section |
| 32 | everything in the file up to this point |

These sections are optional: <Game name="hla" iconOnly/> Half-Life: Alyx, for example, writes the 48 byte block but ships no archive hashes and no signature.

## Signature

When `signatureSectionSize` is 20, the section is a descriptor rather than the signature itself:

```cpp
struct VPKSignatureSection {
    uint32 magic;              // 0x55AA1234 again, this is how the form is detected
    uint32 signatureType;      // 1 = signature over the whole file MD5
    uint32 publicKeySize;
    uint32 signatureSize;
    uint32 reserved;
    // publicKeySize bytes of DER public key, then signatureSize bytes of signature,
    // both of which sit past the 20 bytes this field claims
};
```

The key and signature bytes are **not** counted by `signatureSectionSize`. In CS2's `pak01_dir.vpk` the sections account for the whole file:

```
28 header + 6,185,016 tree + 0 data + 1,399,832 hashes + 48 md5 + 20 descriptor
   + 550 public key + 512 signature = 7,586,006 bytes = the file size on disk
```

The signature is RSA with PKCS#1 padding. Type 1 signs a SHA-256 over the 16 byte whole file MD5 from the previous section, rather than over the file itself, which makes verification cheap once the MD5 is known.

The older form, used by signed Source 1 packages, has no descriptor and is detected by the section not starting with the magic number:

```cpp
struct VPKSignatureSectionV0 {
    uint32 publicKeySize;               // 160 in shipped Source 1 packages
    byte   publicKey[publicKeySize];
    uint32 signatureSize;               // 128
    byte   signature[signatureSize];
};
```

This form signs everything in the file before the signature section.

A descriptor with `publicKeySize` and `signatureSize` both zero is a package that reserved the space and shipped unsigned. Deadlock ships this form, as does every published workshop item: only Valve's own build pipeline signs packages.

Hashes and signatures are a shipping pipeline choice, not a format requirement: of the current games only CS2 and Dota 2, the two with a live update cadence, use them fully.

## Maps and nesting

Every compiled map is its own VPK:

```
game/csgo/maps/de_dust2.vpk
game/csgo_addons/my_addon/maps/my_map.vpk
```

A VPK entry can itself be another VPK, and workshop content relies on this. A published CS2 map addon, for example, is a VPK holding ordinary content at the usual paths, with the map itself packed inside as `maps/<mapname>.vpk`, normally alongside a second nested VPK for the 3D skybox.

Everything outside `maps/` in such a package is loose content at engine paths: `materials/`, `models/`, `sounds/`, `soundevents/`, `particles/`, `scripts/`, `panorama/`, `postprocess/`, `cfg/`. Which directories a workshop item carries by default is an include list in the main mod's `gameinfo.gi`; see [Workshop packing](../Basics/content-mounting.md#workshop-packing).

## Writing

The resource compiler produces game VPKs, see [`-novpk` and `-vpkincr`](../EngineTools/ResourceCompiler/index.mdx) for the flags that control it. Half-Life: Alyx and SteamVR Home also ship Valve's own `vpk.exe` in `game\bin\win64`, a command line packer supporting response files, multi chunk output (`-M`), keypair signing and a SteamPipe friendly incremental mode; the other Source 2 games do not ship it.

Writing one by hand, with <Tool name="github" suffix="ValvePak" link="https://github.com/ValveResourceFormat/ValvePak"/>:

```csharp
using var package = new Package();

package.AddFile("models/example.vmdl", File.ReadAllBytes("example.vmdl"));

// multiChunk assigns the file to a numbered chunk instead of the directory file
package.AddFile("models/big.vmdl", File.ReadAllBytes("big.vmdl"), multiChunk: true);

package.Write("pak01_dir.vpk");
```

Writer limits:

| Limit | Value | Where it comes from |
| --- | --- | --- |
| Data in one chunk file | 4 GiB | format, entry offsets are unsigned 32 bit |
| Chunk file count | 32,767 | format, `0x7FFF` is taken as the sentinel |
| Data in the directory file | 2 GiB | ValvePak, it writes the section size as a signed int |
| Default chunk size | 200 MiB | ValvePak setting, adjustable |

ValvePak also refuses to write back a package that was opened from a `_dir.vpk`.

## Reading

<Tool name="s2v"/> browses and extracts VPKs. Extracting gives compiled `_c` resources, not the original source assets. Turning those back into something editable is a separate step, and not always possible.

<Tool name="github" suffix="VPKEdit" link="https://github.com/craftablescience/VPKEdit"/> is a standalone community editor that reads, creates and edits VPK files of both versions.

[^1]: Respawn's Titanfall and Apex Legends use a version stamp of `0x00030002` and a heavily modified layout that compresses its entries. It shares the magic number and nothing else, and general Source tooling will not read it.
