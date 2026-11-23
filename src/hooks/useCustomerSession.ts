import { useCallback, useEffect, useState } from "react";

import type { CustomerPortalResponse, CustomerSession } from "../types/customerPortal";
import { loadCustomerPortal } from "../services/customerPortalService";

const CUSTOMER_SESSION_STORAGE_KEY = "customer_scheme_session_v1";

export const useCustomerSession = () => {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [customerPortalData, setCustomerPortalData] = useState<CustomerPortalResponse | null | undefined>(null);
  
  useEffect(() => {
    try {
      const rawSession = localStorage.getItem(CUSTOMER_SESSION_STORAGE_KEY);
      if (!rawSession) {
        setCustomer(null);
        return;
      }

      const parsedSession = JSON.parse(rawSession) as Partial<CustomerSession>;
      // const hasValidPortalData =
      //   parsedSession?.portalData &&
      //   typeof parsedSession.portalData.customer_name === "string" &&
      //   Array.isArray(parsedSession.portalData.schemes);


      if (
        parsedSession &&
        typeof parsedSession.phone === "string" &&
        typeof parsedSession.session_token === "string"
      ) {
        setCustomer(parsedSession as CustomerSession);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      
    }
  }, []);

  useEffect(() => {
    if (customer?.session_token) {
      const loadPortalData = async () => {
        const portalData = await loadCustomerPortal(customer.session_token);
        if (!portalData) {
          logout(); // Clear session if portal data cannot be loaded
        }
        setCustomerPortalData(portalData);
        setIsReady(true);
      };

      loadPortalData();
    }
  },[customer?.session_token]);

  const login = useCallback((nextCustomer: CustomerSession) => {
    setCustomer(nextCustomer);
    localStorage.setItem(
      CUSTOMER_SESSION_STORAGE_KEY,
      JSON.stringify(nextCustomer)
    );
  }, []);

  const logout = useCallback(() => {
    // logoutCustomerPortal(customer?.session_token ?? "");
    setCustomer(null);
    localStorage.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
  }, []);

  return {
    customer,
    isAuthenticated: Boolean(customer),
    isReady,
    login,
    logout,
    customerPortalData,
  };
};
