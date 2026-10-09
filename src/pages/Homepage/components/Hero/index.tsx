import gsap from "gsap";
import { useEffect, useRef } from "react";

import { AnimLetters, AnimWords } from "../../../../components/atoms";
import { useHasLoadedStore } from "../../../../store/useHasLoaded";
import { HeroThree } from "./components";

type HeroTextProps = {
  greeting: string;
  firstName: string;
  introParagraph: string;
};

const HeroText = ({ greeting, firstName, introParagraph }: HeroTextProps) => {
  const container = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const paragraph = useRef<HTMLParagraphElement>(null);

  const tl = useRef<gsap.core.Timeline>();
  const { hasLoaded } = useHasLoadedStore();

  // scroll anim
  useEffect(() => {
    if (!paragraph.current || !title.current) return;
    gsap.set(title.current, { yPercent: 0 });
    gsap.set(paragraph.current, { yPercent: 0 });

    tl.current = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    tl.current.to(
      title.current,

      {
        yPercent: -100,
      }
    );

    const paragraphWords = paragraph.current?.querySelectorAll("span");
    tl.current.fromTo(
      paragraphWords,
      {
        yPercent: 0,
      },
      {
        yPercent: -120,
        stagger: 0.01,
      },
      "<"
    );

    return () => {
      tl.current?.kill();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 justify-between items-center h-full pt-[128px] pb-[64px] md:px-0 md:justify-center">
      <h1
        ref={title}
        className="font-extrabold text-[56px] leading-[100%] text-center z-10 md:block md:text-[160px]"
      >
        <div className="hidden md:block">
          <AnimLetters string={greeting} start={hasLoaded} delay={1.2} />
          <br />
          <AnimLetters string={` ${firstName}`} start={hasLoaded} delay={1.2} />
        </div>
        <div className="block md:hidden">
          <AnimLetters
            string={`${greeting} ${firstName}`}
            start={hasLoaded}
            delay={1.2}
          />
        </div>
      </h1>

      <p
        ref={paragraph}
        className="text-center text-base font-base leading-[130%] px-6 sm:w-[360px] z-10"
      >
        <AnimWords
          string={introParagraph}
          stagger={0.01}
          delay={1.3}
          start={hasLoaded}
        />
      </p>
    </div>
  );
};

type HeroProps = HeroTextProps;

export const Hero = ({ greeting, firstName, introParagraph }: HeroProps) => {
  const container = useRef<HTMLDivElement>(null);

  return (
    <div id="Hero" ref={container} className="relative h-screen ">
      <HeroThree />
      <HeroText
        greeting={greeting}
        firstName={firstName}
        introParagraph={introParagraph}
      />
    </div>
  );
};
