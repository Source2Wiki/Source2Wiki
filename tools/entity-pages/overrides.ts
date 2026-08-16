/**
 * Merging \fgd_dump_overrides on top of the dumped pages.
 *
 * The format for an override filename is 'entityClassname'-'gameFileSystemName'.json or just
 * 'entityClassname'.json. If only entityClassname is provided, we treat the override as being
 * global. Global overrides get processed first, then game specific ones.
 */

import path from "node:path";

import { Game, gameList, getGameByFileSystemName } from "./games";
import {
  Annotation,
  EntityDocument,
  EntityPage,
  InputOutput,
  Option,
  Property,
  parseEntityPageFile,
} from "./model";

export function handleOverrides(files: string[], docsDictionary: Map<string, EntityDocument>): void {
  const globalPageOverrides: [string, EntityPage][] = [];
  const gameSpecificPageOverrides: [string, EntityPage][] = [];

  for (const file of files) {
    if (path.extname(file) !== ".json") {
      continue;
    }

    const splitFilename = path.parse(file).name.split("-");

    const entityClass = splitFilename[0];
    const entityGames: Game[] = [];

    const docToOverride = docsDictionary.get(entityClass);

    for (const gameString of splitFilename.slice(1)) {
      const game = getGameByFileSystemName(gameString);

      if (game === null) {
        throw new Error(
          `Invalid override entity game '${gameString}'! valid game names are: \n\n` +
            `${gameList.map((listed) => listed.fileSystemName).join("\n")}\n` +
            "\nIn case you meant to make this a global override for all games, simply remove the - at the end, and make the filename be {entityClassname}.json\n",
        );
      }

      entityGames.push(game);
    }

    if (docToOverride === undefined) {
      console.log(`Could not match any entity to '${entityClass}' override, adding as non-FGD entity!`);

      const nonFGDDoc: EntityDocument = { Name: entityClass, Pages: [] };
      docsDictionary.set(entityClass, nonFGDDoc);

      // add the same page to all games if no games are specificed
      for (const gameDef of entityGames.length === 0 ? gameList : entityGames) {
        const overrideEntitypage = parseEntityPageFile(file);
        overrideEntitypage.NonFGD = true;
        overrideEntitypage.Game = gameDef;
        overrideEntitypage.Name = entityClass;
        nonFGDDoc.Pages.push(overrideEntitypage);
      }

      continue;
    }

    if (entityGames.length === 0) {
      globalPageOverrides.push([entityClass, parseEntityPageFile(file)]);
      continue;
    }

    for (const page of docToOverride.Pages) {
      for (const game of entityGames) {
        if (page.Game === game) {
          const overrideEntitypage = parseEntityPageFile(file);

          overrideEntitypage.Game = game;
          gameSpecificPageOverrides.push([entityClass, overrideEntitypage]);
        }
      }
    }
  }

  console.log(`\nLoaded '${globalPageOverrides.length}' global page override(s).`);
  for (const [globalOverrideClassname, globalOverride] of globalPageOverrides) {
    for (const page of docsDictionary.get(globalOverrideClassname)!.Pages) {
      console.log(`Overriding page '${page.Name}' from game '${page.Game!.fileSystemName}'`);
      overridePageFrom(page, globalOverride);
    }
  }

  console.log(`\nLoaded '${gameSpecificPageOverrides.length}' game specific page override(s).`);
  for (const [gameSpecificOverrideClassname, gameSpecificOverride] of gameSpecificPageOverrides) {
    for (const page of docsDictionary.get(gameSpecificOverrideClassname)!.Pages) {
      if (page.Game === gameSpecificOverride.Game) {
        console.log(`Overriding page '${page.Name}' from game '${page.Game!.fileSystemName}'`);
        overridePageFrom(page, gameSpecificOverride);
      }
    }
  }
}

function overridePageFrom(page: EntityPage, overridePage: EntityPage): void {
  if (overridePage.EntityType !== null) {
    page.EntityType = overridePage.EntityType;
  }

  if (overridePage.Name !== null) {
    page.Name = overridePage.Name;
  }

  if (overridePage.Description !== null) {
    page.Description = overridePage.Description;
  }

  if (overridePage.IconPath !== null) {
    page.IconPath = overridePage.IconPath;
  }

  if (overridePage.Legacy !== null) {
    page.Legacy = overridePage.Legacy;
  }

  if (overridePage.NonFGD !== null) {
    page.NonFGD = overridePage.NonFGD;
  }

  if (overridePage.PageAnnotation !== null) {
    page.PageAnnotation = overridePage.PageAnnotation;
  }

  for (const overrideProperty of overridePage.Properties) {
    const matches = page.Properties.filter(
      (property) => property.InternalName === overrideProperty.InternalName,
    );

    for (const property of matches) {
      overridePropertyFrom(property, overrideProperty);
    }

    if (matches.length === 0) {
      overrideProperty.VariableType ??= "Void";
      page.Properties.push(structuredClone(overrideProperty));
    }
  }

  for (const overrideInputOutput of overridePage.InputOutputs) {
    const matches = page.InputOutputs.filter(
      (inputOutput) => inputOutput.Name === overrideInputOutput.Name,
    );

    for (const inputOutput of matches) {
      overrideInputOutputFrom(inputOutput, overrideInputOutput);
    }

    if (matches.length === 0) {
      page.InputOutputs.push(structuredClone(overrideInputOutput));
    }
  }
}

function overridePropertyFrom(property: Property, overrideProperty: Property): void {
  if (overrideProperty.FriendlyName !== null) {
    property.FriendlyName = overrideProperty.FriendlyName;
  }

  if (overrideProperty.VariableType !== null) {
    property.VariableType = overrideProperty.VariableType;
  }

  if (overrideProperty.Description !== null) {
    property.Description = overrideProperty.Description;
  }

  for (const overrideOption of overrideProperty.Options) {
    const matches = property.Options.filter((option) => option.Name === overrideOption.Name);

    for (const option of matches) {
      overrideOptionFrom(option, overrideOption);
    }

    if (matches.length === 0) {
      property.Options.push(structuredClone(overrideOption));
    }
  }

  for (const overrideAnnotation of overrideProperty.Annotations) {
    const matches = property.Annotations.filter(
      (annotation) => annotation.InternalName === overrideAnnotation.InternalName,
    );

    for (const annotation of matches) {
      overrideAnnotationFrom(annotation, overrideAnnotation);
    }

    if (matches.length === 0) {
      property.Annotations.push(structuredClone(overrideAnnotation));
    }
  }
}

function overrideOptionFrom(option: Option, overrideOption: Option): void {
  if (overrideOption.Description !== null) {
    option.Description = overrideOption.Description;
  }

  if (overrideOption.Key !== null) {
    option.Key = overrideOption.Key;
  }
}

function overrideInputOutputFrom(inputOutput: InputOutput, overrideInputOutput: InputOutput): void {
  if (overrideInputOutput.Description !== null) {
    inputOutput.Description = overrideInputOutput.Description;
  }

  if (overrideInputOutput.VariableType !== null) {
    inputOutput.VariableType = overrideInputOutput.VariableType;
  }

  if (overrideInputOutput.Type !== null) {
    inputOutput.Type = overrideInputOutput.Type;
  }
}

function overrideAnnotationFrom(annotation: Annotation, overrideAnnotation: Annotation): void {
  if (overrideAnnotation.Type !== null) {
    annotation.Type = overrideAnnotation.Type;
  }

  if (overrideAnnotation.Message !== null) {
    annotation.Message = overrideAnnotation.Message;
  }
}
