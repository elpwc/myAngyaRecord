import React from 'react';
import './Toggle.css';

type ToggleSwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
};

const WIDTH = 18;

const Toggle: React.FC<ToggleSwitchProps> = ({ value, onChange, disabled = false, className = '', size = 1, style = {} }) => {
  return (
    <label
      className={`toggle-switch ${disabled ? 'disabled' : ''} ${className}`}
      style={{
        ...style,
        ['--width' as any]: `${WIDTH * 2 * size}px`,
        ['--height' as any]: `${(WIDTH + 2) * size}px`,
        ['--translateX' as any]: `${(WIDTH - 2) * size}px`,
        ['--buttonWidth' as any]: `${WIDTH * size}px`,
        ['--buttonHeight' as any]: `${WIDTH * size}px`,
        ['--buttonLeft' as any]: `${1 * size}px`,
        ['--buttonTop' as any]: `${1 * size}px`,
      }}
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
