import {
  createContext,
  useReducer,
  ReactNode,
  Reducer,
  useContext,
} from "react";
import userReducer from "./userReducer";

interface IProps {
  children: ReactNode;
}
interface IState {
  user: any;
}
const initState: IState = {
  user: null,
};
const userContext = createContext<any>({});

const UserContextProvider: React.FC<IProps> = ({ children }) => {
  const [state, dispatch] = useReducer<Reducer<any, any>>(
    userReducer,
    initState
  );

  return (
    <userContext.Provider value={{ state, dispatch }}>
      {children}
    </userContext.Provider>
  );
};

interface IContext {
  state: IState;
  dispatch: any;
}
const useUserContext = (): IContext => useContext(userContext);

export default userContext;
export { UserContextProvider, useUserContext };
