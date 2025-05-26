import './index.css';

type Props = {
  options: string[];
  value: string;
  onChange: (val: string) => void;
};

const Dropdown = ({ options, value, onChange }: Props) => {
  return (
    <div className="dropdown-container">
      <select className="dropdown-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(option => (
          <option key={option} value={option} className="dropdown-option">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
