import { useRef } from "react";
import { useColorContext } from "../../../../hooks/useColorContext";

import { useAnimation } from "./useAnimation";

type ShowrealProps = {
  video: string;
};

export const Showreal = ({ video: videoSrc }: ShowrealProps) => {
  const video = useRef<HTMLVideoElement>(null);

  const { colors } = useColorContext();

  useAnimation();

  return (
    <div
      id="showreal__main-container"
      className="flex justify-center items-center will-change-transform mb-[20vh]"
    >
      <div
        id="showreal__video-container"
        className="relative w-full xl:h-[90vh] aspect-video mx-10 md:cursor-none"
        style={{
          background: colors.secondaryColor,
        }}
      >
        <video
          ref={video}
          className="pointer-events-none w-full h-full object-cover"
          src={videoSrc}
          loop
          muted
          autoPlay
          playsInline
        ></video>
      </div>
    </div>
  );
};
