import React from 'react';
import './Toggle.css';

type ToggleSwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const Toggle: React.FC<ToggleSwitchProps> = ({ value, onChange, disabled = false, className = '', style = {} }) => {
  return (
    <label
      className={`toggle-switch ${disabled ? 'disabled' : ''} ${className}`}
      style={style}
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <input
        type="checkbox"
        checked={value}
        onClick={e => {
          e.stopPropagation();
        }}
        onChange={e => {
          if (!disabled) {
            onChange(!value);
          }
        }}
        disabled={disabled}
      />
      <span className="slider" />
    </label>
  );
};

export default Toggle;
