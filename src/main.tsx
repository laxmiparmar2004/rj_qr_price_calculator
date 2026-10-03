import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  BrowserRouter,
  useSearchParams,
} from "react-router-dom";
import { CustomerPortalApp } from "./components/customer/CustomerPortalApp";
import { PriceCalculatorPage } from "./PriceCalculatorPage.tsx";
import { registerServiceWorker } from "./utils/serviceWorkerUtils";
import { WifiOff } from "lucide-react";

registerServiceWorker();

const ShowOfflineAlert = () => {
  return (
    <div className="flex items-center gap-2 fixed bottom-0 text-center bg-yellow-200 w-fit mx-auto">
          <WifiOff /> You are offline! Please connect to internet.
     </div>
  )
}

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchParams] = useSearchParams();

  
  const d = searchParams.get("d");
  const i = searchParams.get("i");


  useEffect(()=>{
    const setOnline=(online : boolean)=>{
      setIsOnline(online);
    }

    window.addEventListener('online',()=>{
      setOnline(true);
    })

    window.addEventListener('offline',() => {
      setOnline(false);
    })

    return () => {
      
       window.removeEventListener('online',()=>{
      setOnline(true);
    })

    window.removeEventListener('offline',() => {
      setOnline(false);
    })
    }

  },[]);

  // QR / scanned URL
  if (d || i) {
    return (<div>
      
         {!isOnline && 
        <ShowOfflineAlert />}
        
      <PriceCalculatorPage />
    </div>)
  }

  // Customer portal fallback when there are no QR scan parameters.
  return (<div>
  {!isOnline && 
        <ShowOfflineAlert />}
        <CustomerPortalApp /></div>)
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);