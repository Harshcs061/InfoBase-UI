import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector} from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import type React from "react";
import { Logout, SetLoginDetails } from "../redux/slices/UserSlice";
import { getUser } from "../services/UserServices";
import { useEffect } from "react";
import { TOKEN_KEY } from "../services/Payload";

type Props = {
    children?: React.ReactNode;
}

export default function ProtectedRoute({children}: Props) {
    const isLoggedIn = useSelector((state: RootState) => state.users.isLoggedIn);
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();

  useEffect(() => {
    (async () => {
      // temp routing handling will change after getting /me api
      if(window.localStorage.getItem(TOKEN_KEY) != null){
        return;
      }
      const user = await getUser();
      if(user){
        dispatch(SetLoginDetails(user));
      }else{
        dispatch(Logout());
      }
    })();
  }, [dispatch]);

  if(!isLoggedIn){
    return <Navigate to="/login" state={{from: location}} replace />;
  }
  return <>{children}</>;
}
