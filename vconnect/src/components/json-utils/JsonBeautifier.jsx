import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './JsonBeautifier.css';

const JsonBeautifier = () => {
  const [rawJson, setRawJson] = useState('');
  const [beautifiedJson, setBeautifiedJson] = useState('');
  const [error, setError] = useState('');

  const handleBeautify = () => {
    try {
      let parsedJson = JSON.parse(rawJson);
      if (typeof parsedJson === 'string') {
        parsedJson = JSON.parse(parsedJson);
      }
      setBeautifiedJson(JSON.stringify(parsedJson, null, 2));
      setError('');
    } catch (error) {
      setBeautifiedJson('');
      setError(error.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(beautifiedJson);
  };

  return (
    <div className="json-beautifier">
      <h2>JSON Beautifier</h2>
      <div className="beautifier-container">
        <div className="beautifier-left">
          <Editor
            height="100%"
            defaultLanguage="text"
            defaultValue=""
            theme="light"
            value={rawJson}
            onChange={(value) => setRawJson(value)}
          />
        </div>
        <button onClick={handleBeautify}>beautify</button>
        <div className="beautifier-right">
          {error ? (
            <pre className="error">{error}</pre>
          ) : (
            <>
              <button onClick={handleCopy} className="copy-button">Copy</button>
              <pre>{beautifiedJson}</pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonBeautifier;