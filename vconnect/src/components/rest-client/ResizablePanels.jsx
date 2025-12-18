import React, { useState, useRef, useEffect } from 'react';
import './ResizablePanels.css';

const ResizablePanels = ({ topPanel, bottomPanel }) => {
  const [topHeight, setTopHeight] = useState(50);
  const containerRef = useRef(null);
  const separatorRef = useRef(null);

  useEffect(() => {
    const separator = separatorRef.current;
    if (!separator) return;

    const handleMouseDown = (e) => {
      e.preventDefault();
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        let newTopHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
        newTopHeight = Math.max(10, Math.min(90, newTopHeight)); // Clamp between 10% and 90%
        setTopHeight(newTopHeight);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    separator.addEventListener('mousedown', handleMouseDown);

    return () => {
      separator.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="resizable-panels-container" ref={containerRef}>
      <div className="top-panel" style={{ height: `${topHeight}%` }}>
        {topPanel}
      </div>
      <div className="separator" ref={separatorRef}></div>
      <div className="bottom-panel" style={{ height: `calc(100% - ${topHeight}% - 5px)` }}>
        {bottomPanel}
      </div>
    </div>
  );
};

export default ResizablePanels;