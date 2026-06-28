import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import PagePlaceholder from './pages/PagePlaceholder';
import Users from './pages/Users';
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

import StudentDetails from './pages/student/StudentDetails';
import StudentAdmission from './pages/student/StudentAdmission';
import OnlineAdmission from './pages/student/OnlineAdmission';
import DisabledStudents from './pages/student/DisabledStudents';
import MultiClassStudent from './pages/student/MultiClassStudent';
import BulkDelete from './pages/student/BulkDelete';

import AnnualCalendar from './pages/calendar/AnnualCalendar';

import ClassTimetable from './pages/academic/ClassTimetable';
import TeachersTimetable from './pages/academic/TeachersTimetable';
import AssignClassTeacher from './pages/academic/AssignClassTeacher';
import PromoteStudents from './pages/academic/PromoteStudents';

import CollectFees from './pages/fees/CollectFees';
import SearchDueFees from './pages/fees/SearchDueFees';
import SearchPayment from './pages/fees/SearchPayment';

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

        {/* Alumni Routes */}
        <Route path="/alumni/manage" element={<PagePlaceholder title="Manage Alumni" />} />
        <Route path="/alumni/events" element={<PagePlaceholder title="Events" />} />

        {/* Annual Calendar Routes */}
        <Route path="/calendar/annual" element={<AnnualCalendar />} />
        <Route path="/calendar/holiday-type" element={<HRGenericSetup title="Holiday Type" description="Manage different types of holidays and off-days." columns={["Holiday Name", "Description"]} data={[{name: "National Holiday", desc: "Government declared holidays"}, {name: "School Holiday", desc: "Internal school holidays"}]} />} />

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
        <Route path="/transport/fees-master" element={<HRGenericSetup title="Transport Fees Master" description="Manage different types of transport fee structures" columns={["Fee Type", "Amount", "Description"]} data={[{type: "Monthly", amount: "$50", desc: "Regular Monthly Fee"}]} />} />
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
        <Route path="/settings/roles" element={<PagePlaceholder title="Roles Permissions" />} />
        <Route path="/settings/backup" element={<GenericSettingsForm {...BackupRestoreSchema} />} />
        <Route path="/settings/languages" element={<GenericSettingsForm {...LanguagesSchema} />} />
        <Route path="/settings/currency" element={<GenericSettingsForm {...CurrencySchema} />} />
        <Route path="/settings/addons" element={<PagePlaceholder title="Addons" />} />
        <Route path="/settings/users" element={<Users />} />
        <Route path="/settings/modules" element={<GenericSettingsForm {...ModulesSchema} />} />
        <Route path="/settings/custom-fields" element={<PagePlaceholder title="Custom Fields" />} />


      </Route>
    </Routes>
  );
}

export default App;
