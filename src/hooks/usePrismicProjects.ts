import { useEffect, useState } from "react";

import { client } from "../prismicio";
import { toProjectCard } from "../utils";
import { Project } from "../types/custom";

/** All projects, in publication order — used for the "next project" nav. */
export const usePrismicProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    client
      .getAllByType("project", {
        orderings: [{ field: "document.first_publication_date" }],
      })
      .then((docs) => setProjects(docs.map(toProjectCard)));
  }, []);

  return { projects, isLoading: projects.length === 0 };
};
