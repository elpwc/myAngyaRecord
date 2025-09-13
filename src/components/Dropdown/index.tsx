import './index.css';
import { motion } from 'framer-motion';

type Props = {
  options: string[];
  value: string;
  onChange: (val: string) => void;
};

const Dropdown = ({ options, value, onChange }: Props) => {
  return (
    <motion.div className="dropdown-container" initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
      <select className="dropdown-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(option => (
          <option key={option} value={option} className="dropdown-option">
            {option}
          </option>
        ))}
      </select>
    </motion.div>
  );
};

export default Dropdown;
