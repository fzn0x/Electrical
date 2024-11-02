import { useEffect, useState } from "react";
import { supabase } from "../config/supabase.config";
import { useUserContext } from "../context/User/UserContext";

const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const { state } = useUserContext();

  useEffect(() => {
    async function checkUser() {
      const session = await supabase.auth.getUser();

      if (session) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }

      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_, session) => {
        setIsAuth(!!session);
      });

      return () => {
        subscription?.unsubscribe();
      };
    }

    checkUser();
  }, [state.user]);

  return { loading, isAuth };
};

export default useAuth;
