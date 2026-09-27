import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Admin Imports
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMentors from './pages/admin/ManageMentors';
import StudentsList from './pages/admin/StudentsList';
import StudentDetails from './pages/admin/StudentDetails';
import Reports from './pages/admin/Reports';
import AdminMeetings from './pages/admin/Meetings';

// Mentor Imports
import MentorDashboard from './pages/mentor/MentorDashboard';
import MyMentees from './pages/mentor/MyMentees';
import AddMentee from './pages/mentor/AddMentee';
import Forms from './pages/mentor/Forms';
import Meetings from './pages/mentor/Meetings';
import Issues from './pages/mentor/Issues';
import MenteeProfile from './pages/mentor/MenteeProfile';
import AchievementMatrix from './pages/mentor/AchievementMatrix';
import MentorProfile from './pages/mentor/MentorProfile';
import Guidance from './pages/mentor/Guidance';

// Mentee Imports
import MenteeDashboard from './pages/mentee/MenteeDashboard';
import Profile from './pages/mentee/Profile';
import FillForm from './pages/mentee/FillForm';
import Progress from './pages/mentee/Progress';
import Report from './pages/mentee/Report';
import Messages from './pages/mentee/Messages';
import MenteeMeetings from './pages/mentee/Meetings';
import Notifications from './pages/mentee/Notifications';
import Achievements from './pages/mentee/Achievements';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />

      <Route element={<DashboardLayout />}>
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/mentors" element={<ManageMentors />} />
          <Route path="/admin/mentees" element={<StudentsList />} />
          <Route path="/admin/mentees/:id" element={<StudentDetails />} />
          <Route path="/admin/meetings" element={<AdminMeetings />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>

        {/* Mentor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['MENTOR']} />}>
          <Route path="/mentor" element={<MentorDashboard />} />
          <Route path="/mentor/profile" element={<MentorProfile />} />
          <Route path="/mentor/mentees" element={<MyMentees />} />
          <Route path="/mentor/mentees/:id" element={<MenteeProfile />} />
          <Route path="/mentor/add" element={<AddMentee />} />
          <Route path="/mentor/guidance" element={<Guidance />} />
          <Route path="/mentor/forms" element={<Forms />} />
          <Route path="/mentor/meetings" element={<Meetings />} />
          <Route path="/mentor/issues" element={<Issues />} />
          <Route path="/mentor/achievements" element={<AchievementMatrix />} />
        </Route>

        {/* Mentee Routes */}
        <Route element={<ProtectedRoute allowedRoles={['MENTEE']} />}>
          <Route path="/mentee" element={<MenteeDashboard />} />
          <Route path="/mentee/profile" element={<Profile />} />
          <Route path="/mentee/form" element={<FillForm />} />
          <Route path="/mentee/progress" element={<Progress />} />
          <Route path="/mentee/achievements" element={<Achievements />} />
          <Route path="/mentee/report" element={<Report />} />
          <Route path="/mentee/messages" element={<Messages />} />
          <Route path="/mentee/meetings" element={<MenteeMeetings />} />
          <Route path="/mentee/notifications" element={<Notifications />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
