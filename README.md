# [Website](https://www.source2.wiki/)

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Running locally

```bash
npm start
```

That installs whatever is missing, generates the entity pages and starts a local development server. Most changes are reflected live without having to restart the server.

On windows you can double click `run.bat` instead, which installs node for you if you don't have it and then does the same thing.

## Entity pages

Everything under `docs/Entities` and `src/entityTabs` is generated, don't edit those files by
hand. `npm start` and `npm run build` generate them from the JSON in `dump/fgd`, and `npm start`
keeps regenerating as you edit, so to change what an entity page says you add an override file to
`dump/fgd_overrides` and save.

`dump/fgd` itself comes from [WikiPageTools](https://github.com/Source2Wiki/WikiPageTools), which
needs the games installed to read their FGDs and unpack the entity icons out of their VPKs. Its
output is checked in, so that only has to run when a game updates.

## cs_script API page

The tables on the cs_script API documentation page are generated from `point_script.d.ts`, which
Valve ships with CS2. A copy lives in `dump/cs_script`, so updating the page is:

```bash
npm run generate-cs-script-docs
```

The page imports the generated tables, so there is nothing to paste.

This updates itself: [GameTracking](https://github.com/SteamTracking/GameTracking) sends this repo
an `app-update` event when CS2 changes, and `on-game-update.yml` fetches the new file, regenerates
and commits if anything differs. To update by hand, copy the newer `point_script.d.ts` into
`dump/cs_script` from
`<steam>\steamapps\common\Counter-Strike Global Offensive\content\csgo_addons\cs_script_demo\maps\scripts`
and run the command above.

## License

- **Code** is under the [MIT License](LICENSE).
- **Wiki content** (text, images, media and anything else contributed to the wiki) is under
  [Creative Commons Attribution-ShareAlike 4.0](LICENSE-CONTENT), the same license Wikipedia uses,
  unless otherwise noted. If you reuse it, credit Source2Wiki and share your changes under the same
  license. By contributing you agree to license your contribution under these terms.
- **Valve and other third-party material** is not covered by either license and belongs to its
  respective owners. Source 2 is a trademark of Valve Corporation, and this project is not
  affiliated with Valve.
