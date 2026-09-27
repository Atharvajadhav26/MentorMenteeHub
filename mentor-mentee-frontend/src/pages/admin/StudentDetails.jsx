import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';
import { ArrowLeft, User, FileText, AlertTriangle } from 'lucide-react';

const StudentDetails = () => {
  const { id } = useParams();
  const [mentee, setMentee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/mentees/${id}`).then(res => {
      setMentee(res.data.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loader />;
  if (!mentee) return <div className="p-6 text-center text-red-500 font-bold">Student record not found.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <User className="mr-3" /> Student Profile: {mentee.prn}
        </h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={async (e) => {
              const btn = e.currentTarget;
              const originalText = btn.innerHTML;
              btn.innerHTML = 'GENERATING...'; 
              btn.disabled = true;
              try {
                const res = await api.get(`/admin/export/pdf/${mentee.id}`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const a = document.createElement('a'); 
                a.href = url; 
                a.download = `${mentee.prn}_WCE_Report.pdf`; 
                a.click();
              } catch (error) {
                console.error(error);
                alert("Failed to generate PDF Report. Ensure real data exists.");
              } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
              }
            }}
            id="pdf-btn"
            className="text-white text-[11px] font-bold uppercase tracking-widest bg-red-600 hover:bg-red-700 px-5 py-3 rounded-lg shadow-sm transition-all flex items-center">
            <FileText className="w-4 h-4 mr-2" /> Generate PDF Report
          </button>
          <Link to="/admin/mentees" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 flex items-center bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Vault Index
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-bold border-b border-slate-200 pb-3 mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-accent" /> Identity Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="font-semibold text-slate-500">Full Name</span> <span className="font-medium">{mentee.name}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-500">PRN Number</span> <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">{mentee.prn}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-500">Contact Email</span> <span className="font-medium">{mentee.email || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-500">Academic Year</span> <span className="font-medium">{mentee.academic_year}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-500">Assigned Mentor</span> <span className="font-medium">{mentee.mentor?.name || 'Unassigned'}</span></div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold border-b border-slate-200 pb-3 mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-accent" /> Structural Form Data</h2>
          <div className="bg-slate-900 p-4 rounded-lg overflow-auto max-h-52 shadow-inner">
            <pre className="text-xs text-secondary font-mono">
              {mentee.mentorshipForm ? JSON.stringify(mentee.mentorshipForm.formData, null, 2) : '// Form not submitted by student yet'}
            </pre>
          </div>
        </Card>
        
        <Card className="md:col-span-2">
          <h2 className="text-lg font-bold border-b border-slate-200 pb-3 mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-amber-500" /> Issue Logs History</h2>
          {mentee.issues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mentee.issues.map(issue => (
                <div key={issue.id} className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800">{issue.issueType}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${issue.status === 'OPEN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{issue.status}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{issue.description}</p>
                  <p className="text-xs text-slate-400">Action: {issue.actionTaken}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
              <p className="text-slate-500 font-medium">No behavioral or academic issues have been logged for this student.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
export default StudentDetails;
