import React, { useState } from 'react';
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
import { MapsId } from './utils/map';
import Vietnam from './pages/Vietnam';
import UserPage from './pages/UserPage';
import Footer from './components/Footer';

export const AppRoutes = () => {
  const [openMobileAsideMenu, setopenMobileAsideMenu] = useState(true);
  return (
    <Routes>
      <Route
        path=""
        element={
          <Main
            onMobileMenuClick={() => {
              setopenMobileAsideMenu(!openMobileAsideMenu);
            }}
          />
        }
      >
        <Route index element={<Navigate to="/japan" replace />} />
        <Route path="japan" element={<Japan openMobileAsideMenu={openMobileAsideMenu} />}></Route>
        <Route path="japan/:id" element={<Japan openMobileAsideMenu={openMobileAsideMenu} />}></Route>
        <Route path="numazu" element={<Numazu openMobileAsideMenu={openMobileAsideMenu} />}></Route>
        <Route path="numazu/:id" element={<Numazu openMobileAsideMenu={openMobileAsideMenu} />}></Route>
        <Route path="vietnam" element={<Vietnam openMobileAsideMenu={openMobileAsideMenu} />}></Route>
        <Route path="vietnam/:id" element={<Vietnam openMobileAsideMenu={openMobileAsideMenu} />}></Route>

        <Route path="ranking">
          <Route index element={<Navigate to="japan" replace />} />
          <Route path="japan" element={<Ranking mapId={MapsId.JapanMuni} />}></Route>
          <Route path="numazu" element={<Ranking mapId={MapsId.Numazu} />}></Route>
          <Route path="vietnam" element={<Ranking mapId={MapsId.Vietnam} />}></Route>
        </Route>

        <Route path="login" element={<Login />}></Route>
        <Route path="emailverify" element={<EmailVerify />}></Route>
        <Route path="register" element={<Register />}></Route>
        <Route path="resetpassword" element={<ResetPassword />}></Route>

        <Route
          path="user"
          element={
            <>
              <UserPage />
              <Footer />
            </>
          }
        ></Route>
        <Route
          path="user/:id"
          element={
            <>
              <UserPage />
              <Footer />
            </>
          }
        ></Route>

        <Route path="404" element={<ErrorPage />}></Route>
        <Route path="*" element={<ErrorPage />}></Route>
      </Route>
    </Routes>
  );
};
