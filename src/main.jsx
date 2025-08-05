import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const Root = () => {
  const AppWithCtx = <App />;

  if (import.meta.env.DEV) {
    return AppWithCtx;
  }

  return <StrictMode>{AppWithCtx}</StrictMode>;
};

createRoot(document.getElementById("root")).render(<Root />);
