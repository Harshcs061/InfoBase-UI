import { useDispatch, useSelector } from "react-redux"
import MainLayout from "./layouts/MainLayout"
import type { AppDispatch, RootState } from "./redux/store"
import { useEffect } from "react";
import { getUser } from "./services/UserServices";
import { Logout, SetLoginDetails } from "./redux/slices/UserSlice";
import LoginPage from "./pages/LoginPage";

const App = () => {
  const isLoggedIn = useSelector((state: RootState) => state.users.isLoggedIn);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if(user){
        dispatch(SetLoginDetails(user));
      }else{
        dispatch(Logout());
      }
    })();
  }, [dispatch]);


  return (
    <div>
      {isLoggedIn ?
        <MainLayout/>
        :
        <LoginPage />
      }
    </div>
  )
}

export default App