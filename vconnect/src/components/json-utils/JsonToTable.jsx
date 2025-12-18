import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './JsonToTable.css';

const JsonToTable = () => {
  const [rawJson, setRawJson] = useState('');
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState('');

  const handleConvertToTable = () => {
    try {
      let parsedJson = JSON.parse(rawJson);
      if (typeof parsedJson === 'string') {
        parsedJson = JSON.parse(parsedJson);
      }

      if (!Array.isArray(parsedJson)) {
        parsedJson = [parsedJson];
      }

      setTableData(parsedJson);
      setError('');
    } catch (error) {
      setTableData([]);
      setError(error.message);
    }
  };

  const renderCell = (data) => {
    if (typeof data === 'object' && data !== null) {
      return renderTable(Array.isArray(data) ? data : [data]);
    }
    return String(data);
  };

  const renderTable = (data) => {
    if (!data || data.length === 0) {
      return null;
    }

    const headers = Object.keys(data[0] || {});

    return (
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{renderCell(row[header])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderInitialTable = () => {
    return renderTable(tableData)
  }

  return (
    <div className="json-to-table">
      <h2>JSON to Table</h2>
      <div className="table-container">
        <div className="table-left">
          <Editor
            height="100%"
            defaultLanguage="text"
            defaultValue=""
            theme="light"
            value={rawJson}
            onChange={(value) => setRawJson(value)}
          />
        </div>
        <button onClick={handleConvertToTable}>Convert to Table</button>
        <div className="table-right">
          {error ? <pre className="error">{error}</pre> : renderInitialTable()}
        </div>
      </div>
    </div>
  );
};

export default JsonToTable;