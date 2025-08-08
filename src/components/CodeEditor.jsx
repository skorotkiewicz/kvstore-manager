import AceEditor from "react-ace";

// languages/themes
import "ace-builds/src-noconflict/mode-json";
// import "ace-builds/src-noconflict/mode-javascript";
// import "ace-builds/src-noconflict/mode-python";
// import "ace-builds/src-noconflict/mode-html";

import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-one_dark";
// import "ace-builds/src-noconflict/theme-monokai";

// Auto-completions, snippets etc.
// import "ace-builds/src-noconflict/ext-language_tools";

const CodeEditor = ({
  language = "javascript",
  children = "",
  onChange,
  darkMode = true,
  height = "400px",
  width = "100%",
}) => {
  return (
    <AceEditor
      mode={language}
      theme={darkMode ? "one_dark" : "github"}
      name="code-editor"
      onChange={onChange}
      fontSize={14}
      showPrintMargin={false}
      showGutter={false}
      highlightActiveLine={true}
      value={children}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
      }}
      width={width}
      height={height}
    />
  );
};

export default CodeEditor;

//   <CodeEditor language="javascript" onChange={setCode}>
//     {code}
//   </CodeEditor>
