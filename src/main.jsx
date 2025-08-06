import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import App from "./App";

const Root = () => {
  const AppWithCaptcha = (
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.VITE_CAPTCHA_PUBLIC_KEY}
    >
      <App />
    </GoogleReCaptchaProvider>
  );

  const AppWithCtx =
    import.meta.env.VITE_CAPTCHA_ENABLED === "true" ? AppWithCaptcha : <App />;

  if (import.meta.env.DEV) {
    return AppWithCtx;
  }

  return <StrictMode>{AppWithCtx}</StrictMode>;
};

createRoot(document.getElementById("root")).render(<Root />);
