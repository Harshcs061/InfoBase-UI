import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import QuestionsPage from '../pages/QuestionsPage';
import ViewQuestionPage from '../pages/ViewQuestionPage';
import AskQuestionPage from '../pages/AskQuestionPage';
import LoginPage from '../pages/LoginPage';
//import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/question", element: <AskQuestionPage /> },
      {path: "/questions/:id", element: <ViewQuestionPage />},
      
    ],
  },
]);

export default router;