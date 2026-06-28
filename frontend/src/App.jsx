import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import PagePlaceholder from './pages/PagePlaceholder';
import Users from './pages/Users';
import RolesPermissions from './pages/RolesPermissions';
import GenericSettingsForm from './components/settings/GenericSettingsForm';
import { 
  GeneralSettingsSchema, SessionSettingsSchema, NotificationSettingsSchema, 
  WhatsappSettingsSchema, SMSSettingsSchema, PaymentMethodsSchema, 
  PrintHeaderSchema, ThermalPrintSchema, FrontCMSSchema, BackupRestoreSchema, 
  LanguagesSchema, CurrencySchema, ModulesSchema 
} from './components/settings/SettingsSchemas';
import StaffDirectory from './pages/hr/StaffDirectory';
import StaffAttendance from './pages/hr/StaffAttendance';
import Payroll from './pages/hr/Payroll';
import LeaveRequest from './pages/hr/LeaveRequest';
import HRGenericSetup from './pages/hr/HRGenericSetup';
import TransportRoutes from './pages/transport/Routes';
import Vehicles from './pages/transport/Vehicles';
import AssignVehicle from './pages/transport/AssignVehicle';
import RoutePickupPoint from './pages/transport/RoutePickupPoint';
import StudentTransport from './pages/transport/StudentTransport';
import TransportFees from './pages/transport/TransportFees';
import TransportFeesMaster from './pages/transport/TransportFeesMaster';

import StudentDetails from './pages/student/StudentDetails';
import StudentDashboard from './pages/StudentDashboard';
import StudentAdmission from './pages/student/StudentAdmission';
import OnlineAdmission from './pages/student/OnlineAdmission';
import DisabledStudents from './pages/student/DisabledStudents';
import MultiClassStudent from './pages/student/MultiClassStudent';
import BulkDelete from './pages/student/BulkDelete';

import AnnualCalendar from './pages/calendar/AnnualCalendar';
import StudentAttendance from './pages/attendance/StudentAttendance';

import ClassTimetable from './pages/academic/ClassTimetable';
import TeachersTimetable from './pages/academic/TeachersTimetable';
import AssignClassTeacher from './pages/academic/AssignClassTeacher';
import PromoteStudents from './pages/academic/PromoteStudents';

import CollectFees from './pages/fees/CollectFees';
import SearchDueFees from './pages/fees/SearchDueFees';
import SearchPayment from './pages/fees/SearchPayment';
import FeeSheet from './pages/fees/FeeSheet';

import AdmissionEnquiry from './pages/front-office/AdmissionEnquiry';
import VisitorBook from './pages/front-office/VisitorBook';
import PhoneCallLog from './pages/front-office/PhoneCallLog';

import UploadContent from './pages/download/UploadContent';
import DownloadList from './pages/download/DownloadList';
import { CheckSquare, BookOpen, List, Download, Video } from 'lucide-react';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard activeTab="home" />} />
        <Route path="/student/fees" element={<StudentDashboard activeTab="fees" />} />
        <Route path="/student/attendance" element={<StudentDashboard activeTab="attendance" />} />
        <Route path="/student/results" element={<StudentDashboard activeTab="results" />} />
        <Route path="/student/calendar" element={<StudentDashboard activeTab="calendar" />} />
        <Route path="/student/homework" element={<StudentDashboard activeTab="homework" />} />
        <Route path="/student/transport" element={<StudentDashboard activeTab="transport" />} />
        <Route path="/student/settings" element={<StudentDashboard activeTab="settings" />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Student Information Routes */}
        <Route path="/student/details" element={<StudentDetails />} />
        <Route path="/student/admission" element={<StudentAdmission />} />
        <Route path="/student/online-admission" element={<OnlineAdmission />} />
        <Route path="/student/disabled" element={<DisabledStudents />} />
        <Route path="/student/multi-class" element={<MultiClassStudent />} />
        <Route path="/student/bulk-delete" element={<BulkDelete />} />
        <Route path="/student/categories" element={<HRGenericSetup title="Student Categories" description="Manage different student categories." columns={["Category Name", "Description"]} data={[{name: "General", desc: "General Category"}]} />} />
        <Route path="/student/house" element={<HRGenericSetup title="Student House" description="Manage student houses and groupings." columns={["House Name", "Description"]} data={[{name: "Red House", desc: "Alpha Team"}]} />} />
        <Route path="/student/disable-reason" element={<HRGenericSetup title="Disable Reasons" description="Manage reasons for disabling students." columns={["Reason"]} data={[{reason: "Transferred to another school"}]} />} />
        
        {/* Human Resource Routes */}
        <Route path="/hr/staff-directory" element={<StaffDirectory />} />
        <Route path="/hr/staff-attendance" element={<StaffAttendance />} />
        <Route path="/hr/payroll" element={<Payroll />} />
        <Route path="/hr/approve-leave-request" element={<LeaveRequest type="approve" />} />
        <Route path="/hr/apply-leave" element={<LeaveRequest type="apply" />} />
        <Route path="/hr/leave-type" element={
            <HRGenericSetup title="Leave Type" description="Manage different types of leaves." columns={['Name']} initialData={[{ name: 'Sick Leave' }, { name: 'Casual Leave' }, { name: 'Maternity Leave' }]} />
        } />
        <Route path="/hr/teachers-rating" element={
            <HRGenericSetup title="Teachers Rating" description="View and manage performance ratings." columns={['Teacher Name', 'Rating', 'Comments']} initialData={[{ name: 'Alexander Smith', rating: '5 Stars', comment: 'Excellent teaching methods' }]} />
        } />
        <Route path="/hr/department" element={
            <HRGenericSetup title="Department" description="Manage organizational departments." columns={['Name']} initialData={[{ name: 'Science' }, { name: 'Library' }, { name: 'Transport' }, { name: 'Finance' }]} />
        } />
        <Route path="/hr/designation" element={
            <HRGenericSetup title="Designation" description="Manage staff designations." columns={['Name']} initialData={[{ name: 'Teacher' }, { name: 'Librarian' }, { name: 'Bus Staff' }, { name: 'Accountant' }]} />
        } />
        <Route path="/hr/disabled-staff" element={
            <HRGenericSetup title="Disabled Staff" description="View staff members who are no longer active." columns={['Name', 'Role', 'Reason']} initialData={[{ name: 'John Doe', role: 'Teacher', reason: 'Resigned' }]} />
        } />

        {/* Fees Collection Routes */}
        <Route path="/fees/collect" element={<CollectFees />} />
        <Route path="/fees/sheet" element={<FeeSheet />} />
        <Route path="/fees/offline-bank" element={<HRGenericSetup title="Offline Bank Payments" description="Reconcile and manage bank transfers or offline payments." columns={["Reference No", "Amount", "Status"]} data={[{name: "REF-1002", amount: "5000", status: "Pending"}]} />} />
        <Route path="/fees/search-payment" element={<SearchPayment />} />
        <Route path="/fees/search-due" element={<SearchDueFees />} />
        <Route path="/fees/master" element={<HRGenericSetup title="Fees Master" description="Master configuration for school fees." columns={["Fee Group", "Fee Type", "Amount"]} data={[{group: "Tuition", type: "Monthly", amount: "2500"}]} />} />
        <Route path="/fees/quick" element={<CollectFees />} />
        <Route path="/fees/group" element={<HRGenericSetup title="Fees Group" description="Group multiple fee types together." columns={["Name", "Description"]} data={[{name: "Class 10 Fees", description: "All fees for Class 10"}]} />} />
        <Route path="/fees/type" element={<HRGenericSetup title="Fees Type" description="Define specific types of fees." columns={["Name", "Code"]} data={[{name: "Transport Fee", code: "TRP"}]} />} />
        <Route path="/fees/discount" element={<HRGenericSetup title="Fees Discount" description="Manage discount structures for students." columns={["Name", "Discount Code", "Amount"]} data={[{name: "Sibling Discount", code: "SIB10", amount: "10%"}]} />} />
        <Route path="/fees/carry-forward" element={<HRGenericSetup title="Fees Carry Forward" description="Carry forward pending dues from previous sessions." columns={["Session", "Action"]} data={[{session: "2025-2026", action: "Completed"}]} />} />
        <Route path="/fees/reminder" element={<HRGenericSetup title="Fees Reminder" description="Configure automatic reminders for fee payments." columns={["Reminder Type", "Days Before/After", "Status"]} data={[{type: "Before Due Date", days: "5 Days", status: "Active"}]} />} />

        {/* Academics Routes */}
        <Route path="/academics/class-timetable" element={<ClassTimetable />} />
        <Route path="/academics/teachers-timetable" element={<TeachersTimetable />} />
        <Route path="/academics/assign-teacher" element={<AssignClassTeacher />} />
        <Route path="/academics/promote" element={<PromoteStudents />} />
        <Route path="/academics/subject-group" element={<HRGenericSetup title="Subject Group" description="Group related subjects for a specific curriculum." columns={["Name", "Sections", "Subjects"]} data={[{name: "Science Stream", sections: "A, B", subjects: "Physics, Chemistry, Math"}]} />} />
        <Route path="/academics/subjects" element={<HRGenericSetup title="Subjects" description="Manage all academic subjects." columns={["Subject Name", "Subject Code", "Subject Type"]} data={[{name: "Mathematics", code: "MAT-101", type: "Theory"}]} />} />
        <Route path="/academics/class" element={<HRGenericSetup title="Classes" description="Manage academic classes/grades." columns={["Class", "Sections"]} data={[{class: "Class 10", sections: "A, B, C"}]} />} />
        <Route path="/academics/sections" element={<HRGenericSetup title="Sections" description="Manage sections for classes." columns={["Section Name"]} data={[{name: "Section A"}, {name: "Section B"}]} />} />

        {/* Front Office Routes */}
        <Route path="/front-office/admission-enquiry" element={<AdmissionEnquiry />} />
        <Route path="/front-office/visitor-book" element={<VisitorBook />} />
        <Route path="/front-office/phone-call-log" element={<PhoneCallLog />} />
        <Route path="/front-office/postal-dispatch" element={<HRGenericSetup title="Postal Dispatch" description="Track outgoing physical mail and parcels." columns={["To Title", "Reference No", "Address", "Date"]} data={[{name: "Board of Education", ref: "DISP-101", address: "City Center", date: "2026-06-28"}]} />} />
        <Route path="/front-office/postal-receive" element={<HRGenericSetup title="Postal Receive" description="Log incoming mail and parcels." columns={["From Title", "Reference No", "Address", "Date"]} data={[{name: "Stationery Supplier", ref: "REC-202", address: "Industrial Area", date: "2026-06-27"}]} />} />
        <Route path="/front-office/complain" element={<HRGenericSetup title="Complaints" description="Register and track complaints." columns={["Complain Type", "Source", "Name", "Date"]} data={[{type: "Maintenance", source: "Parent", name: "Ramesh Singh", date: "2026-06-25"}]} />} />
        <Route path="/front-office/setup" element={<HRGenericSetup title="Setup Front Office" description="Manage front office reference data (Complain Types, Sources, etc)." columns={["Setup Category", "Name"]} data={[{category: "Complain Type", name: "Academic"}, {category: "Source", name: "Website"}]} />} />

        {/* Alumni Routes */}
        <Route path="/alumni/manage" element={<HRGenericSetup title="Manage Alumni" description="Manage past students and alumni records." columns={["Name", "Batch", "Occupation"]} data={[{name: "John Doe", batch: "2015", occupation: "Software Engineer"}]} />} />
        <Route path="/alumni/events" element={<HRGenericSetup title="Alumni Events" description="Plan and manage alumni events." columns={["Event Name", "Date", "Location"]} data={[{name: "Annual Meetup 2026", date: "2026-12-15", location: "Main Auditorium"}]} />} />

        {/* Annual Calendar Routes */}
        <Route path="/calendar/annual" element={<AnnualCalendar />} />
        <Route path="/calendar/holiday-type" element={<HRGenericSetup title="Holiday Type" description="Manage different types of holidays and off-days." columns={["Holiday Name", "Description"]} data={[{name: "National Holiday", desc: "Government declared holidays"}, {name: "School Holiday", desc: "Internal school holidays"}]} />} />

        {/* Attendance Routes */}
        <Route path="/attendance/student" element={<StudentAttendance />} />
        <Route path="/attendance/approve-leave" element={<HRGenericSetup title="Approve Leave" description="Approve or reject student leave requests." columns={["Student Name", "Class", "Duration", "Status"]} data={[{name: "Alice Walker", class: "10 A", duration: "2 Days", status: "Pending"}]} />} />
        <Route path="/attendance/by-date" element={<HRGenericSetup title="Attendance By Date" description="View attendance records filtered by date." columns={["Date", "Total Present", "Total Absent"]} data={[{date: "2026-06-28", present: "450", absent: "32"}]} />} />

        {/* Communicate Routes */}
        <Route path="/communicate/notice-board" element={<HRGenericSetup title="Notice Board" description="Manage public notices and announcements." columns={["Title", "Date", "Published By"]} data={[{title: "Summer Vacation Dates", date: "2026-05-01", published: "Principal"}]} />} />
        <Route path="/communicate/send-email" element={<HRGenericSetup title="Send Email" description="Compose and send bulk emails." columns={["Subject", "Date Sent", "Recipients"]} data={[{subject: "Exam Schedule", date: "2026-06-25", recipients: "All Students"}]} />} />
        <Route path="/communicate/send-sms" element={<HRGenericSetup title="Send SMS" description="Compose and send SMS messages." columns={["Message", "Date Sent", "Recipients"]} data={[{message: "Fees due tomorrow", date: "2026-06-27", recipients: "Defaulters"}]} />} />
        <Route path="/communicate/log" element={<HRGenericSetup title="Communication Log" description="View logs of all sent emails and SMS." columns={["Type", "Sent To", "Date", "Status"]} data={[{type: "Email", sent: "Class 10", date: "2026-06-28", status: "Delivered"}]} />} />
        <Route path="/communicate/schedule-log" element={<HRGenericSetup title="Scheduled Log" description="View scheduled communications." columns={["Type", "Scheduled Date", "Status"]} data={[{type: "SMS", date: "2026-07-01", status: "Pending"}]} />} />
        <Route path="/communicate/login-credentials" element={<HRGenericSetup title="Send Login Credentials" description="Send portal login details to users." columns={["User Role", "Date Sent", "Count"]} data={[{role: "Students", date: "2026-06-01", count: "150"}]} />} />
        <Route path="/communicate/email-template" element={<HRGenericSetup title="Email Templates" description="Manage email templates for quick sending." columns={["Template Name", "Subject"]} data={[{name: "Welcome Email", subject: "Welcome to Thomson School"}]} />} />
        <Route path="/communicate/sms-template" element={<HRGenericSetup title="SMS Templates" description="Manage SMS templates." columns={["Template Name", "Message Preview"]} data={[{name: "Fee Reminder", preview: "Dear Parent, this is a reminder..."}]} />} />

        {/* Download Center Routes */}
        <Route path="/download/upload" element={<UploadContent />} />
        <Route path="/download/share-list" element={<DownloadList title="Content Share List" description="View and manage files shared with students and staff." icon={List} />} />
        <Route path="/download/video-tutorial" element={<DownloadList title="Video Tutorials" description="Access video resources for learning and training." icon={Video} />} />
        <Route path="/download/content-type" element={<HRGenericSetup title="Content Type Setup" description="Define types of downloadable content." columns={["Content Type Name", "Description"]} data={[{name: "Assignment", desc: "Homework and assignments"}, {name: "Study Material", desc: "Class notes and reference books"}]} />} />

        {/* Examinations Routes */}
        <Route path="/examinations/group" element={<HRGenericSetup title="Exam Group" description="Manage examination groups (e.g. Mid-Term, Final)." columns={["Group Name", "Description"]} data={[{name: "Mid Terms 2026", desc: "First semester exams"}]} />} />
        <Route path="/examinations/schedule" element={<HRGenericSetup title="Exam Schedule" description="Manage timetables for examinations." columns={["Exam Group", "Subject", "Date", "Time"]} data={[{group: "Mid Terms 2026", subject: "Mathematics", date: "2026-08-10", time: "10:00 AM"}]} />} />
        <Route path="/examinations/result" element={<HRGenericSetup title="Exam Result" description="Publish and view examination results." columns={["Exam Group", "Class", "Published On"]} data={[{group: "Mid Terms 2026", class: "Class 10", date: "2026-08-25"}]} />} />

        {/* Transport Routes */}
        <Route path="/transport/fees-master" element={<TransportFeesMaster />} />
        <Route path="/transport/pickup-point" element={<HRGenericSetup title="Pickup Points" description="Manage standalone pickup points" columns={["Point Name", "Landmark"]} data={[{name: "Central Station", landmark: "Near Clock Tower"}]} />} />
        <Route path="/transport/routes" element={<TransportRoutes />} />
        <Route path="/transport/vehicles" element={<Vehicles />} />
        <Route path="/transport/assign-vehicle" element={<AssignVehicle />} />
        <Route path="/transport/route-pickup" element={<RoutePickupPoint />} />
        <Route path="/transport/student-transport" element={<StudentTransport />} />
        <Route path="/transport/student-fees" element={<TransportFees />} />

        {/* System Settings Routes */}
        <Route path="/settings/general" element={<GenericSettingsForm {...GeneralSettingsSchema} />} />
        <Route path="/settings/session" element={<GenericSettingsForm {...SessionSettingsSchema} />} />
        <Route path="/settings/notification" element={<GenericSettingsForm {...NotificationSettingsSchema} />} />
        <Route path="/settings/whatsapp" element={<GenericSettingsForm {...WhatsappSettingsSchema} />} />
        <Route path="/settings/sms" element={<GenericSettingsForm {...SMSSettingsSchema} />} />
        <Route path="/settings/payment-methods" element={<GenericSettingsForm {...PaymentMethodsSchema} />} />
        <Route path="/settings/print-header" element={<GenericSettingsForm {...PrintHeaderSchema} />} />
        <Route path="/settings/thermal-print" element={<GenericSettingsForm {...ThermalPrintSchema} />} />
        <Route path="/settings/front-cms" element={<GenericSettingsForm {...FrontCMSSchema} />} />
        <Route path="/settings/roles" element={<RolesPermissions />} />
        <Route path="/settings/backup" element={<GenericSettingsForm {...BackupRestoreSchema} />} />
        <Route path="/settings/languages" element={<GenericSettingsForm {...LanguagesSchema} />} />
        <Route path="/settings/currency" element={<GenericSettingsForm {...CurrencySchema} />} />
        <Route path="/settings/addons" element={<HRGenericSetup title="System Addons" description="Manage third-party plugins and modules." columns={["Addon Name", "Version", "Status"]} data={[{name: "Advanced Reporting", version: "1.2.0", status: "Active"}]} />} />
        <Route path="/settings/users" element={<Users />} />
        <Route path="/settings/modules" element={<GenericSettingsForm {...ModulesSchema} />} />
        <Route path="/settings/custom-fields" element={<HRGenericSetup title="Custom Fields" description="Add custom fields to entities." columns={["Entity", "Field Name", "Type"]} data={[{entity: "Student", name: "Blood Group", type: "Dropdown"}]} />} />


      </Route>
    </Routes>
  );
}

export default App;
