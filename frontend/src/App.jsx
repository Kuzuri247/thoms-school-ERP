import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import PagePlaceholder from './pages/PagePlaceholder';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Student Information Routes */}
        <Route path="/student/details" element={<PagePlaceholder title="Student Details" />} />
        <Route path="/student/admission" element={<PagePlaceholder title="Student Admission" />} />
        <Route path="/student/online-admission" element={<PagePlaceholder title="Online Admission" />} />
        <Route path="/student/disabled" element={<PagePlaceholder title="Disabled Students" />} />
        <Route path="/student/multi-class" element={<PagePlaceholder title="Multi Class Student" />} />
        <Route path="/student/bulk-delete" element={<PagePlaceholder title="Bulk Delete" />} />
        <Route path="/student/categories" element={<PagePlaceholder title="Student Categories" />} />
        <Route path="/student/house" element={<PagePlaceholder title="Student House" />} />
        <Route path="/student/disable-reason" element={<PagePlaceholder title="Disable Reason" />} />
        
        {/* Human Resource Routes */}
        <Route path="/hr/staff-directory" element={<PagePlaceholder title="Staff Directory" />} />
        <Route path="/hr/staff-attendance" element={<PagePlaceholder title="Staff Attendance" />} />
        <Route path="/hr/payroll" element={<PagePlaceholder title="Payroll" />} />
        <Route path="/hr/approve-leave-request" element={<PagePlaceholder title="Approve Leave Request" />} />
        <Route path="/hr/apply-leave" element={<PagePlaceholder title="Apply Leave" />} />
        <Route path="/hr/leave-type" element={<PagePlaceholder title="Leave Type" />} />
        <Route path="/hr/teachers-rating" element={<PagePlaceholder title="Teachers Rating" />} />
        <Route path="/hr/department" element={<PagePlaceholder title="Department" />} />
        <Route path="/hr/designation" element={<PagePlaceholder title="Designation" />} />
        <Route path="/hr/disabled-staff" element={<PagePlaceholder title="Disabled Staff" />} />

        {/* Fees Collection Routes */}
        <Route path="/fees/collect" element={<PagePlaceholder title="Collect Fees" />} />
        <Route path="/fees/offline-bank" element={<PagePlaceholder title="Offline Bank Payments" />} />
        <Route path="/fees/search-payment" element={<PagePlaceholder title="Search Fees Payment" />} />
        <Route path="/fees/search-due" element={<PagePlaceholder title="Search Due Fees" />} />
        <Route path="/fees/master" element={<PagePlaceholder title="Fees Master" />} />
        <Route path="/fees/quick" element={<PagePlaceholder title="Quick Fees" />} />
        <Route path="/fees/group" element={<PagePlaceholder title="Fees Group" />} />
        <Route path="/fees/type" element={<PagePlaceholder title="Fees Type" />} />
        <Route path="/fees/discount" element={<PagePlaceholder title="Fees Discount" />} />
        <Route path="/fees/carry-forward" element={<PagePlaceholder title="Fees Carry Forward" />} />
        <Route path="/fees/reminder" element={<PagePlaceholder title="Fees Reminder" />} />

        {/* Academics Routes */}
        <Route path="/academics/class-timetable" element={<PagePlaceholder title="Class Timetable" />} />
        <Route path="/academics/teachers-timetable" element={<PagePlaceholder title="Teachers Timetable" />} />
        <Route path="/academics/assign-teacher" element={<PagePlaceholder title="Assign Class Teacher" />} />
        <Route path="/academics/promote" element={<PagePlaceholder title="Promote Students" />} />
        <Route path="/academics/subject-group" element={<PagePlaceholder title="Subject Group" />} />
        <Route path="/academics/subjects" element={<PagePlaceholder title="Subjects" />} />
        <Route path="/academics/class" element={<PagePlaceholder title="Class" />} />
        <Route path="/academics/sections" element={<PagePlaceholder title="Sections" />} />

        {/* Alumni Routes */}
        <Route path="/alumni/manage" element={<PagePlaceholder title="Manage Alumni" />} />
        <Route path="/alumni/events" element={<PagePlaceholder title="Events" />} />

        {/* Annual Calendar Routes */}
        <Route path="/calendar/annual" element={<PagePlaceholder title="Annual Calendar" />} />
        <Route path="/calendar/holiday-type" element={<PagePlaceholder title="Holiday Type" />} />

        {/* Attendance Routes */}
        <Route path="/attendance/student" element={<PagePlaceholder title="Student Attendance" />} />
        <Route path="/attendance/approve-leave" element={<PagePlaceholder title="Approve Leave" />} />
        <Route path="/attendance/by-date" element={<PagePlaceholder title="Attendance By Date" />} />

        {/* Communicate Routes */}
        <Route path="/communicate/notice-board" element={<PagePlaceholder title="Notice Board" />} />
        <Route path="/communicate/send-email" element={<PagePlaceholder title="Send Email" />} />
        <Route path="/communicate/send-sms" element={<PagePlaceholder title="Send SMS" />} />
        <Route path="/communicate/log" element={<PagePlaceholder title="Email / SMS Log" />} />
        <Route path="/communicate/schedule-log" element={<PagePlaceholder title="Schedule Email SMS Log" />} />
        <Route path="/communicate/login-credentials" element={<PagePlaceholder title="Login Credentials Send" />} />
        <Route path="/communicate/email-template" element={<PagePlaceholder title="Email Template" />} />
        <Route path="/communicate/sms-template" element={<PagePlaceholder title="SMS Template" />} />

        {/* Download Center Routes */}
        <Route path="/download/upload" element={<PagePlaceholder title="Upload/Share Content" />} />
        <Route path="/download/share-list" element={<PagePlaceholder title="Content Share List" />} />
        <Route path="/download/video-tutorial" element={<PagePlaceholder title="Video Tutorial" />} />
        <Route path="/download/content-type" element={<PagePlaceholder title="Content Type" />} />

        {/* Examinations Routes */}
        <Route path="/examinations/group" element={<PagePlaceholder title="Exam Group" />} />
        <Route path="/examinations/schedule" element={<PagePlaceholder title="Exam Schedule" />} />
        <Route path="/examinations/result" element={<PagePlaceholder title="Exam Result" />} />

        {/* Transport Routes */}
        <Route path="/transport/fees-master" element={<PagePlaceholder title="Fees Master" />} />
        <Route path="/transport/pickup-point" element={<PagePlaceholder title="Pickup Point" />} />
        <Route path="/transport/routes" element={<PagePlaceholder title="Routes" />} />
        <Route path="/transport/vehicles" element={<PagePlaceholder title="Vehicles" />} />
        <Route path="/transport/assign-vehicle" element={<PagePlaceholder title="Assign Vehicle" />} />
        <Route path="/transport/route-pickup" element={<PagePlaceholder title="Route Pickup Point" />} />
        <Route path="/transport/student-fees" element={<PagePlaceholder title="Student Transport Fees" />} />

        {/* System Settings Routes */}
        <Route path="/settings/general" element={<PagePlaceholder title="General Setting" />} />
        <Route path="/settings/session" element={<PagePlaceholder title="Session Setting" />} />
        <Route path="/settings/notification" element={<PagePlaceholder title="Notification Setting" />} />
        <Route path="/settings/whatsapp" element={<PagePlaceholder title="Whatsapp Messaging" />} />
        <Route path="/settings/sms" element={<PagePlaceholder title="SMS Setting" />} />
        <Route path="/settings/payment-methods" element={<PagePlaceholder title="Payment Methods" />} />
        <Route path="/settings/print-header" element={<PagePlaceholder title="Print Header Footer" />} />
        <Route path="/settings/thermal-print" element={<PagePlaceholder title="Thermal Print" />} />
        <Route path="/settings/front-cms" element={<PagePlaceholder title="Front CMS Setting" />} />
        <Route path="/settings/roles" element={<PagePlaceholder title="Roles Permissions" />} />
        <Route path="/settings/backup" element={<PagePlaceholder title="Backup Restore" />} />
        <Route path="/settings/languages" element={<PagePlaceholder title="Languages" />} />
        <Route path="/settings/currency" element={<PagePlaceholder title="Currency" />} />
        <Route path="/settings/addons" element={<PagePlaceholder title="Addons" />} />
        <Route path="/settings/users" element={<PagePlaceholder title="Users" />} />
        <Route path="/settings/modules" element={<PagePlaceholder title="Modules" />} />
        <Route path="/settings/custom-fields" element={<PagePlaceholder title="Custom Fields" />} />

      </Route>
    </Routes>
  );
}

export default App;
