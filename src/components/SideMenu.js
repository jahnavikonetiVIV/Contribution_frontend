import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SideMenu.css';

function SideMenu() {
  const { user, logout } = useAuth();

  return (
    <aside className="side-menu">
      <div className="side-menu-header">
        <h2 className="side-menu-logo">Contribution</h2>
      </div>
      <nav className="side-menu-nav">
        <div className="nav-section">
          <div className="nav-section-title">Contribution</div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end
          >
            MIS Ingestion
          </NavLink>
          <NavLink
            to="/dashboard/classification"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Classification
          </NavLink>
          <NavLink
            to="/dashboard/approval-mapping"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Approval and Mapping
          </NavLink>
        </div>
      </nav>
      <div className="side-menu-footer">
        <div className="user-info">
          <span className="user-email">{user?.username}</span>
        </div>
        <button onClick={logout} className="logout-btn">
          Log Out
        </button>
      </div>
    </aside>
  );
}

export default SideMenu;
