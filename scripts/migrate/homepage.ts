import { assetSource, filenameFor, paragraph, richText, webLink } from "./utils";

const SHOWREAL_VIDEO =
  "https://utfs.io/f/x0tNbNvWf7L6O4xYQ1QjgW5nQ7itrKZ30okTFqxlmyURfMBb";

const PORTRAIT =
  "https://viz1risw7o.ufs.sh/f/x0tNbNvWf7L6gxPAZgX7uwKTALhUXFxjOEWvyHartPDzflVN";

const CONTACT_IMAGE = "/assets/Photos/s-eychenne-les-routes-de-mon-enfance.jpeg";

// Ported from the hardcoded copy in src/pages/Homepage/components/**
const TECH_STACK = [
  "TypeScript",
  "React.js",
  "Next.js",
  "Tailwind CSS",
  "Framer Motion",
  "GSAP",
  "Prisma",
  "tRPC",
  "GraphQL",
  "Zod",
  "Three.js",
  "React-Three-Fiber",
  "Figma",
  "GitHub",
  "GitLab",
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    url: "https://www.instagram.com/serotoninene/?hl=fr",
  },
  {
    label: "Malt",
    url: "https://www.malt.fr/profile/alexandrepujol?q=alexandre+pujol&sourceComponent=home_unlogged&searchid=65aea466d6258e0da5f71775",
  },
];

/**
 * Updates the singleton `homepage` document with the content currently
 * hardcoded across the Homepage section components. `projectDocs` should be
 * the refs returned by `buildProjectDocuments`, in the order they should
 * appear in the "Recent Projects" section.
 */
export function buildHomepageDocument(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  migration: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingHomepage: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  featuredProjects: any[]
) {
  existingHomepage.data = {
    // Hero
    greeting: "HI, I'M",
    first_name: "ALEX",
    last_name: "PUJOL",
    intro_paragraph: paragraph(
      "I'm a passionate creative developer dedicated to turning ideas into immersive digital experiences. From elegant websites to interactive applications."
    ),

    // Showreal
    video: {
      link_type: "Media" as const,
      id: migration.createAsset(
        assetSource(SHOWREAL_VIDEO),
        filenameFor(SHOWREAL_VIDEO, "showreel", "mp4")
      ),
    },

    // About Me
    marquee_text: "ABOUT ME",
    portrait: migration.createAsset(
      assetSource(PORTRAIT),
      filenameFor(PORTRAIT, "portrait", "jpg")
    ),
    description: richText([
      {
        text: "In a previous life, I worked in the music industry, navigating the worlds of marketing and sales. From that time, I’ve carried over a deep sense of curiosity, a constant drive to improve, and a genuine love for collaboration.",
        bold: ["curiosity", "improve", "collaboration"],
      },
      {
        text: "Today, I’m a developer based in Paris, passionate about creating interfaces that spark — with subtle details, bold animations, and a strong focus on performance. I believe animations are only as good as the design they enhance, and I’m always looking to push the experience further. My favorite playgrounds are GSAP and shaders. I’ve explored them through various interactive experiments, and I’ve even started sharing what I’ve learned through articles and tutorials (soon to be published here).",
        bold: ["creating interfaces that spark", "performance", "GSAP and shaders"],
      },
      {
        text: "I work with all kinds of clients — from startups to digital agencies — and whether I’m in their office or working remotely, I always bring the same energy and attention to detail.",
      },
      {
        text: "Outside of development, you’ll probably find me reading literature, swimming laps, or watching contemporary theatre. I also play chess — badly (730 ELO and proudly stuck there) — but I keep coming back for more.",
      },
    ]),
    stack_title: "Techs I love to use",
    tech_stack: TECH_STACK.map((name) => ({ name })),

    // Sticky Text
    phrase: paragraph(
      "From Paris, France. Creative developer driven by a love for crafting digital magic. With a passion for innovative solutions, I transform ideas into captivating online experiences."
    ),

    // Recent Projects
    recent_projects_marquee_text: "RECENT PROJECT",
    featured_projects: featuredProjects.map((project) => ({ project })),

    // Contact
    heading: "Let's work together !",
    paragraph: paragraph(
      "Drop me a message, and let's turn your ideas into reality. Excited to collaborate on your next creative project!"
    ),
    image: migration.createAsset(
      assetSource(CONTACT_IMAGE),
      filenameFor(CONTACT_IMAGE, "contact", "jpeg")
    ),

    // Footer
    email: "pujol.alexandre@hotmail.fr",
    address: "51 T Rue Piat, 75020, PARIS",
    phone: "(+ 33) 6 03 53 11 63",
    social_links: SOCIAL_LINKS.map((link) => ({
      label: link.label,
      url: webLink(link.url),
    })),
    copyright_text: "@Alexandre Pujol, 2024",
  };

  return migration.updateDocument(existingHomepage);
}
