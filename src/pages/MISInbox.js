import React, { useState, useEffect } from 'react';
import { fetchMisRecords } from '../api/ingestion';
import './MISContent.css';

function mapRecord(record) {
  return {
    id: record.id ?? record.misRecordId,
    date: record.dateReceived ?? record.dateRecieved ?? record.date,
    sender: record.senderEmail ?? record.sender,
    fund: record.fundName ?? record.fund,
    attachment: record.attachment ?? record.attachmentName ?? record.fileName,
    status: record.status ?? 'Pending',
    error: record.errorReason ?? record.error ?? '-',
  };
}

function formatDate(val) {
  if (!val) return '-';
  if (typeof val === 'string' && val.includes('T')) {
    const d = new Date(val);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return String(val);
}

function MISInbox() {
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMisRecords();
      const list = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
      setRecords(list.map(mapRecord));
    } catch (err) {
      setError(err.message || 'Failed to load MIS records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const filtered = records.filter(
    (r) =>
      !search ||
      (r.sender || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.fund || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mis-content">
      <div className="content-header">
        <h2>MIS Email Inbox</h2>
        <div className="content-actions">
          <div className="search-wrap">
          <input
            type="text"
            placeholder="Search by Sender or Fund"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
          <button className="refresh-btn" onClick={loadRecords} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="mis-error">{error}</div>}

      {loading ? (
        <div className="mis-loading">Loading MIS records...</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE RECEIVED</th>
                <th>SENDER EMAIL</th>
                <th>FUND NAME</th>
                <th>ATTACHMENT</th>
                <th>STATUS</th>
                <th>ERROR REASON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">No records found</td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={row.id ?? i}>
                    <td>{formatDate(row.date)}</td>
                    <td>{row.sender || '-'}</td>
                    <td>{row.fund || '-'}</td>
                    <td>{row.attachment || '-'}</td>
                    <td>
                      <span className={`badge badge-${String(row.status).toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.error || '-'}</td>
                    <td>
                      <button className="icon-btn" title="Download">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MISInbox;
