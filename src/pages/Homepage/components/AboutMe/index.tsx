import { useGSAP } from "@gsap/react";
import { Marquee } from "../../../../components/molecules/Marquee";
import { useRef, useState } from "react";
import gsap, { Expo, Power3 } from "gsap";
import { AnimLetters } from "../../../../components/atoms";
import { useColorContext } from "../../../../hooks/useColorContext";

type RichTextSpan = { type: string; start: number; end: number };
type RichTextBlock = { text: string; spans?: RichTextSpan[] };

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold">{children}</span>
);

// Matches the paragraph-specific styling the copy used to be hardcoded with.
const DESCRIPTION_CLASSNAMES = ["text-justify text-sm mb-4 md:text-base", "md:text-[14px]"];

const renderWithBoldSpans = (block: RichTextBlock) => {
  const spans = (block.spans ?? [])
    .filter((span) => span.type === "strong")
    .sort((a, b) => a.start - b.start);

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  spans.forEach((span, idx) => {
    if (span.start > cursor) nodes.push(block.text.slice(cursor, span.start));
    nodes.push(
      <Highlight key={idx}>{block.text.slice(span.start, span.end)}</Highlight>
    );
    cursor = span.end;
  });
  if (cursor < block.text.length) nodes.push(block.text.slice(cursor));

  return nodes;
};

const TechPill = ({
  text,
  secondaryColor,
}: {
  text: string;
  secondaryColor: string;
}) => (
  <div
    className="px-2 py-1 rounded-lg border border-[] text-sm"
    style={{ border: `1px solid ${secondaryColor}` }}
  >
    {text}
  </div>
);

type AboutMeProps = {
  marqueeText: string;
  portrait: string;
  description: RichTextBlock[];
  stackTitle: string;
  techStack: string[];
};

export const AboutMe = ({
  marqueeText,
  portrait,
  description,
  stackTitle,
  techStack,
}: AboutMeProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { colors } = useColorContext();
  const [isStackAnimated, setIsStackAnimated] = useState(false);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: Power3.easeOut, duration: 0.7 },
        scrollTrigger: {
          trigger: ref.current,
          start: "top 60%",
        },
      });

      const paragraphs = gsap.utils.toArray("#About_Description p");
      const stackPills = gsap.utils.toArray("#About_Stack-pills div");

      gsap.set("#About_Picture-wrapper", { clipPath: "inset(0 0 100% 0)" }); // Hide by clipping from bottom
      gsap.set(paragraphs, { opacity: 0 });
      gsap.set(stackPills, { opacity: 0, y: 54 });

      tl.to("#About_Picture-wrapper", {
        clipPath: "inset(0 0 0% 0)",
        duration: 0.8,
        ease: Expo.easeInOut,
      });
      tl.to(paragraphs, { opacity: 1, stagger: 0.1 }, "<0.1");
      tl.add(() => {
        setIsStackAnimated(true);
      }, "<");
      tl.to(stackPills, { opacity: 1, y: 0, stagger: 0.02 }, "<0.1");
    },
    { scope: ref }
  );

  return (
    <div id="About" className="relative pb-5 px-5">
      <div className="pt-10 pb-6 md:pb-14 ">
        <Marquee text={marqueeText} direction={1} />
      </div>
      <div
        ref={ref}
        className="grid md:grid-cols-3 gap-5 md:gap-10 md:max-w-[820px] md:m-auto"
      >
        <div
          id="About_Picture-wrapper"
          className="relative order-1 md:-order-none overflow-hidden"
        >
          <img
            className="h-40 w-full md:h-full object-cover"
            alt="portrait of Alex, the developer we're talking about here"
            src={portrait}
          />
        </div>

        <div id="About_Description" className="md:col-span-2">
          {description.map((block, idx) => (
            <p key={idx} className={DESCRIPTION_CLASSNAMES[idx] ?? ""}>
              {renderWithBoldSpans(block)}
            </p>
          ))}
          <h3 id="About_Stack-title" className="mt-10 mb-2 font-bold text-4xl">
            <AnimLetters
              string={stackTitle}
              start={isStackAnimated}
              stagger={0.01}
              delay={0}
            />
          </h3>
          <div
            id="About_Stack-pills"
            className="flex flex-wrap gap-y-2 gap-x-4"
          >
            {techStack.map((tech, idx) => (
              <TechPill
                key={idx}
                text={tech}
                secondaryColor={colors.secondaryColor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
