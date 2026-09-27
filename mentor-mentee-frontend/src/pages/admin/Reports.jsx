import React, { useState } from 'react';
import { Card } from '../../components/common/UIComponents';
import { FileText, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(false);

  const handleExportExcel = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/admin/export/excel', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'WCE_System_Extracted_Report.xlsx';
      a.click();
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800 mb-2 flex items-center">
          <FileText className="mr-3 text-accent w-8 h-8"/> Admin Data Extraction Matrix
        </h1>
        <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400 mb-10">Export native structural formats directly out of the cluster.</p>
      </div>
      
      <Card className="flex flex-col items-center justify-center p-12 text-center border-t-8 border-t-emerald-500 shadow-xl group bg-gradient-to-tr from-white to-emerald-50/20">
        <div className="bg-red-50 group-hover:bg-red-100 p-6 rounded-full mb-6 transition-colors shadow-sm">
          <FileSpreadsheet className="w-12 h-12 text-accent" />
        </div>
        <h3 className="text-2xl font-black tracking-tight text-slate-800 mb-3">Global Ecosystem Data Dump (Excel)</h3>
        <p className="text-sm font-bold text-slate-500 mb-8 max-w-lg leading-relaxed">
          Compile extensive records linking 5 completely distinct relational layers including native Progress Vectors, Issue Logs, and Active Base Profiles straight into a readable Microsoft Excel archive.
        </p>
        <button onClick={handleExportExcel} disabled={loading} className="bg-accent hover:bg-accent-dark w-full sm:w-auto text-white font-black uppercase tracking-widest text-xs px-10 py-5 flex items-center justify-center rounded-xl shadow-lg transition-all shadow-emerald-600/30 active:scale-95 disabled:opacity-50">
          {loading ? 'Transmitting Blocks...' : 'Start Pipeline Transmission'}
        </button>
        <p className="text-[9px] uppercase font-black tracking-widest text-accent mt-6 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Utilizing pure streaming via heavily optimized exceljs bindings.</p>
      </Card>
      
      <Card className="bg-slate-50 border border-slate-200 border-dashed text-center p-8 flex flex-col justify-center items-center rounded-2xl">
         <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Looking for specific individual PDF traces?</p>
         <p className="text-xs text-slate-400 font-bold mt-2">Target individual student profiles via the directory index and execute the target "Generate Matrix PDF" function directly on the profile dashboard.</p>
      </Card>
    </div>
  );
};
export default Reports;
