import React from 'react';
import { useEffect } from 'react';
import './index.css';

interface P {}

export default (props: P) => {
  useEffect(() => {}, []);

  return (
    <a className="buyButton" target="_blank" href="https://buymeacoffee.com/elpwc">
      <img className="coffeeImage" src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Buy me a coffee" />
      <span className="coffeeButtonText">コーヒー買ってあげる</span>
    </a>
  );
};
