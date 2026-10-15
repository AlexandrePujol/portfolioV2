import { MutableRefObject, useRef } from "react";
import {
  ScrollScene,
  UseCanvas,
  useScrollRig,
} from "@14islands/r3f-scroll-rig";

import Lines from "../../../../components/three/Lines";
import { AnimLink } from "../../../../components/atoms";
import { useColorContext } from "../../../../hooks/useColorContext";

type SocialLink = { label: string; href: string };

type FooterProps = {
  email: string;
  address: string;
  phone: string;
  socialLinks: SocialLink[];
  copyrightText: string;
};

export const Footer = ({
  email,
  address,
  phone,
  socialLinks,
  copyrightText,
}: FooterProps) => {
  const { colors } = useColorContext();
  const ref = useRef<HTMLDivElement>(null);
  const { hasSmoothScrollbar } = useScrollRig();

  return (
    <div
      className="relative pt-[20vh] px-[32px] flex flex-col gap-[12px] md:gap-[56px] pb-[80px]"
      style={{ backgroundColor: colors.secondaryColor }}
    >
      <div className="flex flex-col gap-1 justify-between md:flex-row">
        <a>{email}</a>
        <p>{address}</p>
        <div className="flex justify-between">
          <p>{phone}</p>{" "}
          {socialLinks[0] && (
            <div className="block md:hidden overflow-hidden">
              <AnimLink href={socialLinks[0].href}>
                {socialLinks[0].label}
              </AnimLink>
            </div>
          )}
        </div>
        <ul className="hidden md:flex items-center md:gap-[16px] lggap-[80px]">
          {socialLinks.map((link) => (
            <AnimLink key={link.label} href={link.href}>
              {link.label}
            </AnimLink>
          ))}
        </ul>
      </div>

      <div
        ref={ref}
        className="h-[60vh] pointer-events-none flex justify-center items-center "
        style={{ opacity: hasSmoothScrollbar ? 0 : 1 }}
      >
        <img src="/assets/Photos/logo_lines-light.png" className="h-full" />
      </div>
      {hasSmoothScrollbar && (
        <UseCanvas>
          <ScrollScene track={ref as MutableRefObject<HTMLDivElement>}>
            {(props) => <Lines scrollScene={props} trackedDiv={ref} />}
          </ScrollScene>
        </UseCanvas>
      )}

      <div className="grid grid-cols-3">
        <a>Privacy Policy</a>
        <p className="text-center">{copyrightText}</p>
        <a className="text-end">Terms and Conditions</a>
      </div>
    </div>
  );
};
