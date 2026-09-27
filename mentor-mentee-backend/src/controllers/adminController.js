const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// 1. Dashboard Stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalMentors = await prisma.mentor.count();
    const totalMentees = await prisma.mentee.count();
    const totalMeetings = await prisma.meetingReport.count();
    const totalIssues = await prisma.issueLog.count();
    
    // Charts Data
    // Bar chart (students per year)
    const mentees = await prisma.mentee.findMany({ select: { academic_year: true }});
    const studentsByYearMap = {};
    mentees.forEach(m => {
      studentsByYearMap[m.academic_year] = (studentsByYearMap[m.academic_year] || 0) + 1;
    });
    const studentsByYear = Object.keys(studentsByYearMap).map(k => ({ name: k, value: studentsByYearMap[k] }));

    // Pie chart (department distribution)
    const mentors = await prisma.mentor.findMany({ select: { department: true }});
    const deptMap = {};
    mentors.forEach(m => {
      deptMap[m.department] = (deptMap[m.department] || 0) + 1;
    });
    const deptDistribution = Object.keys(deptMap).map(k => ({ name: k, value: deptMap[k] }));

    // Issue trends over time
    const issues = await prisma.issueLog.findMany({ select: { date: true, issueType: true }, orderBy: { date: 'asc' }});
    const issuesMap = {};
    issues.forEach(i => {
      const month = new Date(i.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if(!issuesMap[month]) issuesMap[month] = { academic: 0, personal: 0 };
      if(i.issueType === 'ACADEMIC') issuesMap[month].academic += 1;
      else issuesMap[month].personal += 1;
    });
    const issueTrends = Object.keys(issuesMap).map(k => ({ name: k, academic: issuesMap[k].academic, personal: issuesMap[k].personal }));

    res.json({ success: true, data: { 
      totalMentors, totalMentees, totalMeetings, totalIssues,
      charts: { studentsByYear, deptDistribution, issueTrends }
    } });
  } catch (error) { next(error); }
};

// 2. Manage Mentors
exports.addMentor = async (req, res, next) => {
  try {
    const { name, email, department, password, academic_year } = req.body;
    
    // Create User first
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await prisma.user.create({
      data: {
        username: email, // Mentors log in via email
        password: hashedPassword,
        role: 'MENTOR',
        isFirstLogin: true,
        academic_year: academic_year || '2023-24'
      }
    });
    
    // Create Mentor profile
    const mentor = await prisma.mentor.create({
      data: {
        userId: user.id,
        name,
        email,
        department,
        academic_year: academic_year || '2023-24'
      }
    });

    res.status(201).json({ success: true, data: mentor });
  } catch (error) { next(error); }
};

exports.getMentors = async (req, res, next) => {
  try {
    const mentors = await prisma.mentor.findMany({
      include: {
        user: { select: { isActive: true } }
      }
    });
    res.json({ success: true, data: mentors });
  } catch (error) { next(error); }
};

exports.updateMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, department, academic_year } = req.body;
    
    const mentor = await prisma.mentor.update({
      where: { id },
      data: { name, department, academic_year }
    });
    res.json({ success: true, data: mentor });
  } catch (error) { next(error); }
};

exports.deactivateMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });
    
    await prisma.user.update({
      where: { id: mentor.userId },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Mentor deactivated successfully' });
  } catch (error) { next(error); }
};

// 3. View All Students
exports.getMentees = async (req, res, next) => {
  try {
    const { prn } = req.query;
    const where = prn ? { prn: { contains: prn, mode: 'insensitive' } } : {};
    
    const mentees = await prisma.mentee.findMany({
      where,
      include: {
        mentor: { select: { name: true } }
      }
    });
    res.json({ success: true, data: mentees });
  } catch (error) { next(error); }
};

// 4. View Student Details
exports.getMenteeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentee = await prisma.mentee.findUnique({
      where: { id },
      include: {
        mentor: true,
        mentorshipForm: true,
        progressRecords: true,
        issues: true,
      }
    });
    
    if (!mentee) return res.status(404).json({ success: false, message: 'Mentee not found' });
    res.json({ success: true, data: mentee });
  } catch (error) { next(error); }
};

// 5. View Reports (ADMIN PIPELINE COMPLETION)
exports.getForms = async (req, res, next) => {
  try {
    const { academic_year } = req.query;
    const forms = await prisma.mentorshipForm.findMany({
      where: academic_year ? { academic_year } : {},
      // Enforce the full include map, linking the Mentee with the Mentor so Admin sees it seamlessly
      include: { 
        mentee: {
          include: { mentor: true }
        } 
      }
    });
    res.json({ success: true, data: forms });
  } catch (error) { next(error); }
};

exports.getMeetings = async (req, res, next) => {
  try {
    const { academic_year } = req.query;
    const meetings = await prisma.meetingReport.findMany({
      where: academic_year ? { academic_year } : {},
      include: { mentor: true }  // Meetings inherently map to Mentors via constraint
    });
    res.json({ success: true, data: meetings });
  } catch (error) { next(error); }
};

exports.getIssues = async (req, res, next) => {
  try {
    const { academic_year } = req.query;
    const issues = await prisma.issueLog.findMany({
      where: academic_year ? { academic_year } : {},
      include: { mentor: true, mentee: true }
    });
    res.json({ success: true, data: issues });
  } catch (error) { next(error); }
};

// 6. Export System (PDF, Excel)
exports.exportStudentPdf = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const mentee = await prisma.mentee.findUnique({
      where: { id: studentId },
      include: {
        mentor: true,
        mentorshipForm: true,
        progressRecords: { orderBy: { semester: 'asc' } },
        issues: { orderBy: { date: 'asc' } }
      }
    });

    if (!mentee) return res.status(404).json({ success: false, message: 'Mentee not found' });

    const meetings = mentee.mentorId ? await prisma.meetingReport.findMany({ 
      where: { mentorId: mentee.mentorId }, orderBy: { date: 'asc' } 
    }) : [];

    const doc = new PDFDocument({ margin: 50 });
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-disposition': `attachment;filename=${mentee.prn}_Structured_Report.pdf`,
    });
    doc.pipe(res);

    // HEADER
    doc.fontSize(18).font('Helvetica-Bold').text('Walchand College of Engineering (WCE)', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Department of Information Technology', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text('Mentor-Mentee Report', { align: 'center', underline: true });
    doc.moveDown(2);

    // STUDENT DETAILS
    doc.fontSize(12).font('Helvetica-Bold').text('1. Student Parameters', { underline: true });
    doc.fontSize(10).font('Helvetica').moveDown(0.5);
    doc.text(`Name: ${mentee.name}`);
    doc.text(`PRN: ${mentee.prn}`);
    doc.text(`Academic Year: ${mentee.academic_year}`);
    doc.text(`Assigned Mentor: ${mentee.mentor?.name || 'Unassigned'}`);
    doc.moveDown();

    // PERSONAL INFO
    doc.fontSize(12).font('Helvetica-Bold').text('2. Personal Information Base', { underline: true });
    doc.fontSize(10).font('Helvetica').moveDown(0.5);
    if (mentee.mentorshipForm && mentee.mentorshipForm.formData) {
      const fd = mentee.mentorshipForm.formData;
      doc.text(`Blood Group: ${fd.bloodGroup || 'N/A'}`);
      doc.text(`Date of Birth: ${fd.dateOfBirth || fd.dob || 'N/A'}`);
      doc.text(`Primary Parent: ${fd.parentName || 'N/A'}`);
      doc.text(`Parent Contact: ${fd.parentPhone || 'N/A'}`);
    } else {
      doc.text('Profile attributes completely pending sync.', { italic: true });
    }
    doc.moveDown();

    // PROGRESS SECTION
    doc.fontSize(12).font('Helvetica-Bold').text('3. Academic Progress Vectors', { underline: true });
    doc.fontSize(10).font('Helvetica').moveDown(0.5);
    if(mentee.progressRecords.length > 0) {
      mentee.progressRecords.forEach((p) => {
        doc.font('Helvetica-Bold').text(`Semester ${p.semester}:`);
        doc.font('Helvetica').text(`  CGPA: ${p.cgpa} | Attendance: ${p.attendance}%`);
        doc.text(`  Technical Skills Logged: ${p.technicalSkills}`);
        doc.moveDown(0.5);
      });
    } else { doc.text('No progress bounds configured via records.'); doc.moveDown(); }

    // MEETING REPORTS
    doc.fontSize(12).font('Helvetica-Bold').text('4. Historical Meeting Trace', { underline: true });
    doc.fontSize(10).font('Helvetica').moveDown(0.5);
    if(meetings.length > 0) {
      meetings.forEach(m => {
        doc.font('Helvetica-Bold').text(`${new Date(m.date).toLocaleDateString()} - ${m.agenda}`);
        doc.font('Helvetica').text(`Summary/Discussion: ${m.discussion}`);
        doc.moveDown(0.5);
      });
    } else { doc.text('No formalized meetings documented.'); doc.moveDown(); }

    // ISSUE LOGS
    doc.fontSize(12).font('Helvetica-Bold').text('5. Escalated Issue Logs', { underline: true });
    doc.fontSize(10).font('Helvetica').moveDown(0.5);
    if(mentee.issues.length > 0) {
      mentee.issues.forEach(i => {
        doc.font('Helvetica-Bold').fillColor(i.issueType==='ACADEMIC'?'#d97706':'#dc2626').text(`Type: ${i.issueType}`);
        doc.fillColor('#000').font('Helvetica').text(`Deployed: ${new Date(i.date).toLocaleDateString()}`);
        doc.text(`Description: ${i.description}`);
        doc.text(`Action/Status: ${i.actionTaken}`);
        doc.moveDown(0.5);
      });
    } else { doc.text('Mentee maintains a clean, untracked behavioral trajectory.'); }

    // FOOTER
    doc.moveDown(2);
    doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(8).font('Helvetica-Oblique').fillColor('#666666').text('CONFIDENTIAL - Walchand College of Engineering', { align: 'center' });
    doc.text(`Report Genesis Object Generated Date: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();
  } catch (error) { next(error); }
};

exports.exportSystemExcel = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Mentor-Mentee Admin Core';

    // Sheet 1: Students
    const sheetMentees = workbook.addWorksheet('Students List Base');
    sheetMentees.columns = [
      { header: 'PRN Linked', key: 'prn', width: 20 },
      { header: 'Name Record', key: 'name', width: 25 },
      { header: 'Academic Bounds', key: 'academic_year', width: 15 },
      { header: 'Current Mentor', key: 'mentor', width: 25 },
    ];
    const mentees = await prisma.mentee.findMany({ include: { mentor: true } });
    mentees.forEach(m => sheetMentees.addRow({ prn: m.prn, name: m.name, academic_year: m.academic_year, mentor: m.mentor?.name || 'NULL NODE' }));

    // Sheet 2: Mentors
    const sheetMentors = workbook.addWorksheet('Mentors Base Matrix');
    sheetMentors.columns = [
      { header: 'Mentorship Name', key: 'name', width: 25 },
      { header: 'Linked Email', key: 'email', width: 30 },
      { header: 'Assigned Department', key: 'department', width: 20 },
    ];
    const mentors = await prisma.mentor.findMany();
    mentors.forEach(m => sheetMentors.addRow({ name: m.name, email: m.email, department: m.department }));

    // Sheet 3: Meetings
    const sheetMeetings = workbook.addWorksheet('Iterative Meeting Vault');
    sheetMeetings.columns = [
      { header: 'Mentor Node', key: 'mentor', width: 25 },
      { header: 'Timestamp Frame', key: 'date', width: 20 },
      { header: 'Session Agenda', key: 'agenda', width: 30 },
      { header: 'Extracted Discussion', key: 'discussion', width: 40 },
    ];
    const meetings = await prisma.meetingReport.findMany({ include: { mentor: true } });
    meetings.forEach(m => sheetMeetings.addRow({ mentor: m.mentor.name, date: new Date(m.date).toLocaleDateString(), agenda: m.agenda, discussion: m.discussion }));

    // Sheet 4: Issues
    const sheetIssues = workbook.addWorksheet('Issue Anomaly Trace');
    sheetIssues.columns = [
      { header: 'Mentee Array Name', key: 'mentee', width: 25 },
      { header: 'Vector Type', key: 'type', width: 15 },
      { header: 'Description Trace', key: 'description', width: 40 },
      { header: 'Status Resolution', key: 'action', width: 30 },
      { header: 'Alert Date', key: 'date', width: 20 },
    ];
    const issues = await prisma.issueLog.findMany({ include: { mentee: true } });
    issues.forEach(i => sheetIssues.addRow({ mentee: i.mentee?.name || 'UNKNOWN', type: i.issueType, description: i.description, action: i.actionTaken, date: new Date(i.date).toLocaleDateString() }));

    // Sheet 5: Progress
    const sheetProgress = workbook.addWorksheet('Progression Vectors');
    sheetProgress.columns = [
      { header: 'Mentee Reference PRN', key: 'prn', width: 20 },
      { header: 'Iteration (Sem)', key: 'semester', width: 15 },
      { header: 'CGPA Load', key: 'cgpa', width: 10 },
      { header: 'Attendance Gap %', key: 'attendance', width: 15 },
      { header: 'Calculated Metric Score', key: 'score', width: 25 },
      { header: 'Technical Pointers', key: 'tech', width: 30 },
    ];
    const progresses = await prisma.progressRecord.findMany({ include: { mentee: true } });
    progresses.forEach(p => sheetProgress.addRow({ prn: p.mentee.prn, semester: p.semester, cgpa: p.cgpa, attendance: p.attendance, score: p.autoScore, tech: p.technicalSkills }));

    // FULL EXCEL IMPLEMENTATION: Sheet 6: Mentorship Forms Extracted JSON
    const sheetForms = workbook.addWorksheet('Mentorship Form Data Vault');
    sheetForms.columns = [
      { header: 'PRN', key: 'prn', width: 20 },
      { header: 'Student Name', key: 'student', width: 25 },
      { header: 'Mentor Assignee', key: 'mentor', width: 25 },
      { header: 'Form Status', key: 'status', width: 15 },
      { header: 'DOB', key: 'dob', width: 15 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Parent Details', key: 'parents', width: 35 },
      { header: 'Medical History', key: 'medical', width: 30 },
      { header: 'Raw Payload Object', key: 'payload', width: 50 },
    ];
    
    // Cross-referencing to ensure Mentor assignment is visible
    const mentorshipForms = await prisma.mentorshipForm.findMany({ 
      include: { 
        mentee: { include: { mentor: true } } 
      } 
    });
    
    mentorshipForms.forEach(f => {
      const formObj = f.formData || {};
      sheetForms.addRow({
        student: f.mentee?.name || 'UNKNOWN',
        prn: f.mentee?.prn || 'UNKNOWN',
        mentor: f.mentee?.mentor?.name || 'UNASSIGNED',
        status: f.status,
        dob: formObj.dob || formObj.dateOfBirth || 'N/A',
        phone: formObj.phone || formObj.mobile || 'N/A',
        parents: formObj.fatherName ? `Father: ${formObj.fatherName}` : 'N/A',
        medical: formObj.medicalHistory || formObj.illness || 'N/A',
        payload: JSON.stringify(formObj)
      });
    });

    // Sheet 7: Student Achievement Comparison
    const sheetAchievements = workbook.addWorksheet('Student Achievement Comparison');
    sheetAchievements.columns = [
      { header: 'PRN',             key: 'prn',             width: 20 },
      { header: 'Student Name',    key: 'name',            width: 25 },
      { header: 'Mentor',          key: 'mentor',          width: 25 },
      { header: 'Academic Year',   key: 'academic_year',   width: 15 },
      { header: 'Achievement Type',key: 'type',            width: 18 },
      { header: 'Title',           key: 'title',           width: 30 },
      { header: 'Description',     key: 'description',     width: 45 },
      { header: 'Link',            key: 'link',            width: 35 },
      { header: 'Certificate URL', key: 'certificate_url', width: 35 },
      { header: 'Logged On',       key: 'createdAt',       width: 20 },
    ];

    const achievements = await prisma.achievement.findMany({
      include: { mentee: { include: { mentor: true } } },
      orderBy: { createdAt: 'desc' }
    });

    achievements.forEach(a => {
      sheetAchievements.addRow({
        prn:             a.mentee?.prn || 'N/A',
        name:            a.mentee?.name || 'N/A',
        mentor:          a.mentee?.mentor?.name || 'Unassigned',
        academic_year:   a.academic_year,
        type:            a.type,
        title:           a.title,
        description:     a.description,
        link:            a.link || 'N/A',
        certificate_url: a.certificate_url || 'N/A',
        createdAt:       new Date(a.createdAt).toLocaleDateString()
      });
    });

    // Style headers globally for Excel
    workbook.eachSheet((sheet) => {
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Ecosystem_Export_Data.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) { next(error); }
};

