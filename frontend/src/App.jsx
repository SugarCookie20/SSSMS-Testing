import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthContext";
import Login from "@/features/auth/Login";
import Unauthorized from "@/features/auth/Unauthorized";
import ProtectedRoute from "@/router/ProtectedRoute";

// Layouts
import AdminLayout from "@/shared/layouts/AdminLayout";
import FacultyLayout from "@/shared/layouts/FacultyLayout";
import StudentLayout from "@/shared/layouts/StudentLayout";

// Admin Pages
import AdminDashboard from "@/features/admin/AdminDashboard";
import EnrollStudent from "@/features/admin/students/EnrollStudent";
import EnrollFaculty from "@/features/admin/faculty/EnrollFaculty";
import FeeManagement from "@/features/admin/fees/FeeManagement";
import GPALedger from "@/features/admin/results/GPALedger";
import ActivityLogs from "@/features/admin/ActivityLogs";
import ManageFaculty from "@/features/admin/faculty/ManageFaculty";
import AdminScheduleManager from "@/features/admin/schedules/AdminScheduleManager";
import AcademicSetup from "@/features/admin/AcademicSetup";
import ManageStudents from "@/features/admin/students/ManageStudents";
import AdminReportCard from "@/features/admin/results/AdminReportCard";

// Faculty Pages
import FacultyDashboard from "@/features/faculty/FacultyDashboard";
import AttendanceSheet from "@/features/attendance/AttendanceSheet";
import ResourceCenter from "@/features/resources/ResourceCenter";
import FacultySubjectList from "@/features/faculty/FacultySubjectList";
import FacultyResultsSubjects from "@/features/results/FacultyResultsSubjects";
import GradingSheet from "@/features/results/GradingSheet";
import FacultyTimetable from "@/features/timetable/FacultyTimetable";
import FacultySchedules from "@/features/timetable/FacultySchedules";
import AttendanceReport from "@/features/attendance/AttendanceReport";
import FacultyReportCard from "@/features/results/FacultyReportCard";

import NoticesPage from "@/features/notices/NoticesPage";
import UploadExamSchedule from "@/features/timetable/UploadExamSchedule";
import ManageSchedules from "@/features/timetable/ManageSchedules";
import StudentProfileView from "@/features/profile/StudentProfileView";
import FacultyProfileView from "@/features/profile/FacultyProfileView";
import UserProfile from "@/features/profile/UserProfile";
import ProfessionalDevelopment from "@/features/faculty/ProfessionalDevelopment";

// Student Pages
import StudentDashboard from "@/features/student/StudentDashboard";
import StudentResources from "@/features/resources/StudentResources";
import StudentResults from "@/features/results/StudentResults";
import StudentTimetable from "@/features/timetable/StudentTimetable";
import StudentExamSchedule from "@/features/timetable/StudentExamSchedule";
import StudentSchedules from "@/features/timetable/StudentSchedules";
import StudentProfile from "@/features/profile/StudentProfile";
import StudentReportCard from "@/features/results/StudentReportCard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ------------------- ADMIN ROUTES ------------------- */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="enroll-student" element={<EnrollStudent />} />
              <Route path="add-faculty" element={<EnrollFaculty />} />
              <Route path="notices" element={<NoticesPage />} />
              <Route path="fees" element={<FeeManagement />} />
              <Route path="gpa" element={<GPALedger />} />
              <Route path="logs" element={<ActivityLogs />} />
              <Route path="manage-faculty" element={<ManageFaculty />} />
              <Route path="manage-exams" element={<UploadExamSchedule />} />
              <Route path="manage-schedules" element={<ManageSchedules />} />
              <Route path="schedule-manager" element={<AdminScheduleManager />} />
              <Route path="academic-setup" element={<AcademicSetup />} />
              <Route path="manage-students" element={<ManageStudents />} />
              <Route path="student-profile/:id" element={<StudentProfileView />} />
              <Route path="faculty-profile/:id" element={<FacultyProfileView />} />
              <Route path="professional-development" element={<ProfessionalDevelopment />} />
              <Route path="report-card" element={<AdminReportCard />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>
          </Route>

          {/* FACULTY ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_FACULTY"]} />}>
            <Route path="/faculty" element={<FacultyLayout />}>
              <Route path="dashboard" element={<FacultyDashboard />} />

              {/* Route for selecting a subject for Attendance */}
              <Route path="attendance" element={<FacultySubjectList mode="attendance" />} />
              <Route path="attendance/:id" element={<AttendanceSheet />} />

              {/* Route for selecting a subject for Uploads */}
              <Route path="upload" element={<FacultySubjectList mode="upload" />} />
              <Route path="resources/:id" element={<ResourceCenter />} />

              <Route path="notices" element={<NoticesPage />} />

              <Route path="results" element={<FacultyResultsSubjects />} />
              <Route path="grading/:id" element={<GradingSheet />} />

              <Route path="timetable" element={<FacultyTimetable />} />
              <Route path="exam-schedule" element={<UploadExamSchedule />} />
              <Route path="manage-schedules" element={<ManageSchedules />} />
              <Route path="schedules" element={<FacultySchedules />} />

              <Route path="reports" element={<FacultySubjectList mode="report" />} />
              <Route path="report/:id" element={<AttendanceReport />} />

              <Route path="student-profile/:id" element={<StudentProfileView />} />

              <Route path="professional-development" element={<ProfessionalDevelopment />} />
              <Route path="report-card" element={<FacultyReportCard />} />
              <Route path="profile" element={<UserProfile />} />

            </Route>
          </Route>

          {/* ------------------- STUDENT ROUTES ------------------- */}
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="schedules" element={<StudentSchedules />} />
            <Route path="resources/:subjectCode" element={<StudentResources />} />
            <Route path="notices" element={<NoticesPage />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="exam-schedule" element={<StudentExamSchedule />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="report-card" element={<StudentReportCard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;