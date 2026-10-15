import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as prismic from "@prismicio/client";

import { repositoryName } from "../src/prismicio";

const SCREENSHOTS_DIR = "/Users/alex/Desktop/Screenshots/compressed";

// Local screenshot folder name -> Prismic `project` document uid.
const PROJECT_UID_BY_FOLDER: Record<string, string> = {
  Meadow: "meadow_pictures",
  Rilla: "rilla",
  Vonder: "vonder",
};

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  throw new Error("Missing PRISMIC_WRITE_TOKEN (see .env.local)");
}

const writeClient = prismic.createWriteClient(repositoryName, { writeToken });
const migration = prismic.createMigration();

/** hero.webp first, then 1.webp, 2.webp..., then mobile-1.webp, mobile-2.webp... */
function orderGalleryFiles(files: string[]) {
  const hero = files.filter((f) => f === "hero.webp");

  const numbered = files
    .filter((f) => /^\d+\.webp$/.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b));

  const mobile = files
    .filter((f) => /^mobile-\d+\.webp$/.test(f))
    .sort((a, b) => {
      const an = parseInt(a.match(/\d+/)![0], 10);
      const bn = parseInt(b.match(/\d+/)![0], 10);
      return an - bn;
    });

  return [...hero, ...numbered, ...mobile];
}

for (const [folder, uid] of Object.entries(PROJECT_UID_BY_FOLDER)) {
  const dir = join(SCREENSHOTS_DIR, folder);
  const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));

  const thumbnailFile = files.find((f) => f === "thumbnail.webp");
  const galleryFiles = orderGalleryFiles(files);

  // eslint-disable-next-line no-await-in-loop
  const doc = await writeClient.getByUID("project", uid);

  if (thumbnailFile) {
    doc.data.thumbnail = migration.createAsset(
      readFileSync(join(dir, thumbnailFile)),
      `${uid}-thumbnail.webp`
    );
  }

  doc.data.gallery = galleryFiles.map((file) => ({
    photo: migration.createAsset(readFileSync(join(dir, file)), `${uid}-${file}`),
  }));

  migration.updateDocument(doc);

  console.log(
    `${folder} -> ${uid}: thumbnail=${thumbnailFile ? "yes" : "no"}, gallery=${galleryFiles.length} photo(s) [${galleryFiles.join(", ")}]`
  );
}

console.log("\nMigrating...");
await writeClient.migrate(migration, {
  reporter: (event) => console.log(event),
});

console.log(
  "\nDone. This landed in a migration release, not published yet — review and publish it in the Prismic dashboard."
);
