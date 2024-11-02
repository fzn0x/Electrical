import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { supabase } from "../../config/supabase.config";
import useForm from "../../hook/useForm";
import { useNavigate } from "react-router-dom";
import { Button, GoogleAuth, Input } from "../../components";
import { Login } from "../../components";
import loadingBar from "../../assets/svg/loadingBar.svg";
import { IProducts } from "../../types/productsType";
import { useUserContext } from "../../context/User/UserContext";
import "./SignIn.css";
import VerifyCodeInput from "../../components/VerifyCodeInput/VerifyCodeInput";
import useToast from "../../hook/useToast";
import { useLoader } from "../../context/Loader/LoaderContext";

interface IUser {
  name: string;
  email: string;
  id: string;
  phone: string;
  purchases: IProducts[];
  favourite: any[];
}

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useUserContext();
  const { errorToast, successToast } = useToast();
  const [stage, setStage] = useState<"start" | "verify" | "newUser">("start");
  const [loading, setLoading] = useState<boolean>(false);
  const [verifyCode, setVerifyCode] = useState<string>("");
  const { setLoader } = useLoader();

  const handleCodeChange = (code: string) => {
    setVerifyCode(code);
    if (code.length >= 6) {
      handleSubmitFinal(code);
    }
  };

  const getVerifyCode = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: values.phone,
      });
      if (error) throw error;
      setStage("verify");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      errorToast("Can't get code", "Try again to get a new code");
    }
  };

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmitFinal(verifyCode);
  };

  const handleSubmitFinal = async (code: string) => {
    try {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        phone: values.phone,
        token: code,
        type: "sms",
      });
      const user = session?.user;
      if (!user) throw new Error("User not found");
      if (error) throw error;

      const { data: userDoc, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userError || !userDoc) {
        const newUser: IUser = {
          name: "new user",
          email: "",
          id: user.id,
          phone: values.phone,
          purchases: [],
          favourite: [],
        };
        await supabase.from("users").insert(newUser);
        setStage("newUser");
      } else {
        navigate("/profile");
        successToast(
          "Login successfully",
          "Now you can see your information in profile tabs"
        );
      }
      dispatch({ type: "LOG_IN", payload: user });
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      errorToast("Something went wrong", "Can't login, try again");
    }
  };

  const handleChangeName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoader(true);
      const userData = await supabase.auth.getUser();
      const user = userData?.data?.user;

      if (!user) throw new Error("User not found");

      const newUser: IUser = {
        name: values.name,
        email: "",
        id: user.id,
        phone: values.phone,
        purchases: [],
        favourite: [],
      };
      await supabase.from("users").upsert(newUser);
      setLoader(false);
      navigate("/profile");
      successToast(
        "Login successfully",
        "Now you can see your information in profile tabs"
      );
    } catch (error) {
      setLoader(false);
      errorToast("Something went wrong", "Can't add user name, try again");
    }
  };

  const { values, handleChange, handleSubmit } = useForm(getVerifyCode);

  return (
    <div className="login-background">
      <Login>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sign-in"
        >
          <h2 className="sign-in__title">
            {stage === "start"
              ? "Sign up with your phone number "
              : stage === "verify"
              ? "Enter the code"
              : "Welcome, add your name"}
          </h2>
          {stage === "start" ? (
            <form onSubmit={handleSubmit} className="sign-in__form">
              <Input
                onChange={handleChange}
                type="text"
                required
                pattern="[0-9+]{8,13}"
                name="phone"
                placeholder="+12124567890"
              />
              <Button className="sign-in__button" type="submit">
                {loading ? (
                  <img width={20} src={loadingBar} alt="loading" />
                ) : (
                  "Send verification code"
                )}
              </Button>
              <h4
                style={{
                  fontWeight: 300,
                  fontSize: "1.5rem",
                  textAlign: "center",
                }}
              >
                or
              </h4>
              <GoogleAuth />
            </form>
          ) : stage === "verify" ? (
            <motion.form
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="form__code"
              onSubmit={handleLogin}
            >
              <p className="sign-in__status-sms">
                We sent SMS to your phone: {values.phone}
              </p>
              <VerifyCodeInput onCodeChange={handleCodeChange} />
              <button
                type="button"
                className="wrong-code-button"
                onClick={() => setStage("start")}
              >
                Wrong phone number?
              </button>
              <Button type="submit">
                {loading ? (
                  <img width={20} src={loadingBar} alt="loading" />
                ) : (
                  "Sign in / Sign up"
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              onSubmit={handleChangeName}
              className="form__user-name"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Input
                name="name"
                onChange={handleChange}
                required
                placeholder="Mostafa Kheibary"
              />
              <Button type="submit">Submit</Button>
            </motion.form>
          )}
        </motion.div>
      </Login>
    </div>
  );
};

export default SignIn;
