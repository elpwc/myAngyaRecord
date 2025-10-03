import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router';
import appconfig from './appconfig';
import { HintProvider } from './components/InfrastructureCompo/HintProvider';
import ScrollToHash from './components/InfrastructureCompo/ScrollToHash';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  //<React.StrictMode>
  <BrowserRouter basename={appconfig.root}>
    <ScrollToHash />
    <HintProvider>
      <App />
    </HintProvider>
  </BrowserRouter>
  //</React.StrictMode>
);
