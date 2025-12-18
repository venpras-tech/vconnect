import React from 'react';
import './KeyValuePair.css';

const KeyValuePair = ({ pair, onPairChange, onRemovePair }) => {
  return (
    <div className="key-value-pair">
      <input
        type="checkbox"
        checked={pair.enabled}
        onChange={(e) => onPairChange({ ...pair, enabled: e.target.checked })}
      />
      <input
        type="text"
        placeholder="Key"
        value={pair.key}
        onChange={(e) => onPairChange({ ...pair, key: e.target.value })}
        disabled={!pair.enabled}
      />
      <input
        type="text"
        placeholder="Value"
        value={pair.value}
        onChange={(e) => onPairChange({ ...pair, value: e.target.value })}
        disabled={!pair.enabled}
      />
      <button onClick={() => onRemovePair(pair.id)}>Remove</button>
    </div>
  );
};

export default KeyValuePair;