import React, { useState, useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, onSubmit, title, inputLabel, initialValue = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    onSubmit(inputValue);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <label>
          {inputLabel}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
        </label>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
