import { asLink, asText } from "@prismicio/client";
import { useEffect } from "react";
import { ScrollIndicator } from "../../components/molecules";

import {
  AboutMe,
  Contact,
  Footer,
  Hero,
  RecentProjects,
  Showreal,
  StickyText,
} from "./components";
import { Loader } from "../../components/organisms";
import { usePrismicHomepage } from "../../hooks/usePrismicHomepage";

export default function Homepage() {
  const { data, featuredProjects, isLoading } = usePrismicHomepage();

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleScroll = (e) => {
    console.log(e.target.scrollTop);
  };

  if (isLoading) return null;

  return (
    <div id="Homepage" className="overflow-clip" onScroll={handleScroll}>
      <Loader />
      <Hero
        greeting={data.greeting}
        firstName={data.first_name}
        introParagraph={asText(data.intro_paragraph) ?? ""}
      />
      <Showreal video={asLink(data.video) ?? ""} />
      <AboutMe
        marqueeText={data.marquee_text}
        portrait={data.portrait?.url}
        description={data.description ?? []}
        stackTitle={data.stack_title}
        techStack={data.tech_stack?.map((item) => item.name) ?? []}
      />
      <StickyText phrase={asText(data.phrase) ?? ""} />
      <RecentProjects
        marqueeText={data.recent_projects_marquee_text}
        projects={featuredProjects}
      />
      <Contact
        heading={data.heading}
        paragraph={asText(data.paragraph) ?? ""}
        image={data.image?.url}
      />
      <Footer
        email={data.email}
        address={data.address}
        phone={data.phone}
        socialLinks={
          data.social_links?.map((link) => ({
            label: link.label,
            href: asLink(link.url) ?? "",
          })) ?? []
        }
        copyrightText={data.copyright_text}
      />
      <ScrollIndicator />
    </div>
  );
}
