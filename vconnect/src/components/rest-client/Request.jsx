import React from 'react';
import './Request.css';

const Request = ({
  method,
  url,
  onMethodChange,
  onUrlChange,
  onSend,
  onSave,
}) => {
  return (
    <div className="request-container">
      <select
        className="method-dropdown"
        value={method}
        onChange={(e) => onMethodChange(e.target.value)}
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
      <input
        type="text"
        className="url-input"
        placeholder="Enter request URL"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
      />
    </div>
  );
};

export default Request;