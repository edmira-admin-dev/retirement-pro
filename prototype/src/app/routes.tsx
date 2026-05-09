import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import InvestmentAdvise from "./pages/InvestmentAdvise";
import FinancialPlanning from "./pages/FinancialPlanning";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "dashboard", Component: Dashboard },
      { path: "investment-advise", Component: InvestmentAdvise },
      { path: "financial-planning", Component: FinancialPlanning },
      { path: "*", Component: NotFound },
    ],
  },
]);
