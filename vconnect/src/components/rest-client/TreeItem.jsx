import React, { useState, useEffect, useRef } from 'react';
import './TreeItem.css';

const TreeItem = ({ item, onContextMenu, onAddStack, onAddRequest, onLoadRequest, onSelectItem,onDeleteItem,onDuplicateItem,onRenameItem,onShareItem, onRunRequest, selectedItemId }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isFolder = item.type === 'folder';

  const handleSelect = () => {
    onSelectItem(item.id);
    if (!isFolder) {
      onLoadRequest(item);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, item.id, isFolder);
  };

  const isSelected = item.id === selectedItemId;

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`tree-item ${isSelected ? 'selected' : ''}`} onContextMenu={handleContextMenu}>
      <div className="item-content">
        <span className="item-toggle" onClick={(e) => { e.stopPropagation(); isFolder && setIsOpen(!isOpen); }}>
          {isFolder ? (isOpen ? '▼' : '►') : ''}
        </span>
        <span className="item-name" onClick={handleSelect}>
          {!isFolder && <span className={`method-${item.method}`}>{item.method}</span>}
          {item.name}
        </span>
        <div className="item-actions" ref={menuRef}>
          <button onClick={handleMenuToggle}>...</button>
          {isMenuOpen && (
            <div className="dropdown-menu">
              {isFolder ? (
                <>
                  <div onClick={() => onAddRequest(item.id)}>Add Request</div>
                  <div onClick={() => onAddStack(item.id)}>Add Folder</div>
                  <div onClick={() => onRenameItem(item.id)}>Rename</div>
                  <div onClick={() => onDuplicateItem(item.id)}>Duplicate</div>
                  <div onClick={() => onDeleteItem(item.type, item.id)}>Delete</div>
                  <div onClick={() => onShareItem(item.id)}>Share</div>
                </>
              ) : (
                <>
                  <div onClick={() => onRunRequest(item)}>Run</div>
                  <div onClick={() => onRenameItem(item.id)}>Rename</div>
                  <div onClick={() => onDuplicateItem(item.id)}>Duplicate</div>
                  <div onClick={() => onDeleteItem(item.type, item.id)}>Delete</div>
                  <div onClick={() => onShareItem(item.id)}>Share</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {isFolder && isOpen && (
        <div className="children">
          {item.children && item.children.map(child => (
            <TreeItem
              key={child.id}
              item={child}
              onContextMenu={onContextMenu}
              onAddStack={onAddStack}
              onAddRequest={onAddRequest}
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
          {item.requests && item.requests.map(request => (
            <TreeItem
              key={request.id}
              item={request}
              onContextMenu={onContextMenu}
              onAddStack={onAddStack}
              onAddRequest={onAddRequest}
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
      )}
    </div>
  );
};

export default TreeItem;
