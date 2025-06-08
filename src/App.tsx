import React from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router';
import ErrorPage from './pages/ErrorPage';
import Japan from './pages/Japan';
import Main from './pages/Main';
import Numazu from './pages/Numazu';
import Login from './components/userSysCompo/Login';
import EmailVerify from './components/userSysCompo/EmailVerify';
import Register from './components/userSysCompo/Register';
import ResetPassword from './components/userSysCompo/ResetPassword';
import Ranking from './pages/Ranking';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="" element={<Main />}>
          <Route index element={<Navigate to="/japan" replace />} />
          <Route path="japan" element={<Japan />}></Route>
          <Route path="numazu" element={<Numazu />}></Route>

          <Route path="ranking" element={<Ranking />}></Route>

          <Route path="login" element={<Login />}></Route>
          <Route path="emailverify" element={<EmailVerify />}></Route>
          <Route path="register" element={<Register />}></Route>
          <Route path="resetpassword" element={<ResetPassword />}></Route>

          <Route path="404" element={<ErrorPage />}></Route>
          <Route path="*" element={<ErrorPage />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
