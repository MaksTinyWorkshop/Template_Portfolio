import React, { JSX } from "react";
import { Heading } from "@once-ui-system/core";

interface HeadingLinkProps {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const HeadingLink: React.FC<HeadingLinkProps> = ({ id, level, children, style }) => {
  const variantMap = {
    1: "display-strong-xs",
    2: "heading-strong-xl",
    3: "heading-strong-l",
    4: "heading-strong-m",
    5: "heading-strong-s",
    6: "heading-strong-xs",
  } as const;

  const variant = variantMap[level];
  const asTag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Heading style={style} id={id} variant={variant} as={asTag}>
      {children}
    </Heading>
  );
};
