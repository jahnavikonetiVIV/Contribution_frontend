import React, { useState, useEffect } from 'react';
import { fetchCombinedRecords, downloadCombinedRecords } from '../api/ingestion';
import './MISContent.css';

function mapRecord(record) {
  const duplicate = record.duplicate ?? record.isDuplicate ?? record.is_duplicate;
  const duplicateStr = duplicate === true || duplicate === 'true' || duplicate === 'YES' ? 'Yes' : 'No';
  return {
    id: record.id ?? record.recordId,
    record: record.record ?? record.recordId ?? record.id,
    utr: record.utr,
    duplicate: duplicateStr,
    bankAccount: record.bankAccount ?? record.bank_account ?? record.accountNumber,
    ifsc: record.ifsc ?? record.ifscCode,
    va: record.va ?? record.vaCode ?? record.virtualAccount,
    date: record.date ?? record.createdAt ?? record.dateCreated ?? record.dateRecieved ?? record.dateReceived,
  };
}

function formatDate(val) {
  if (!val) return '-';
  if (typeof val === 'string') {
    if (val.includes('T')) {
      const d = new Date(val);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return val;
  }
  return String(val);
}

function CombinedRecords() {
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCombinedRecords();
      const list = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
      setRecords(list.map(mapRecord));
    } catch (err) {
      setError(err.message || 'Failed to load combined records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      await downloadCombinedRecords();
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const filtered = records.filter(
    (r) =>
      !search ||
      (r.utr || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.va || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mis-content">
      <div className="content-header">
        <h2>Combined MIS + Webhook Records</h2>
        <div className="content-actions">
          <div className="search-wrap">
            <input
              type="text"
              placeholder="Search by UTR or VA"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <button className="download-btn" onClick={handleDownload} disabled={downloading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloading ? 'Downloading...' : 'Download Combined Records'}
          </button>
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
        <div className="mis-loading">Loading combined records...</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>RECORD</th>
                <th>UTR</th>
                <th>DUPLICATE</th>
                <th>BANK ACCOUNT</th>
                <th>IFSC</th>
                <th>VA</th>
                <th>DATE</th>
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
                    <td>{row.record || '-'}</td>
                    <td>{row.utr || '-'}</td>
                    <td>
                      <span className={`badge badge-${row.duplicate.toLowerCase()}`}>
                        {row.duplicate}
                      </span>
                    </td>
                    <td>{row.bankAccount || '-'}</td>
                    <td>{row.ifsc || '-'}</td>
                    <td>{row.va || '-'}</td>
                    <td>{formatDate(row.date)}</td>
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

export default CombinedRecords;
