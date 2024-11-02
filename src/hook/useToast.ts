import { useToastContext } from "../context/Toast/ToastContext";

type IfuctionProps = (title: string, discription: string) => void;

const useToast = () => {
  const { state, dispatch } = useToastContext();

  const errorToast: IfuctionProps = (title, discription) => {
    if (!state.isShow) {
      dispatch({
        type: "ADD_TOAST",
        payload: { title, discription, type: "error" },
      });
      setTimeout(() => {
        clearToast();
      }, 3000);
    }
  };
  const successToast: IfuctionProps = (title, discription) => {
    if (!state.isShow) {
      dispatch({
        type: "ADD_TOAST",
        payload: { title, discription, type: "succses" },
      });

      setTimeout(() => {
        clearToast();
      }, 3000);
    }
  };
  const clearToast = (): void => {
    dispatch({ type: "CLEAR_TOAST" });
  };

  return { errorToast, successToast };
};

export default useToast;
