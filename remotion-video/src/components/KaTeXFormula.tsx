import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface KaTeXFormulaProps {
  math: string;
  block?: boolean;
  fontSize?: number;
  color?: string;
  style?: React.CSSProperties;
}

export const KaTeXFormula: React.FC<KaTeXFormulaProps> = ({
  math,
  block = false,
  fontSize = 32,
  color = "#1E293B",
  style,
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      return math;
    }
  }, [math, block]);

  return (
    <span
      style={{
        fontSize: `${fontSize}px`,
        color,
        display: block ? "block" : "inline-block",
        lineHeight: 1.2,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
