// đang làm giống hệt theo ứng dụng ChatApp nên có một số đoạn không cần thiết phải xóa đi, thêm sửa

import {BrowserRouter, Route, Routes} from 'react-router'
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ChatAppPage from './pages/ChatAppPage';
import {Toaster} from 'sonner';

function App() {
  return <>
  <Toaster/>
<BrowserRouter>
<Routes>
  {/* public routes*/}
    <Route
      path = '/signin'
      element = {<SignInPage/>}
      />
  {/* protect routes*/}
  {/* todo: tạo protected route */}
    <Route
      path = '/signup'
      element = {<SignUpPage/>}
      />
    <Route
      path = '/'
      element = {<ChatAppPage/>}
      />
</Routes>
</BrowserRouter>
  </>
};

export default App
