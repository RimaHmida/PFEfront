import React, { Suspense, useEffect } from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CSpinner, useColorModes } from "@coreui/react";
import "./scss/style.scss"; // Import main styles
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./scss/examples.scss"; // Example styles
import 'react-datepicker/dist/react-datepicker.css'
// Containers
const DefaultLayout = React.lazy(() => import("./layouts/DefaultLayout"));

// Pages
const Login = React.lazy(() => import("./views/pages/login/Login"));
const Register = React.lazy(() => import("./views/pages/register/Register"));
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));
const AdminDashboard = React.lazy(() => import("./views/Admin/AdminDashboard"));
const ProtectedRoute = React.lazy(() => import("./components/ProtectedRoute")); // ✅ Import ProtectedRoute

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes("coreui-free-react-admin-template-theme");
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme")?.match(/^[A-Za-z0-9\s]+/)[0];

    if (theme) {
      setColorMode(theme);
    }

    if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
  }, []);

  return (
    <HashRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Suspense fallback={<CSpinner color="primary" variant="grow" />}>
        <Routes>
          {/* ✅ Redirect Root URL to Login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* ✅ Login and Registration */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />

          {/* ✅ Admin Route is Now Protected */}

          {/* ✅ Default Layout is also restricted */}
          <Route path="*" element={<ProtectedRoute><DefaultLayout /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
