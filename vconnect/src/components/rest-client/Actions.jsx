import React from 'react';
import { VscSend } from 'react-icons/vsc';
import { MdCancel } from 'react-icons/md';
import './Actions.css';

const Actions = ({ isSending, onSend, onCancel }) => {
  return (
    <div className="actions-container">
      <button className="send-button" onClick={onSend} disabled={isSending}>
        <VscSend />
      </button>
      {isSending && (
        <button className="cancel-button" onClick={onCancel}>
          <MdCancel />
        </button>
      )}
    </div>
  );
};

export default Actions;