import { config } from "dotenv";
import * as prismic from "@prismicio/client";

config({ path: ".env.local" });

import { repositoryName } from "../../src/prismicio";
import { buildHomepageDocument } from "./homepage";
import { buildProjectDocuments, projectSeeds } from "./projects";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  throw new Error("Missing PRISMIC_WRITE_TOKEN (see .env.local)");
}

const writeClient = prismic.createWriteClient(repositoryName, {
  writeToken,
});

const migration = prismic.createMigration();

const projectDocs = buildProjectDocuments(migration);

// "Recent Projects" shows every project, in the same order as the old
// src/data.ts `projects` array.
const featuredProjects = projectSeeds.map((seed) => projectDocs[seed.slug]);

const existingHomepage = await writeClient.getSingle("homepage");
buildHomepageDocument(migration, existingHomepage, featuredProjects);

console.log(
  `Migrating ${projectSeeds.length} project(s) and 1 homepage document...`
);

await writeClient.migrate(migration, {
  reporter: (event) => console.log(event),
});

console.log(
  "\nDone. Content was written to a migration release, not published yet."
);
console.log(
  "Review it in the Prismic dashboard (Releases) before publishing."
);
