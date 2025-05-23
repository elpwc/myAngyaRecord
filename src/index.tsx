import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router';
import appconfig from './appconfig';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  //<React.StrictMode>
  <BrowserRouter basename={appconfig.root}>
    <App />
  </BrowserRouter>
  //</React.StrictMode>
);
