---
title: KV3
description: KeyValues 3, its text form, its binary encodings and where each one is used.
sidebar_position: 4
---

KeyValues 3 is the general purpose data format of Source 2. It replaced the untyped KeyValues of Source 1 and carries real types: integers, floats, booleans, null, strings, binary blobs, arrays and objects.

It shows up in three places:

- **authored source files**, such as `.vpost`, `.vsndevts` and `.vdata`
- **the `DATA` block** of most [compiled resources](./index.mdx)
- **loose runtime files**, for example `addoninfo.txt` in newer games

## Text form

A text KV3 file starts with a header comment naming two identifiers:

```
<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->
{
    m_flExposure = 1.0
    m_bEnabled = true
    m_sName = "example"
}
```

**Encoding** says how the bytes are laid out, here as text. **Format** says what the document is supposed to contain, here `generic`, meaning no particular schema. Specialised formats have their own GUIDs, and the mapping from GUID to name is a lookup table: [`KV3IDLookup.cs`](https://github.com/ValveResourceFormat/ValveResourceFormat/blob/master/ValveResourceFormat/Serialization/KeyValues/KV3IDLookup.cs).

The body is comma-free, uses `=` between key and value, and supports multi-line strings, arrays in `[ ]`, nested objects in `{ }`, and typed prefixes such as `resource:` on a value that names another asset.

## Binary forms

Compiled KV3 begins with a four byte magic:

| Magic | Bytes | Notes |
| --- | --- | --- |
| `VKV\x03` | `0x03564B56` | the original form, header carries an encoding GUID and a format GUID |
| `KV3\x01` | `0x4B563301` | first versioned form, no compression fields |
| `KV3\x02` | `0x4B563302` | adds compression frame data and object, array and type counts |
| `KV3\x03` | `0x4B563303` | |
| `KV3\x04` | `0x4B563304` | adds a two byte value count and per block compressed sizes |
| `KV3\x05` | `0x4B563305` | splits the payload into two buffers, each with its own counts |

Constants: [`BinaryKV3.cs#L42`](https://github.com/ValveResourceFormat/ValveResourceFormat/blob/master/ValveResourceFormat/Resource/ResourceTypes/BinaryKV3.cs#L42).

Which one appears depends on the game's engine branch rather than on the asset type. Current CS2 and Deadlock files are version 5, Aperture Desk Job is version 2, Half-Life: Alyx is version 1, and the oldest Source 2 games predate binary KV3 entirely and pack `DATA` as C structs described by an `NTRO` block.

After the magic comes the format GUID, then a compression method:

```cpp
enum KV3BinaryCompressionMethod : uint32 {
    Uncompressed = 0,
    Lz4          = 1,
    Zstd         = 2,
};
```

Then, depending on version, the counts the reader needs to size its buffers before decompressing:

| Version | Header fields after the compression method |
| --- | --- |
| 1 | counts of 1, 4 and 8 byte values, uncompressed size |
| 2 and 3 | compression dictionary id, frame size, counts of 1, 4 and 8 byte values, type count, object count, array count, uncompressed and compressed size, block count, binary blob bytes |
| 4 | the above plus 2 byte value count and the size of the block compressed size table |
| 5 | the above plus separate uncompressed and compressed sizes and counts for a second buffer |

## Why it is laid out that way

A binary KV3 document is not a tree written out node by node. Values of the same width are pooled into separate buffers, strings go into a string table, and a type buffer records the shape of the document. Reading it means walking the type buffer and pulling each value from the buffer that holds its width.

This is why the header is a list of counts: the reader allocates each buffer up front, decompresses into it, and then walks the structure without any further allocation.

The value types themselves are a single byte each:

```cpp
enum KV3BinaryNodeType : uint8 {
    NULL = 1, BOOLEAN = 2, INT64 = 3, UINT64 = 4, DOUBLE = 5,
    STRING = 6, BINARY_BLOB = 7, ARRAY = 8, OBJECT = 9, ARRAY_TYPED = 10,
    INT32 = 11, UINT32 = 12, BOOLEAN_TRUE = 13, BOOLEAN_FALSE = 14,
    INT64_ZERO = 15, INT64_ONE = 16, DOUBLE_ZERO = 17, DOUBLE_ONE = 18,
    FLOAT = 19, INT16 = 20, UINT16 = 21, INT32_AS_BYTE = 23,
    ARRAY_TYPE_BYTE_LENGTH = 24, ARRAY_TYPE_AUXILIARY_BUFFER = 25,
};
```

The singleton types `BOOLEAN_TRUE`, `INT64_ZERO` and `DOUBLE_ONE` encode both the type and the value in one byte, because those constants dominate real documents.

## KV3 and schemas

A KV3 document is self describing, so a parser does not need a schema to read one. The engine still uses schemas on top: a `.vdata` file names the class it describes, and the engine builds that class from the document, which is why field names in those files are fixed rather than free-form.
