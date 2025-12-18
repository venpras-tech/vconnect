import React from 'react';
import Editor from '@monaco-editor/react';

function
  CodeEditor({ value, onChange, language, theme }) {
  const handleEditorChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  const handleEditorDidMount = (editor) => {
    editor.focus();
  };

  return (
    <div style={{ height: '100%', width: '100%', border: '1px solid #ccc' }}>
      <Editor
        height="100%"
        language={language || 'json'}
        value={value}
        theme={theme || 'light'}        
        options={{
          selectOnLineNumbers: true,
          minimap: { enabled: false },
          overviewRulerLanes: 0,
          stickyScroll:{enabled: false},
          contextmenu: false
        }}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}

export default CodeEditor;