import { asLink, asText } from "@prismicio/client";

import { Project, ProjectData } from "../types/custom";

/** Maps a Prismic `project` document to the home card shape used by RecentProjects. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProjectCard(doc: any): Project {
  return {
    title: asText(doc.data.title) ?? "",
    subtitle: doc.data.subtitle,
    img: doc.data.thumbnail?.url ?? "",
    slug: doc.uid,
  };
}

/** Maps a Prismic `project` document to the detail shape used by the Project page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProjectData(doc: any): ProjectData {
  return {
    title: asText(doc.data.title) ?? "",
    introParagraph: asText(doc.data.intro_paragraph) ?? "",
    client: doc.data.client,
    slug: doc.uid,
    color: doc.data.color ?? undefined,
    clientUrl: asLink(doc.data.client_link) ?? undefined,
    project: doc.data.category,
    websiteName: doc.data.website_name,
    websiteUrl: asLink(doc.data.website_link) ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    photos: (doc.data.gallery ?? []).map((item: any) => item.photo?.url ?? ""),
    video: asLink(doc.data.video) ?? undefined,
    paragraphs: (doc.data.content ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => asText(item.paragraph) ?? ""
    ),
  };
}
