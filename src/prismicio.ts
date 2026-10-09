import * as prismic from "@prismicio/client";

export const repositoryName = "alex-portfolio-v2";

// See https://prismic.io/docs/routes.md
export const routes: prismic.ClientConfig["routes"] = [
  { type: "homepage", path: "/" },
  { type: "project", path: "/projects/:uid" },
];

export function createClient(config: prismic.ClientConfig = {}) {
  return prismic.createClient(repositoryName, {
    routes,
    ...config,
  });
}
