import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import {
  BrowserRouter,
  useSearchParams,
} from "react-router-dom";

import { PriceCalculatorPage } from "./PriceCalculatorPage.tsx";
import { registerServiceWorker } from "./utils/serviceWorkerUtils";

registerServiceWorker();

const App = () => {
  const [searchParams] = useSearchParams();

  const d = searchParams.get("d");
  const i = searchParams.get("i");

  // QR / scanned URL
  if (d || i) {
    return <PriceCalculatorPage />;
  }

  // Normal website
  return (
    <div className="min-h-screen flex items-center justify-center">
      Hello world!
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);