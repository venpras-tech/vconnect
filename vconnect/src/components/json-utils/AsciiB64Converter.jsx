import React, { useState } from 'react';
import './AsciiB64Converter.css';

const AsciiB64Converter = () => {
  const [ascii, setAscii] = useState('');
  const [base64, setBase64] = useState('');
  const [error, setError] = useState('');

  const handleAsciiChange = (e) => {
    setAscii(e.target.innerText);
    setError('');
  };

  const handleBase64Change = (e) => {
    setBase64(e.target.innerText);
    setError('');
  };

  const convertAsciiToB64 = () => {
    setError('');
    try {
      const encoded = btoa(ascii);
      setBase64(encoded);
    } catch (err) {
      setError('Invalid ASCII input for Base64 encoding.');
    }
  };

  const convertB64ToAscii = () => {
    setError('');
    try {
      const decoded = atob(base64);
      setAscii(decoded);
    } catch (err) {
      setError('Invalid Base64 input for decoding.');
    }
  };

  return (
    <div className="ascii-b64-converter">
      <h3>{'ASCII <> Base64 Converter'}</h3>
      {error && <div className="error-message">{error}</div>}
      <div className="converter-container">
        <div
          className="panel"
          contentEditable
          onInput={handleAsciiChange}
          suppressContentEditableWarning={true}
        >
          {ascii}
        </div>
        <div className="actions">
          <button onClick={convertAsciiToB64}>A2B &rarr;</button>
          <button onClick={convertB64ToAscii}>&larr; B2A</button>
        </div>
        <div
          className="panel"
          contentEditable
          onInput={handleBase64Change}
          suppressContentEditableWarning={true}
        >
          {base64}
        </div>
      </div>
    </div>
  );
};

export default AsciiB64Converter;