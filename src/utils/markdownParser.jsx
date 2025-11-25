import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

export function renderMarkdown(mdText) {
  return (
    <ReactMarkdown
      // ⬅️ This preserves blank lines EXACTLY as the model outputs them
      remarkPlugins={[remarkGfm, remarkMath]}

      // ⬅️ Needed to prevent spacing collapse inside formulas
      rehypePlugins={[rehypeRaw, rehypeKatex]}

      // ⬅️ Absolutely required to keep formulas separated visually
      components={{
        p: ({ children }) => (
          <p style={{ marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
            {children}
          </p>
        ),
        div: ({ children }) => (
          <div style={{ marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
            {children}
          </div>
        ),
      }}
    >
      {mdText}
    </ReactMarkdown>
  );
}
