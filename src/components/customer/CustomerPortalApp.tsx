import { CustomerDashboard } from "./CustomerDashboard";
import { CustomerLogin } from "./CustomerLogin";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useCustomerSession } from "../../hooks/useCustomerSession";
import { useEffect } from "react";

export const CustomerPortalApp = () => {
  const { customer, isAuthenticated, isReady, login, logout, customerPortalData } = useCustomerSession();

  if (!customer) {
     return <CustomerLogin onLogin={login} />;
  }

  if (!isReady) {
    return <LoadingSkeleton />;
  }

  if (isAuthenticated && customer && customerPortalData) {
    return <CustomerDashboard customer={customerPortalData} onLogout={logout} />;
  }

};
