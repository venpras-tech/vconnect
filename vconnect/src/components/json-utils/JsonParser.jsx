import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './JsonParser.css';

const JsonParser = () => {
  const [rawJson, setRawJson] = useState('');
  const [parsedJson, setParsedJson] = useState('');
  const [error, setError] = useState('');

  const handleParse = () => {
    try {
      let parsed = JSON.parse(rawJson);
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      setParsedJson(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (error) {
      setParsedJson('');
      setError(error.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(parsedJson);
  };

  return (
    <div className="json-parser">
      <h2>JSON Parser</h2>
      <div className="parser-container">
        <div className="parser-left">
          <Editor
            height="100%"
            defaultLanguage="text"
            defaultValue=""
            theme="light"
            value={rawJson}
            onChange={(value) => setRawJson(value)}
          />
        </div>
        <button onClick={handleParse}>Parse</button>
        <div className="parser-right">
          {error ? (
            <pre className="error">{error}</pre>
          ) : (
            <>
              <button onClick={handleCopy} className="copy-button">Copy</button>
              <pre>{parsedJson}</pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonParser;