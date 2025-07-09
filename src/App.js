import React, { Suspense, useEffect } from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CSpinner, useColorModes } from "@coreui/react";
import "./scss/style.scss"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./scss/examples.scss";
import 'react-datepicker/dist/react-datepicker.css'
import ForgotPassword from './views/pages/auth/ForgotPassword'
import ResetPassword from './views/pages/auth/ResetPassword'
import ChangePassword from './views/pages/auth/ChangePassword';

// Containers
const DefaultLayout = React.lazy(() => import("./layouts/DefaultLayout"));
const PaieValidations = React.lazy(() => import("./views/Paie/PaieValidations"));

// Pages
const Login = React.lazy(() => import("./views/pages/login/Login"));
const Register = React.lazy(() => import("./views/pages/register/Register"));
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));
const ProtectedRoute = React.lazy(() => import("./components/ProtectedRoute"));

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
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />   

       {/* ✅ Route protégée pour changer le mot de passe */}
       <Route path="/changer-mot-de-passe" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />


          {/* ✅ Toutes les autres routes dans le layout principal */}
          <Route path="*" element={
            <ProtectedRoute>
              <DefaultLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};
export default App;
