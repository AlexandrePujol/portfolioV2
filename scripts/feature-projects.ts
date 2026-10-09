import { config } from "dotenv";
config({ path: ".env.local" });

import * as prismic from "@prismicio/client";
import { repositoryName } from "../src/prismicio";

// Project uids to add to the homepage's "Recent Projects" list, prepended
// (most recent first). Pass uids as CLI args to override, e.g.:
//   npx tsx scripts/feature-projects.ts my_new_project
const uidsToAdd = process.argv.slice(2);
const DEFAULT_UIDS = ["rilla", "vonder", "meadow_pictures"];

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  throw new Error("Missing PRISMIC_WRITE_TOKEN (see .env.local)");
}

const writeClient = prismic.createWriteClient(repositoryName, { writeToken });
const migration = prismic.createMigration();

const uids = uidsToAdd.length > 0 ? uidsToAdd : DEFAULT_UIDS;

const homepage = await writeClient.getSingle("homepage");
const existing = homepage.data.featured_projects ?? [];
const existingUids = new Set(
  existing.map((item: any) => item.project?.uid).filter(Boolean)
);

const newUids = uids.filter((uid) => !existingUids.has(uid));
if (newUids.length === 0) {
  console.log("Nothing to add — all requested uids are already featured.");
  process.exit(0);
}

const newProjects = await Promise.all(
  newUids.map((uid) => writeClient.getByUID("project", uid))
);

homepage.data.featured_projects = [
  ...newProjects.map((project) => ({ project })),
  ...existing,
];

migration.updateDocument(homepage);

console.log(`Adding to Recent Projects: ${newUids.join(", ")}`);
await writeClient.migrate(migration, {
  reporter: (event) => console.log(event),
});

console.log(
  "\nDone. Landed in a migration release — review and publish it in the Prismic dashboard."
);
