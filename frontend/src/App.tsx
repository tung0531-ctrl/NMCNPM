import {BrowserRouter, Route, Routes} from 'react-router'
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ChatAppPage from './pages/ChatAppPage';
import BillManagementPage from './pages/BillManagementPage';
import FeeTypeManagementPage from './pages/FeeTypeManagementPage';
import HouseholdManagementPage from './pages/HouseholdManagementPage';
import ResidentManagementPage from './pages/ResidentManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import LogViewerPage from './pages/LogViewerPage';
import StatisticsPage from './pages/StatisticsPage';
import ProfilePage from './pages/ProfilePage';
import {Toaster} from 'sonner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import GuestRoute from './components/auth/GuestRoute';

function App() {
  return <>
  <Toaster/>
<BrowserRouter>
<Routes>
  {/* public routes*/}
    <Route
      path = '/signin'
      element = {
        <GuestRoute>
          <SignInPage/>
        </GuestRoute>
      }
      />
       <Route
      path = '/signup'
      element = {
        <GuestRoute>
          <SignUpPage/>
        </GuestRoute>
      }
      />
  {/* protect routes*/}
  {/* todo: tạo protected route */}
    <Route element = {<ProtectedRoute />}>
    <Route
      path = '/'
      element = {<ChatAppPage/>}
      />
    <Route
      path = '/bills'
      element = {
        <AdminRoute>
          <BillManagementPage/>
        </AdminRoute>
      }
      />
    <Route
      path = '/fee-types'
      element = {
        <AdminRoute>
          <FeeTypeManagementPage/>
        </AdminRoute>
      }
      />
    <Route
      path = '/households'
      element = {
        <AdminRoute>
          <HouseholdManagementPage/>
        </AdminRoute>
      }
      />
    <Route
      path = '/residents'
      element = {
        <AdminRoute>
          <ResidentManagementPage/>
        </AdminRoute>
      }
      />
    <Route
      path = '/users'
      element = {
        <AdminRoute>
          <UserManagementPage/>
        </AdminRoute>
      }
      />
    <Route
      path = '/logs'
      element = {
        <AdminRoute>
          <LogViewerPage/>
        </AdminRoute>
      }
      />
    <Route
      path = '/statistics'
      element = {
        <AdminRoute>
          <StatisticsPage/>
        </AdminRoute>
      }
      />
    <Route
      path = '/profile'
      element = {<ProfilePage/>}
      />
    </Route>
  </Routes>
</BrowserRouter>
  </>
  
};

export default App
