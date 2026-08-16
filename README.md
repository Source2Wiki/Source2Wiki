# [Website](https://www.source2.wiki/)

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Running locally

```bash
npm start
```

That installs whatever is missing, generates the entity pages and starts a local development server. Most changes are reflected live without having to restart the server.

On windows you can double click `run.bat` instead, which installs node for you if you don't have it and then does the same thing.

## Entity pages

Everything under `docs/Entities` and `src/pages/Entities` is generated, don't edit those files by
hand. `npm start` and `npm run build` generate them from the JSON in `fgd_dump`, and `npm start`
keeps regenerating as you edit, so to change what an entity page says you add an override file to
`fgd_dump_overrides` and save.

`fgd_dump` itself comes from [WikiPageTools](https://github.com/Source2Wiki/WikiPageTools), which
needs the games installed to read their FGDs and unpack the entity icons out of their VPKs. Its
output is checked in, so that only has to run when a game updates.
