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
                <button className="refresh-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  Refresh Data
                </button>
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
                  <h1 className="dashboard-title">Approval & Mapping to DDNs</h1>
                  <p className="dashboard-subtitle">
                    Auto and manual mapping of contributions to DDN's
                  </p>
                </div>
                <button className="refresh-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Historical Mapping
                </button>
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
