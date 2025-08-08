import { useLayoutEffect, useCallback, useState } from "react";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { codeToHast } from "shiki/bundle/web";

async function highlight(code, lang) {
  const out = await codeToHast(code, {
    lang,
    theme: "github-dark",
  });

  return toJsxRuntime(out, {
    Fragment,
    jsx,
    jsxs,
  });
}

export function CodeBlock({ children, id, language = "javascript", initial }) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [nodes, setNodes] = useState(initial);

  const copyToClipboard = useCallback(async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  useLayoutEffect(() => {
    void highlight(children, language).then(setNodes);
  }, []);

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-language">{language}</span>
        <button
          type="button"
          className={`copy-btn ${copiedCode === id ? "copied" : ""}`}
          onClick={() => copyToClipboard(children, id)}
          title="Copy to clipboard"
        >
          {copiedCode === id ? "✅ Copied!" : "📋 Copy"}
        </button>
      </div>
      <pre>
        <code>{nodes ?? <p>Loading...</p>}</code>
      </pre>
    </div>
  );
}

// export default async function Page() {
//   // `initial` is optional.
//   return (
//     <main>
//       <CodeBlock initial={await highlight('console.log("Rendered on server")', 'ts')} />
//     </main>
//   )
// }
