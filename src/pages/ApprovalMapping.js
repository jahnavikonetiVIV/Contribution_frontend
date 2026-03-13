import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { fetchFundRequestDropdowns, saveManualMapping, fetchAutoTaggedRecords, fetchManualMappingRecords } from '../api/ingestion';
import './MISContent.css';
import './ApprovalMapping.css';

function mapAutoTaggedRecord(record) {
  const dateVal = record.dateTime ?? record.date ?? record.createdAt ?? record.dateCreated;
  return {
    id: record.id ?? record.utr,
    utr: record.utr ?? record.UTR,
    masterVa: record.masterVa ?? record.master_va ?? record.MASTER_VA ?? record.va ?? '-',
    va: record.va ?? record.VA ?? record.virtualAccount ?? '-',
    totalAmount: record.totalAmount ?? record.total_amount ?? record.TOTAL_AMOUNT ?? record.amount ?? '-',
    folio: record.folio ?? record.FOLIO ?? record.folioNumber ?? '-',
    fundName: record.fundName ?? record.fund_name ?? record.FUND_NAME ?? '-',
    dateTime: dateVal ?? '-',
  };
}

function mapManualRecord(record) {
  const dateVal = record.mappedAt ?? record.dateTime ?? record.date ?? record.createdAt ?? record.dateAnd;
  return {
    id: record.id ?? record.utr,
    utr: record.utr ?? record.UTR,
    masterVa: record.masterVa ?? record.master_va ?? record.MASTER_VA ?? '-',
    va: record.vaAccount ?? record.va ?? record.VA ?? record.virtualAccount ?? '-',
    totalAmount: record.totalTransactionAmount ?? record.totalAmount ?? record.total_amount ?? record.TOTAL_AMOUNT ?? record.amount ?? '-',
    folio: record.folio ?? record.FOLIO ?? '-',
    fundName: record.fundName ?? record.fund_name ?? record.FUND_NAME ?? '-',
    dateAnd: dateVal ?? '-',
  };
}

function formatDateTime(val) {
  if (!val) return '-';
  if (typeof val === 'string' && val.includes('T')) {
    const d = new Date(val);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  return String(val);
}

function AutoTaggedTab() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAutoTaggedRecords();
      const list = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
      setRecords(list.map(mapAutoTaggedRecord));
    } catch (err) {
      setError(err.message || 'Failed to load auto-tagged records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="approval-content">
      <h3 className="approval-section-title">Auto-Tagged Contributions</h3>
      {error && <div className="mis-error">{error}</div>}
      {loading ? (
        <div className="mis-loading">Loading auto-tagged records...</div>
      ) : (
        <div className="table-scroll-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>UTR</th>
                <th>MASTER VA</th>
                <th>VA</th>
                <th>TOTAL AMOUNT</th>
                <th>FOLIO</th>
                <th>FUND NAME</th>
                <th>DATE AND TIME</th>
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
                    <td>{row.utr}</td>
                    <td>{row.masterVa}</td>
                    <td>{row.va}</td>
                    <td>{row.totalAmount}</td>
                    <td>{row.folio}</td>
                    <td>{row.fundName}</td>
                    <td>{formatDateTime(row.dateTime)}</td>
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

function ManualMappingTab() {
  const [form, setForm] = useState({
    utr: '',
    ifscCode: '',
    transactionAmount: '',
    initialAmount: '',
    initialCommitmentFundRequestId: '',
    topupAmount: '',
    topupFundRequestId: '',
    excessAmount: '',
    remarks: '',
  });
  const [initialFundRequestOptions, setInitialFundRequestOptions] = useState([]);
  const [topupFundRequestOptions, setTopupFundRequestOptions] = useState([]);
  const [transactionAmountFetched, setTransactionAmountFetched] = useState(false);
  const [manualRecords, setManualRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadManualRecords = async () => {
    setRecordsLoading(true);
    try {
      const data = await fetchManualMappingRecords();
      const list = Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
      setManualRecords(list.map(mapManualRecord));
    } catch {
      setManualRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    loadManualRecords();
  }, []);

  const getFundRequestId = (item) => item?.fundRequestId ?? item?.ddnId ?? item?.id ?? item?.compositeId ?? item?.value ?? (typeof item === 'string' ? item : '');
  const getFundRequestLabel = (item) => (typeof item === 'object' ? item?.fundRequestId ?? item?.ddnId ?? item?.compositeId ?? item?.name ?? item?.label ?? item?.id : item) ?? '';

  const handleFetchDetails = async () => {
    if (!form.utr?.trim()) {
      setError('Please enter UTR');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetchFundRequestDropdowns(form.utr, form.ifscCode);
      const payload = response?.data ?? response;
      const data = payload?.data ?? payload;
      const amount = data.transactionAmount ?? data.amount ?? data.totalAmount;
      const initial = data.initialCommitmentFundRequests ?? data.initialCommitmentDdns ?? data.initialDdns ?? data.commitmentDdns ?? [];
      const topup = data.topupFundRequests ?? data.topupDdns ?? data.topupDdnList ?? [];

      const initialArr = Array.isArray(initial) ? initial : [];
      const topupArr = Array.isArray(topup) ? topup : [];

      setInitialFundRequestOptions(initialArr);
      setTopupFundRequestOptions(topupArr);

      setForm((f) => ({
        ...f,
        transactionAmount: amount != null ? String(amount) : f.transactionAmount,
      }));
      setTransactionAmountFetched(amount != null);
    } catch (err) {
      setError(err.message || 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  const initialNum = Number(form.initialAmount) || 0;
  const topupNum = Number(form.topupAmount) || 0;
  const excessNum = Number(form.excessAmount) || 0;
  const transactionNum = Number(form.transactionAmount) || 0;
  const sumMatches = transactionNum > 0 && initialNum + topupNum + excessNum === transactionNum;

  const initialFundRequestSelected = Boolean(form.initialCommitmentFundRequestId?.trim());
  const topupFundRequestSelected = Boolean(form.topupFundRequestId?.trim());
  const initialAmountRequired = initialFundRequestSelected && !form.initialAmount?.trim();
  const topupAmountRequired = topupFundRequestSelected && !form.topupAmount?.trim();
  const validationOk = !initialAmountRequired && !topupAmountRequired;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (initialAmountRequired) {
      setError('Initial Amount is required when Initial Commitment Fund Request is selected');
      return;
    }
    if (topupAmountRequired) {
      setError('Topup Amount is required when Topup Fund Request is selected');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveManualMapping(form);
      setForm({
        utr: '',
        ifscCode: '',
        transactionAmount: '',
        initialAmount: '',
        initialCommitmentFundRequestId: '',
        topupAmount: '',
        topupFundRequestId: '',
        excessAmount: '',
        remarks: '',
      });
      setInitialFundRequestOptions([]);
      setTopupFundRequestOptions([]);
      setTransactionAmountFetched(false);
      loadManualRecords();
    } catch (err) {
      setError(err.message || 'Failed to save mapping');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="approval-content">
      <div className="manual-mapping-form">
        <h3 className="approval-section-title">Manual Single UTR Mapping</h3>
        {error && <div className="mis-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label>UTR *</label>
              <input
                type="text"
                placeholder="Enter UTR"
                value={form.utr}
                onChange={(e) => setForm((f) => ({ ...f, utr: e.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label>IFSC Code</label>
              <input
                type="text"
                placeholder="Enter IFSC Code"
                value={form.ifscCode}
                onChange={(e) => setForm((f) => ({ ...f, ifscCode: e.target.value }))}
              />
            </div>
            <div className="form-field form-field-btn">
              <label>&nbsp;</label>
              <button type="button" className="fetch-details-btn" onClick={handleFetchDetails} disabled={loading}>
                {loading ? 'Fetching...' : 'Fetch Details'}
              </button>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Transaction Amount *</label>
              <input
                type="text"
                placeholder="Enter Transaction Amount"
                value={form.transactionAmount}
                onChange={(e) => setForm((f) => ({ ...f, transactionAmount: e.target.value }))}
                readOnly={transactionAmountFetched}
                required
              />
            </div>
          </div>
          <div className="amount-breakdown">
            <h4 className="breakdown-title">Amount Breakdown</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>Initial Amount {initialFundRequestSelected ? '*' : ''}</label>
                <input
                  type="text"
                  placeholder="Enter Initial Amount"
                  value={form.initialAmount}
                  onChange={(e) => setForm((f) => ({ ...f, initialAmount: e.target.value }))}
                  required={initialFundRequestSelected}
                />
              </div>
              <div className="form-field">
                <label>Initial Commitment Fund Request ID</label>
                <select
                  value={form.initialCommitmentFundRequestId}
                  onChange={(e) => setForm((f) => ({ ...f, initialCommitmentFundRequestId: e.target.value }))}
                >
                  <option value="">Select Fund Request</option>
                  {initialFundRequestOptions.map((opt, i) => (
                    <option key={i} value={getFundRequestId(opt)}>
                      {getFundRequestLabel(opt)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Topup Amount {topupFundRequestSelected ? '*' : ''}</label>
                <input
                  type="text"
                  placeholder="Enter Topup Amount"
                  value={form.topupAmount}
                  onChange={(e) => setForm((f) => ({ ...f, topupAmount: e.target.value }))}
                  required={topupFundRequestSelected}
                />
              </div>
              <div className="form-field">
                <label>Topup Fund Request ID</label>
                <select
                  value={form.topupFundRequestId}
                  onChange={(e) => setForm((f) => ({ ...f, topupFundRequestId: e.target.value }))}
                >
                  <option value="">Select Fund Request</option>
                  {topupFundRequestOptions.map((opt, i) => (
                    <option key={i} value={getFundRequestId(opt)}>
                      {getFundRequestLabel(opt)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Excess Amount</label>
                <input
                  type="text"
                  placeholder="Enter Excess Amount"
                  value={form.excessAmount}
                  onChange={(e) => setForm((f) => ({ ...f, excessAmount: e.target.value }))}
                />
              </div>
              <div className="form-field form-field-full">
                <label>Remarks</label>
                <input
                  type="text"
                  placeholder="Enter Remarks"
                  value={form.remarks}
                  onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <button type="submit" className="save-mapping-btn" disabled={saving || !sumMatches || !validationOk}>
            {saving ? 'Saving...' : 'Save Mapping'}
          </button>
        </form>
      </div>

      <div className="recently-mapped">
        <h3 className="approval-section-title">Recently Mapped (Manual)</h3>
        {recordsLoading ? (
          <div className="mis-loading">Loading records...</div>
        ) : (
          <div className="table-scroll-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>UTR</th>
                  <th>MASTER VA</th>
                  <th>VA</th>
                  <th>TOTAL AMOUNT</th>
                  <th>FOLIO</th>
                  <th>FUND NAME</th>
                  <th>DATE AND TIME</th>
                </tr>
              </thead>
              <tbody>
                {manualRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">No records found</td>
                  </tr>
                ) : (
                  manualRecords.map((row, i) => (
                    <tr key={row.id ?? i}>
                      <td>{row.utr}</td>
                      <td>{row.masterVa}</td>
                      <td>{row.va}</td>
                      <td>{row.totalAmount}</td>
                      <td>{row.folio}</td>
                      <td>{row.fundName}</td>
                      <td>{formatDateTime(row.dateAnd)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalMapping() {
  return <Outlet />;
}

export default ApprovalMapping;
export { AutoTaggedTab, ManualMappingTab };
