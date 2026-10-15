import { useEffect, useState } from "react";

import { client } from "../prismicio";
import { toProjectCard } from "../utils";

export const usePrismicHomepage = () => {
  const [homepage, setHomepage] = useState<any>(null);

  useEffect(() => {
    client
      .getSingle("homepage", {
        fetchLinks: ["project.title", "project.subtitle", "project.thumbnail"],
      })
      .then(setHomepage);
  }, []);

  const data = homepage?.data;

  return {
    isLoading: !homepage,
    data,
    featuredProjects:
      data?.featured_projects
        ?.map((item: any) => item.project)
        .filter((project: any) => project?.data)
        .map(toProjectCard) ?? [],
  };
};
