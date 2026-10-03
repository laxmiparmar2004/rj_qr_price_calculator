import { CustomerDashboard } from "./CustomerDashboard";
import { CustomerLogin } from "./CustomerLogin";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useCustomerSession } from "../../hooks/useCustomerSession";

export const CustomerPortalApp = () => {
  const { customer, isAuthenticated, isReady, login, logout } = useCustomerSession();

  if (!isReady) {
    return <LoadingSkeleton />;
  }

  if (isAuthenticated && customer) {
    return <CustomerDashboard customer={customer} onLogout={logout} />;
  }

  return <CustomerLogin onLogin={login} />;
};
