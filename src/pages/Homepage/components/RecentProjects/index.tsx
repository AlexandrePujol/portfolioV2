import { Marquee } from "../../../../components/molecules/Marquee";
import { Project } from "../../../../types/custom";
import { ProjectLines } from "./components";

type RecentProjectsProps = {
  marqueeText: string;
  projects: Project[];
};

export const RecentProjects = ({ marqueeText, projects }: RecentProjectsProps) => {
  return (
    <div id="RecentProjects" className="relative pb-5 ">
      <div className="pt-10 pb-6">
        <Marquee text={marqueeText} />
      </div>
      <ProjectLines projects={projects} />
    </div>
  );
};
