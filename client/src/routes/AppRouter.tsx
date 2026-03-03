import { useState } from "react";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";

type Page = "login" | "register" | "dashboard";

const AppRouter = () => {
  const [page, setPage] = useState<Page>("login");
  const [loggedInUser, setLoggedInUser] = useState("");

  if (page === "register") {
    return (
      <RegisterPage
        onRegisterSuccess={() => setPage("login")}
        onGoToLogin={() => setPage("login")}
      />
    );
  }

  if (page === "dashboard") {
    return (
      <DashboardPage
        username={loggedInUser}
        onLogout={() => {
          setLoggedInUser("");
          setPage("login");
        }}
      />
    );
  }

  return (
    <LoginPage
      onLoginSuccess={(username) => {
        setLoggedInUser(username);
        setPage("dashboard");
      }}
      onGoToRegister={() => setPage("register")}
    />
  );
};

export default AppRouter;
