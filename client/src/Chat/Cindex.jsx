import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import ChatApp from "./Capp";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ChatApp />
  </StrictMode>
);
