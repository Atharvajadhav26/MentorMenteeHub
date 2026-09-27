import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';
import { FileText, Download } from 'lucide-react';
import ExcelJS from 'exceljs';

const Forms = () => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = () => {
    api.get('/mentor/mentees').then(res => {
      setMentees(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchForms(); }, []);

  const handleSend = async (menteeId) => {
    try {
      await api.post('/mentor/forms/send', { menteeId });
      fetchForms();
    } catch(err) { alert('Error broadcasting form'); }
  };

  const handleApprove = async (formId) => {
    try {
      await api.put(`/mentor/forms/${formId}/approve`);
      fetchForms();
    } catch(err) { alert('Error finalizing form approval'); }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Mentorship_Data');

    // Define columns
    worksheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'PRN', key: 'prn', width: 15 },
      { header: 'Form Status', key: 'status', width: 15 },
      { header: 'DOB', key: 'dob', width: 15 },
      { header: 'Phone Number', key: 'phone', width: 18 },
      { header: 'Address', key: 'address', width: 35 },
      { header: 'Blood Group', key: 'bloodGroup', width: 12 },
      { header: 'Medical History', key: 'medical', width: 25 },
      { header: '10th Details', key: 'tenth', width: 20 },
      { header: '12th Details', key: 'twelfth', width: 20 },
      { header: 'Parents Details', key: 'parents', width: 30 },
      { header: 'Raw Payload Data', key: 'raw_data', width: 50 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F2FF' }
    };

    mentees.forEach(m => {
       const formObj = m.mentorshipForm?.formData || {};
       worksheet.addRow({
          name: m.name,
          prn: m.prn,
          status: m.mentorshipForm ? m.mentorshipForm.status : 'PENDING',
          dob: formObj.dob || 'N/A',
          phone: formObj.phone || formObj.mobile || 'N/A',
          address: formObj.address || formObj.localAddress || 'N/A',
          bloodGroup: formObj.bloodGroup || 'N/A',
          medical: formObj.illness || formObj.medicalHistory || 'None',
          tenth: formObj.tenth ? `${formObj.tenth.board} - ${formObj.tenth.marks}%` : 'N/A',
          twelfth: formObj.twelfth ? `${formObj.twelfth.board} - ${formObj.twelfth.marks}%` : 'N/A',
          parents: formObj.fatherName ? `Father: ${formObj.fatherName}, Mother: ${formObj.motherName}` : 'N/A',
          raw_data: JSON.stringify(formObj)
       });
    });

    // Write to browser memory & trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mentorship_Forms_Export_${Date.now()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center"><FileText className="mr-3 text-accent" /> Mentorship Forms Workflow</h1>
        <button 
          onClick={exportToExcel} 
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-lg font-bold shadow-md shadow-emerald-500/30 transition-all active:scale-[0.98]">
          <Download size={18} /> Export Excel Data
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">PRN Linkage</th>
                <th className="p-4 font-semibold">Lifecycle Status</th>
                <th className="p-4 font-semibold text-right">Action Gateway</th>
              </tr>
            </thead>
            <tbody>
              {mentees.map(m => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{m.name}</td>
                  <td className="p-4 font-bold text-slate-600">{m.prn}</td>
                  <td className="p-4">
                    {!m.mentorshipForm ? <span className="text-slate-400 italic text-xs font-bold px-3 py-1 bg-slate-100 rounded-full shadow-inner">Locked / Pending Send</span> : 
                     <span className={`px-3 py-1 text-xs rounded-full font-bold shadow-sm ${m.mentorshipForm.status === 'APPROVED' ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-800 animate-pulse'}`}>
                       {m.mentorshipForm.status}
                     </span>
                    }
                  </td>
                  <td className="p-4 text-right flex justify-end items-center gap-2">
                    {!m.mentorshipForm && <button onClick={() => handleSend(m.id)} className="text-xs font-bold bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark shadow-sm transition-all focus:ring-2 focus:ring-accent focus:ring-offset-1 hidden sm:block">Unlock & Dispatch Form</button>}
                    {m.mentorshipForm?.status === 'PENDING' && <button onClick={() => handleApprove(m.mentorshipForm.id)} className="text-xs font-bold bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 hidden sm:block">Approve Filled Data</button>}
                    {m.mentorshipForm?.status === 'APPROVED' && <span className="text-sm text-accent font-extrabold px-3 py-1 flex items-center">✓ Completed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Forms;
