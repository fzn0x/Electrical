import { FC } from "react";
import { supabase } from "../../config/supabase.config";
import googleIcon from "../../assets/image/google.png";
import "./GoogleAuth.css";
import { useNavigate } from "react-router-dom";
import useToast from "../../hook/useToast";
import { useUserContext } from "../../context/User/UserContext";
import { useLoader } from "../../context/Loader/LoaderContext";

const GoogleAuth: FC = () => {
  const navigate = useNavigate();
  const { errorToast } = useToast();
  const { dispatch } = useUserContext();
  const { setLoader } = useLoader();

  const handleAuth = async () => {
    try {
      setLoader(true);
      // Use Supabase to sign in with Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) throw error;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Check if the user already exists in your users table
      const { data: userDoc } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      // If the user does not exist, insert them into the users table
      if (!userDoc) {
        const { error: insertError } = await supabase.from("users").insert({
          id: user?.id,
          name: user?.user_metadata?.full_name,
          email: user?.email,
          phone: "",
          purchuses: [],
          favourite: [],
        });

        if (insertError) throw insertError;
      }

      setLoader(false);
      dispatch({ type: "LOG_IN", payload: user });
      navigate("/profile");
    } catch (error) {
      setLoader(false);
      errorToast("Can't log in with Google", "Please try again to log in");
    }
  };

  return (
    <button onClick={handleAuth} type="button" className="google-auth__wrapper">
      <img className="google-auth__image" src={googleIcon} alt="Google icon" />
      <span className="google-auth__text">Continue with Google</span>
    </button>
  );
};

export default GoogleAuth;
