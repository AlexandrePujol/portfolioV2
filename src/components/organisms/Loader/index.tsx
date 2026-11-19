import { RefObject, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { useProgress } from "@react-three/drei";
import { useHasLoadedStore } from "../../../store/useHasLoaded";

export const Loader = () => {
  const container = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const intro = useRef<gsap.core.Tween>();
  const isExiting = useRef(false);
  // What the line shows: real progress plus a slow creep, in 0-100
  const displayed = useRef({ value: 0 });

  // Tracks every three.js asset (logo GLB, 3D font, project textures)
  const { progress } = useProgress();
  const { setHasLoaded } = useHasLoadedStore();

  // "LOA" and "DING" slide in from below
  useGSAP(
    () => {
      intro.current = gsap.from(".loader-half", {
        yPercent: 100,
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
      });
    },
    { scope: container }
  );

  useGSAP(
    () => {
      // Background lines fill up with progress
      const bgLines = gsap.utils.toArray<HTMLElement>(".bg-line");
      const segmentSize = 100 / bgLines.length;
      bgLines.forEach((bgLine, i) => {
        const fill = gsap.utils.clamp(
          0,
          1,
          (progress - i * segmentSize) / segmentSize
        );
        gsap.to(bgLine, { scaleY: fill, duration: 0.4, ease: "power2.out" });
      });

      // Once the word is in, the line grows between "LOA" and "DING", pushing them apart
      intro.current?.then(() => {
        if (isExiting.current) return;
        const shown = displayed.current;
        const drawLine = () => {
          gsap.set(line.current, { width: `${shown.value * 0.3}vw` });
        };
        // Never go backwards when new assets join the queue (progress can drop)
        const target = Math.max(progress, shown.value);

        // overwrite kills the previous catch-up + creep before starting new ones
        const tl = gsap.timeline();
        tl.to(shown, {
          value: target,
          duration: 0.6,
          ease: "expo.inOut",
          onUpdate: drawLine,
          overwrite: true,
        });

        if (progress < 100) {
          // Keep creeping between real updates so the line never looks stalled
          tl.to(shown, {
            value: Math.max(target, 95),
            duration: 20,
            ease: "power2.out",
            onUpdate: drawLine,
          });
          return;
        }
        isExiting.current = true;

        // Then close the line, hide the word and lift the loader
        gsap
          .timeline({
            delay: 0.6,
            defaults: { duration: 1, ease: "power4.inOut" },
            onStart: () => setHasLoaded(true),
          })
          .to(line.current, { scaleX: 0, duration: 0.6 })
          .to(".loader-half", { yPercent: (i) => (i === 0 ? -100 : 100) }, "<")
          .to(container.current, { yPercent: -100 }, "-=0.4");
      });
    },
    { scope: container, dependencies: [progress] }
  );

  return (
    <div
      ref={container as RefObject<HTMLDivElement>}
      className="fixed -top-[10vh] -left-[10vw] w-[120vw] h-[120vh] bg-secondary-200 z-50 flex justify-center items-center"
    >
      <div className="relative z-10 flex items-center font-extrabold leading-[100%] text-[13vw] md:text-[5vw]">
        <div className="overflow-hidden">
          <p className="loader-half">LOA</p>
        </div>
        <div
          ref={line as RefObject<HTMLDivElement>}
          className="h-[2px] w-0 bg-dark origin-center"
        />
        <div className="overflow-hidden">
          <p className="loader-half">DING</p>
        </div>
      </div>
      <div className="fixed inset-0 grid grid-cols-8 gap-5 mx-5">
        {new Array(8).fill(0).map((_, i) => (
          <div key={i}>
            <div className="bg-line h-full w-[0.5px] bg-secondary-700 origin-top scale-y-0" />
            {i === 8 - 1 && (
              <div className="bg-line absolute right-0 top-0 h-full w-[0.5px] bg-secondary-700 origin-top scale-y-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
