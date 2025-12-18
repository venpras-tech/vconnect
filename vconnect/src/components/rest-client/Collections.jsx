import React, { useState, useEffect, useRef } from 'react';
import './Collections.css';
import TreeItem from './TreeItem';

const Collections = ({
  items,
  onLoadRequest,
  onSaveRequest,
  onNewRequest,
  onDeleteItem,
  onDuplicateItem,
  onRenameItem,
  onShareItem,
  isSaveDisabled,
  onRunRequest,
  onAddStack,
  onAddRequestToStack,
  selectedItemId,
  onSelectItem,
}) => {
  return (
    <div className="collections-panel">
      <h2>Collections</h2>
      <div className="collection-buttons">
        <button onClick={() => onAddRequestToStack(null)}>New Request</button>
        <button onClick={onSaveRequest} disabled={isSaveDisabled}>Save Current Request</button>
        <button onClick={() => onAddStack(null)}>Add Stack</button>
      </div>
      <div className="collections-list">
        {items.map(item => (
          <TreeItem
            key={item.id}
            item={item}
            onAddStack={onAddStack}
            onAddRequest={onAddRequestToStack}
            onLoadRequest={onLoadRequest}
            onSelectItem={onSelectItem}
            selectedItemId={selectedItemId}
            onRenameItem={onRenameItem}
            onDuplicateItem={onDuplicateItem}
            onDeleteItem={onDeleteItem}
            onShareItem={onShareItem}
            onRunRequest={onRunRequest}
          />
        ))}
      </div>
    </div>
  );
};

export default Collections;
