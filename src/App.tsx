import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import ListRequest from './components/screens/ListRequest';
import LoginScreen from './components/screens/LoginScreen';
import DashboardLayout from './components/layout/DashboardLayout';
import Cookies from 'js-cookie';

const isAuthenticated = (): boolean => {
  return (
    Cookies.get('authToken') !== null && Cookies.get('authToken') !== undefined
  );
};

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  return isAuthenticated() ? element : <Navigate to='/login' replace />;
};

const PublicRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  return isAuthenticated() ? <Navigate to='/' replace /> : element;
};

const DashboardRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  return <DashboardLayout>{element}</DashboardLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path='/login'
          element={<PublicRoute element={<LoginScreen />} />}
        />
        <Route
          path='/'
          element={
            <PrivateRoute
              element={<DashboardRoute element={<ListRequest />} />}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
