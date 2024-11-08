import { supabase } from "../../config/supabase.config";
// @ts-ignore
import { deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components";
import { db } from "../../config/firebase.config";
import { useLoader } from "../../context/Loader/LoaderContext";
import { useUserContext } from "../../context/User/UserContext";
import useToast from "../../hook/useToast";
import "./ProfileSetting.css";

const ProfileSetting: React.FC = () => {
  const { dispatch } = useUserContext();
  const { setLoader } = useLoader();

  const { errorToast, successToast } = useToast();
  const navigate = useNavigate();
  const handleLogOut = async () => {
    try {
      setLoader(true);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;
      dispatch({ type: "LOG_OUT" });
      navigate("/");
      setLoader(false);
    } catch (error) {
      setLoader(false);
      errorToast("cant sign out", "please try again ");
    }
  };
  const handleDeleteAccount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setLoader(true);
      await Promise.all([
        await supabase.from("users").delete().eq("id", user?.id),
        await supabase.auth.signOut(),
      ]);
      successToast("account succsesfuly deleted", "");
      setLoader(false);
      dispatch({ type: "LOG_OUT" });
      navigate("/");
    } catch (error) {
      setLoader(false);
      errorToast("cant delete account", "please try again");
    }
  };
  return (
    <div className="profile-setting">
      <div className="profile-setting__head">
        <h2 className="profile-setting__title">Acount setting</h2>
        <Button onClick={handleLogOut}>Log out</Button>
      </div>
      <hr className="profile-setting__line" />
      <div className="profile-setting__content">
        <h4 className="profile-setting__text">delete your account</h4>
        <p className="profile-setting__discription">
          it will clear all your orders, user log on server{" "}
        </p>
        <Button
          onClick={handleDeleteAccount}
          className="profile-setting__delete-button"
        >
          delete Acount
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetting;
