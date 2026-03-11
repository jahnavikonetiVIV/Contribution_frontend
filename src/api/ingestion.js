import axiosInstance from './axiosInstance';

export async function fetchMisRecords() {
  const { data } = await axiosInstance.get(
    '/api/v1/contribution-management/ingestion/fetchMisRecords'
  );
  return Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
}

export async function fetchCombinedRecords() {
  const { data } = await axiosInstance.get(
    '/api/v1/contribution-management/ingestion/fetchRecords',
    { params: { classification: 'COMBINED' } }
  );
  return Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
}

export async function downloadCombinedRecords() {
  const response = await axiosInstance.get(
    '/api/v1/contribution-management/ingestion/downloadIngestionRecords',
    {
      params: { classification: 'combined' },
      responseType: 'blob',
    }
  );
  const disposition = response.headers['content-disposition'];
  const filenameMatch = disposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const filename = filenameMatch?.[1]?.replace(/['"]/g, '') ?? `combined-records-${new Date().toISOString().slice(0, 10)}.xlsx`;

  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function fetchClassificationList(params = {}) {
  const { data } = await axiosInstance.get(
    '/api/v1/contribution-management/classification/list',
    { params }
  );
  return Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
}

export async function downloadClassification() {
  const response = await axiosInstance.get(
    '/api/v1/contribution-management/classification/download',
    { responseType: 'blob' }
  );
  const disposition = response.headers['content-disposition'];
  const filenameMatch = disposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const filename = filenameMatch?.[1]?.replace(/['"]/g, '') ?? `classification-report-${new Date().toISOString().slice(0, 10)}.xlsx`;

  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function bulkUploadDecision(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post(
    '/api/v1/contribution-management/classification/bulk-upload-decision',
    formData
  );
  return response.data ?? {};
}

export async function fetchAutoTaggedRecords() {
  const { data } = await axiosInstance.get(
    '/api/v1/contribution-management/ddn-mappings/auto-tagged'
  );
  return Array.isArray(data) ? data : data?.content ?? data?.data ?? [];
}

export async function fetchManualMappingRecords() {
  const { data } = await axiosInstance.get(
    '/api/v1/contribution-management/ddn-mappings/manual'
  );
  const payload = data?.data ?? data;
  return Array.isArray(payload) ? payload : payload?.content ?? [];
}

export async function fetchDdnDropdowns(utr, ifscCode) {
  const { data } = await axiosInstance.post(
    '/api/v1/contribution-management/ddn-mappings/dropdowns',
    { utr, ifscCode: ifscCode || '' }
  );
  return data ?? {};
}

export async function saveManualMapping(payload) {
  const { data } = await axiosInstance.post(
    '/api/v1/contribution-management/ddn-mappings/manual',
    {
      utr: payload.utr,
      transactionAmount: Number(payload.transactionAmount) || 0,
      ifscCode: payload.ifscCode || '',
      initialAmount: Number(payload.initialAmount) || 0,
      initialCommitmentDdnId: payload.initialCommitmentDdnId || '',
      topupAmount: Number(payload.topupAmount) || 0,
      topupDdnId: payload.topupDdnId || '',
      excessAmount: Number(payload.excessAmount) || 0,
      remarks: payload.remarks || '',
    }
  );
  return data ?? {};
}
