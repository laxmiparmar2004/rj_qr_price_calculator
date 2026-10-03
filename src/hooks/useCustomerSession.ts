import { useCallback, useEffect, useState } from "react";

import type { CustomerSession } from "../types/customerPortal";

const CUSTOMER_SESSION_STORAGE_KEY = "customer_scheme_session_v1";

export const useCustomerSession = () => {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const rawSession = localStorage.getItem(CUSTOMER_SESSION_STORAGE_KEY);
      if (!rawSession) {
        setCustomer(null);
        return;
      }

      const parsedSession = JSON.parse(rawSession) as Partial<CustomerSession>;
      const hasValidPortalData =
        parsedSession?.portalData &&
        typeof parsedSession.portalData.customer_name === "string" &&
        Array.isArray(parsedSession.portalData.schemes);

      if (
        parsedSession &&
        typeof parsedSession.phone === "string" &&
        hasValidPortalData
      ) {
        setCustomer(parsedSession as CustomerSession);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = useCallback((nextCustomer: CustomerSession) => {
    setCustomer(nextCustomer);
    localStorage.setItem(
      CUSTOMER_SESSION_STORAGE_KEY,
      JSON.stringify(nextCustomer)
    );
  }, []);

  const logout = useCallback(() => {
    setCustomer(null);
    localStorage.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
  }, []);

  return {
    customer,
    isAuthenticated: Boolean(customer),
    isReady,
    login,
    logout,
  };
};
