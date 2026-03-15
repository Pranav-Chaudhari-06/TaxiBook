import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportPanel = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate.toISOString());
      if (toDate) params.append('to', toDate.toISOString());

      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/report?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to generate report');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded!');
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary-600" />
        </div>
        <h2 className="section-title !mb-0">Generate PDF Report</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label">From Date</label>
          <DatePicker
            selected={fromDate}
            onChange={setFromDate}
            dateFormat="dd/MM/yyyy"
            className="input-field w-full"
            placeholderText="Start date"
            isClearable
          />
        </div>
        <div>
          <label className="label">To Date</label>
          <DatePicker
            selected={toDate}
            onChange={setToDate}
            dateFormat="dd/MM/yyyy"
            minDate={fromDate}
            className="input-field w-full"
            placeholderText="End date"
            isClearable
          />
        </div>
      </div>

      <p className="text-sm text-surface-400 mb-4">
        Leave dates empty to generate an all-time report.
      </p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-primary flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {loading ? 'Generating...' : 'Download Report'}
      </button>
    </div>
  );
};

export default ReportPanel;
