import { CustomerDashboard } from "./CustomerDashboard";
import { CustomerLogin } from "./CustomerLogin";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useCustomerSession } from "../../hooks/useCustomerSession";
import { useEffect } from "react";

export const CustomerPortalApp = () => {
  const { customer, isAuthenticated, isReady, login, logout, customerPortalData } = useCustomerSession();

  useEffect(() => {
    if (customer?.session_token) {

    };
  }, [customer?.session_token]);


  if (!isReady) {
    return <LoadingSkeleton />;
  }

  if (isAuthenticated && customer && customerPortalData) {
    return <CustomerDashboard customer={customerPortalData} onLogout={logout} />;
  }

  return <CustomerLogin onLogin={login} />;
};
