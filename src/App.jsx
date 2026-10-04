import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import FloatingStudyHub from "./components/FloatingStudyHub";

const AuthenticatedApp = lazy(() => import("./AuthenticatedApp"));
const Home = lazy(() => import("./pages/Home"));

function RouteLoading() {
  return (
    <div className="route-loading mono" role="status">
      Setting the type...
    </div>
  );
}

function App() {
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <Suspense fallback={<RouteLoading />}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>

      {!isHome && <FloatingStudyHub />}
    </Suspense>
  );
}

export default App;
