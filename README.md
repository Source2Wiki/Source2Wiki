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

## cs_script API page

The tables on the cs_script API documentation page are generated from `point_script.d.ts`, which
Valve ships with CS2. A copy lives in `cs_script_dump`, so updating the page is:

```bash
npm run generate-cs-script-docs
```

The page imports the generated tables, so there is nothing to paste.

This updates itself: [GameTracking](https://github.com/SteamTracking/GameTracking) sends this repo
an `app-update` event when CS2 changes, and `on-game-update.yml` fetches the new file, regenerates
and commits if anything differs. To update by hand, copy the newer `point_script.d.ts` into
`cs_script_dump` from
`<steam>\steamapps\common\Counter-Strike Global Offensive\content\csgo\maps\editor\zoo\scripts`
and run the command above.
