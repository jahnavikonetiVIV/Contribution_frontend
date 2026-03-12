import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { fetchClassificationList, bulkUploadDecision, downloadClassification } from '../api/ingestion';
import './MISContent.css';
import './Classification.css';

function mapClassificationRecord(record) {
  const classification = record.classification ?? record.Classification;
  return {
    id: record.id ?? record.utr,
    utr: record.utr ?? record.UTR,
    va: record.va ?? record.VA ?? record.virtualAccount ?? 'N/A',
    folio: record.folio ?? record.FOLIO ?? record.folioNumber,
    amount: record.amount ?? record.AMOUNT ?? record.totalAmount,
    classification: classification ?? 'Pending',
    reason: record.reason ?? record.REASON ?? record.reasonText ?? '-',
    bankAccount: record.bankAccount ?? record.bank_account ?? record.BANK_ACCOUNT,
  };
}

function mapImproperRecord(record) {
  const dateVal = record.dateTime ?? record.date ?? record.createdAt ?? record.dateCreated;
  return {
    id: record.id ?? record.utr,
    utr: record.utr ?? record.UTR,
    amount: record.amount ?? record.AMOUNT ?? record.totalAmount,
    dateTime: dateVal,
    paymentMode: record.paymentMode ?? record.payment_mode ?? record.PAYMENT_MODE ?? '-',
    bankAccount: record.bankAccount ?? record.bank_account ?? record.BANK_ACCOUNT,
    ifsc: record.ifsc ?? record.IFSC ?? record.ifscCode,
    currentState: record.currentState ?? record.current_state ?? record.status ?? record.CURRENT_STATE ?? 'Improper',
  };
}

function formatDate(val) {
  if (!val) return '-';
  if (typeof val === 'string' && val.includes('T')) {
    const d = new Date(val);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  return String(val);
}

function ClassificationTab() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ nas: '', startDate: '', endDate: '', vaPrefix: '' });
  const [showFilters, setShowFilters] = useState(false);

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.nas) params.nas = filters.nas;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.vaPrefix) params.vaPrefix = filters.vaPrefix;
      const data = await fetchClassificationList(params);
      const list = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
      setRecords(list.map(mapClassificationRecord));
    } catch (err) {
      setError(err.message || 'Failed to load classification records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    loadRecords();
  };

  const handleDownloadReports = async () => {
    setDownloading(true);
    setError('');
    try {
      await downloadClassification();
    } catch (err) {
      setError(err.message || 'Failed to download classification report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="classification-content">
      <div className="content-header">
        <h2>Transaction Classification</h2>
        <div className="content-actions">
          <button className="filters-btn" onClick={() => setShowFilters(!showFilters)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
          </button>
          <button className="download-btn-outline" onClick={handleDownloadReports} disabled={downloading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloading ? 'Downloading...' : 'Download Reports'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="filter-field">
              <label>NAS</label>
              <input
                type="text"
                placeholder="NAS"
                value={filters.nas}
                onChange={(e) => setFilters((f) => ({ ...f, nas: e.target.value }))}
              />
            </div>
            <div className="filter-field">
              <label>VA Prefix</label>
              <input
                type="text"
                placeholder="VA Prefix"
                value={filters.vaPrefix}
                onChange={(e) => setFilters((f) => ({ ...f, vaPrefix: e.target.value }))}
              />
            </div>
            <div className="filter-field">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="filter-field">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <button className="download-btn" onClick={handleApplyFilters}>Apply</button>
          </div>
        </div>
      )}

      {error && <div className="mis-error">{error}</div>}

      {loading ? (
        <div className="mis-loading">Loading classification records...</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>UTR</th>
                <th>VA</th>
                <th>FOLIO</th>
                <th>AMOUNT</th>
                <th>CLASSIFICATION</th>
                <th>REASON</th>
                <th>BANK ACCOUNT</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">No records found</td>
                </tr>
              ) : (
                records.map((row, i) => (
                  <tr key={row.id ?? i}>
                    <td>{row.utr || '-'}</td>
                    <td>{row.va || '-'}</td>
                    <td>{row.folio || '-'}</td>
                    <td>{row.amount || '-'}</td>
                    <td>
                      <span className={`badge badge-${String(row.classification).toLowerCase()}`}>
                        {row.classification}
                      </span>
                    </td>
                    <td>{row.reason || '-'}</td>
                    <td>{row.bankAccount || '-'}</td>
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

function ImproperWorklistTab() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({ nas: '', startDate: '', endDate: '', vaPrefix: '' });
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = React.useRef(null);

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { classification: 'IMPROPER' };
      if (filters.nas) params.nas = filters.nas;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.vaPrefix) params.vaPrefix = filters.vaPrefix;
      const data = await fetchClassificationList(params);
      const list = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
      setRecords(list.map(mapImproperRecord));
    } catch (err) {
      setError(err.message || 'Failed to load improper worklist');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    loadRecords();
  };

  const handleBulkUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    setError('');
    try {
      await bulkUploadDecision(file);
      loadRecords();
    } catch (err) {
      setError(err.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="classification-content">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className="content-header">
        <h2>Improper Worklist</h2>
        <div className="content-actions">
          <button className="filters-btn" onClick={() => setShowFilters(!showFilters)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
          </button>
          <button className="download-btn" onClick={handleBulkUploadClick} disabled={uploading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploading ? 'Uploading...' : 'Bulk Upload Decisions'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="filter-field">
              <label>NAS</label>
              <input
                type="text"
                placeholder="NAS"
                value={filters.nas}
                onChange={(e) => setFilters((f) => ({ ...f, nas: e.target.value }))}
              />
            </div>
            <div className="filter-field">
              <label>VA Prefix</label>
              <input
                type="text"
                placeholder="VA Prefix"
                value={filters.vaPrefix}
                onChange={(e) => setFilters((f) => ({ ...f, vaPrefix: e.target.value }))}
              />
            </div>
            <div className="filter-field">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="filter-field">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <button className="download-btn" onClick={handleApplyFilters}>Apply</button>
          </div>
        </div>
      )}

      {error && <div className="mis-error">{error}</div>}

      {loading ? (
        <div className="mis-loading">Loading improper worklist...</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>UTR</th>
                <th>AMOUNT</th>
                <th>DATE AND TIME</th>
                <th>PAYMENT MODE</th>
                <th>BANK ACCOUNT</th>
                <th>IFSC</th>
                <th>CURRENT STATE</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">No records found</td>
                </tr>
              ) : (
                records.map((row, i) => (
                  <tr key={row.id ?? i}>
                    <td>{row.utr || '-'}</td>
                    <td>{row.amount || '-'}</td>
                    <td>{formatDate(row.dateTime)}</td>
                    <td>{row.paymentMode || '-'}</td>
                    <td>{row.bankAccount || '-'}</td>
                    <td>{row.ifsc || '-'}</td>
                    <td>
                      <span className={`badge badge-${String(row.currentState).toLowerCase()}`}>
                        {row.currentState}
                      </span>
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

function Classification() {
  return <Outlet />;
}

export default Classification;
export { ClassificationTab, ImproperWorklistTab };
