// what the entity page generator puts in an entity document's front matter as `entity_embed`, for
// its Discord link card, see tools/entity-pages/mdx.ts
export interface EntityEmbed {
  // already Discord markdown
  description: string;
  games: {
    game: string;
    type: string | null;
    keyvalues: number;
    inputs: number;
    outputs: number;
  }[];
}
