import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './JsonStringify.css';

const JsonStringify = () => {
  const [rawJson, setRawJson] = useState('');
  const [stringifiedJson, setStringifiedJson] = useState('');
  const [error, setError] = useState('');

  const handleStringify = () => {
    try {
      let parsedJson = JSON.parse(rawJson);
      if (typeof parsedJson === 'string') {
        parsedJson = JSON.parse(parsedJson);
      }
      setStringifiedJson(JSON.stringify(JSON.stringify(parsedJson)));
      setError('');
    } catch (error) {
      setStringifiedJson('');
      setError(error.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stringifiedJson);
  };

  return (
    <div className="json-stringify">
      <h2>JSON Stringify</h2>
      <div className="stringify-container">
        <div className="stringify-left">
          <Editor
            height="100%"
            defaultLanguage="text"
            defaultValue=""
            theme="light"
            value={rawJson}
            onChange={(value) => setRawJson(value)}
          />
        </div>
        <button onClick={handleStringify}>stringify</button>
        <div className="stringify-right">
          {error ? (
            <pre className="error">{error}</pre>
          ) : (
            <>
              <button onClick={handleCopy} className="copy-button">Copy</button>
              <pre>{stringifiedJson}</pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonStringify;