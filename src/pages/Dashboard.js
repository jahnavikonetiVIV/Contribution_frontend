import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import './Dashboard.css';

function ClassificationTabs() {
  return (
    <nav className="dashboard-tabs">
      <NavLink to="/dashboard/classification" end className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
        Classification
      </NavLink>
      <NavLink to="/dashboard/classification/improper" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
        Improper Worklist
      </NavLink>
    </nav>
  );
}

function ApprovalTabs() {
  return (
    <nav className="dashboard-tabs">
      <NavLink to="/dashboard/approval-mapping" end className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
        Auto-Tagged
      </NavLink>
      <NavLink to="/dashboard/approval-mapping/manual" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
        Manual Mapping
      </NavLink>
    </nav>
  );
}

function Dashboard() {
  const location = useLocation();
  const isClassification = location.pathname.startsWith('/dashboard/classification');
  const isApprovalMapping = location.pathname.startsWith('/dashboard/approval-mapping');
  const isMISIngestion = !isClassification && !isApprovalMapping;

  return (
    <div className="dashboard-layout">
      <SideMenu />
      <main className="dashboard-main">
        {isMISIngestion && (
          <>
            <div className="dashboard-top">
              <header className="dashboard-header">
                <div>
                  <h1 className="dashboard-title">MIS Ingestion & UTR Dedup</h1>
                  <p className="dashboard-subtitle">
                    Monitor MIS emails, webhooks, and handle fund-level UTR deduplication
                  </p>
                </div>
              </header>
              <nav className="dashboard-tabs">
                <NavLink to="/dashboard" end className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
                  MIS Inbox
                </NavLink>
                <NavLink to="/dashboard/combined" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
                  Combined Records
                </NavLink>
              </nav>
            </div>
            <div className="dashboard-scroll">
              <div className="dashboard-content">
                <Outlet />
              </div>
            </div>
          </>
        )}

        {isClassification && (
          <>
            <div className="dashboard-top">
              <header className="dashboard-header">
                <div>
                  <h1 className="dashboard-title">Classification & Improper Worklist</h1>
                  <p className="dashboard-subtitle">
                    System-driven classification and decisioning of contributions
                  </p>
                </div>
              </header>
              <ClassificationTabs />
            </div>
            <div className="dashboard-scroll">
              <div className="dashboard-content">
                <Outlet />
              </div>
            </div>
          </>
        )}

        {isApprovalMapping && (
          <>
            <div className="dashboard-top">
              <header className="dashboard-header">
                <div>
                  <h1 className="dashboard-title">Approval & Mapping to Fund Requests</h1>
                  <p className="dashboard-subtitle">
                    Auto and manual mapping of contributions to Fund Requests
                  </p>
                </div>
              </header>
              <ApprovalTabs />
            </div>
            <div className="dashboard-scroll">
              <div className="dashboard-content">
                <Outlet />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
