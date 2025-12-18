import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './JSONUtil.css';

const JSONUtil = () => {
  return (
    <div className="json-util-container">
      <div className="sidebar">
        <nav>
          <ul>
            <li>
              <NavLink to="beautifier" className={({ isActive }) => (isActive ? 'active' : '')}>
                JSON Beautifier
              </NavLink>
            </li>
            <li>
              <NavLink to="parser" className={({ isActive }) => (isActive ? 'active' : '')}>
                JSON Parser
              </NavLink>
            </li>
            <li>
              <NavLink to="stringify" className={({ isActive }) => (isActive ? 'active' : '')}>
                JSON Stringify
              </NavLink>
            </li>
            <li>
              <NavLink to="to-table" className={({ isActive }) => (isActive ? 'active' : '')}>
                JSON to Table
              </NavLink>
            </li>
            <li>
              <NavLink to="ascii-b64-converter" className={({ isActive }) => (isActive ? 'active' : '')}>
                {'ASCII <> Base64'}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default JSONUtil;