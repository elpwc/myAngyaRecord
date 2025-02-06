import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router';
import ErrorPage from './pages/ErrorPage';
import Japan from './pages/Japan';
import Main from './pages/Main';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="" element={<Main />}>
          <Route index element={<Japan />}></Route>

          <Route path="404" element={<ErrorPage />}></Route>
          <Route path="*" element={<ErrorPage />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
