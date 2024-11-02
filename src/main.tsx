import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import {
  UserContextProvider,
  useUserContext,
} from "./context/User/UserContext";
import { ToastContextProvider } from "./context/Toast/ToastContext";
import App from "./App";
import "./style/globalStyle.css";
import { CartContextProvider } from "./context/Cart/CartContext";
import { LoaderContextProvider } from "./context/Loader/LoaderContext";
import { supabase } from "./config/supabase.config";

const UserAuth = () => {
  const { dispatch } = useUserContext();

  useEffect(() => {
    if (!supabase) return;
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          dispatch({ type: "LOG_IN", payload: session.user });
        } else if (event === "SIGNED_OUT") {
          dispatch({ type: "LOG_OUT" });
        }
      }
    );

    // Clean up the listener on unmount
    return () => authListener?.subscription?.unsubscribe();
  }, [dispatch]);

  return <div>Loading...</div>;
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <UserContextProvider>
    <ToastContextProvider>
      <CartContextProvider>
        <LoaderContextProvider>
          <UserAuth />
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </LoaderContextProvider>
      </CartContextProvider>
    </ToastContextProvider>
  </UserContextProvider>
);
