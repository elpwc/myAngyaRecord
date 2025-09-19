import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import { recordStatus } from '../../utils/map';
import { getCurrentFillColorByLevel, getCurrentForeColorByLevel } from '../../utils/serverUtils';

interface Props {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export default function ({ value, disabled = false, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(recordStatus[5 - value] || recordStatus[0]);

  useEffect(() => {
    setSelected(recordStatus[5 - value]);
  }, [value]);

  const toggle = () => {
    if (!disabled) setOpen(!open);
  };

  const handleSelect = (item: (typeof recordStatus)[0]) => {
    setSelected(item);
    setOpen(false);
    onChange(item.value);
  };

  return (
    <div className="RecordStatusDropdown-motion-select" tabIndex={0} onBlur={() => setOpen(false)}>
      <button onClick={toggle} className="RecordStatusDropdown-select-btn" style={{ backgroundColor: getCurrentFillColorByLevel(value), color: getCurrentForeColorByLevel(value) }}>
        {selected.name}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul className="RecordStatusDropdown-select-options" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            {recordStatus.map((item, index) => (
              <motion.li
                key={item.value}
                style={{ backgroundColor: getCurrentFillColorByLevel(5 - index), color: getCurrentForeColorByLevel(5 - index) }}
                className="RecordStatusDropdown-select-option"
                onClick={() => handleSelect(item)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.name}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
