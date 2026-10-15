import { useEffect, useState } from "react";

import { client } from "../prismicio";
import { toProjectData } from "../utils";
import { ProjectData } from "../types/custom";

export const usePrismicProject = (uid: string | undefined) => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!uid) return;

    setProjectData(null);
    setNotFound(false);

    client
      .getByUID("project", uid)
      .then((doc) => setProjectData(toProjectData(doc)))
      .catch(() => setNotFound(true));
  }, [uid]);

  return { projectData, isLoading: !projectData && !notFound, notFound };
};
