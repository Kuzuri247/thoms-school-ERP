const fs = require('fs');
let content = fs.readFileSync('/opt/lampp/htdocs/thoms-school-ERP/frontend/src/components/Layout.jsx', 'utf8');

const accessLogic = `
    const r = user.role;
    const canSeeStudentInfo = ['super_admin', 'admin', 'teacher'].includes(r);
    const canSeeHR = ['super_admin', 'admin'].includes(r);
    const canSeeFees = ['super_admin', 'admin', 'fee_collector', 'accountant'].includes(r);
    const canSeeAcademics = ['super_admin', 'admin', 'teacher'].includes(r);
    const canSeeAlumni = ['super_admin', 'admin'].includes(r);
    const canSeeCalendar = ['super_admin', 'admin', 'teacher', 'student'].includes(r);
    const canSeeAttendance = ['super_admin', 'admin', 'teacher'].includes(r);
    const canSeeCommunicate = ['super_admin', 'admin', 'teacher'].includes(r);
    const canSeeDownload = ['super_admin', 'admin', 'teacher', 'student'].includes(r);
    const canSeeExam = ['super_admin', 'admin', 'teacher', 'student'].includes(r);
    const canSeeTransport = ['super_admin', 'admin', 'bus_staff'].includes(r);
    const canSeeSystem = ['super_admin', 'admin'].includes(r);
`;

content = content.replace('const studentLinks = [', accessLogic + '\n    const studentLinks = [');

const wrapMenu = (menuName, flagName) => {
    const searchString = `{/* ${menuName} */}\n                    <div className="pt-2">`;
    let startIndex = content.indexOf(searchString);
    if (startIndex !== -1) {
        let regex = new RegExp(`({\\/\\* ${menuName} \\*\\/}\\s*<div className="pt-2">[\\s\\S]*?)(?=\\n\\s*{\\/\\*|\\n\\s*<\\/div>\\n\\s*<\\/div>\\n\\s*<\\/div>)`);
        
        let match = content.match(regex);
        if (match) {
            content = content.replace(match[0], `{${flagName} && (\n${match[0]}                    )}\n`);
        } else {
            console.log("Could not match end for", menuName);
        }
    } else {
        console.log("Could not find start for", menuName);
    }
}

wrapMenu('Student Information Menu', 'canSeeStudentInfo');
wrapMenu('Human Resource Menu', 'canSeeHR');
wrapMenu('Fees Collection Menu', 'canSeeFees');
wrapMenu('Academics Menu', 'canSeeAcademics');
wrapMenu('Alumni Menu', 'canSeeAlumni');
wrapMenu('Annual Calendar Menu', 'canSeeCalendar');
wrapMenu('Attendance Menu', 'canSeeAttendance');
wrapMenu('Communicate Menu', 'canSeeCommunicate');
wrapMenu('Download Center Menu', 'canSeeDownload');
wrapMenu('Examinations Menu', 'canSeeExam');
wrapMenu('Transport Menu', 'canSeeTransport');
wrapMenu('System Settings Menu', 'canSeeSystem');

fs.writeFileSync('/opt/lampp/htdocs/thoms-school-ERP/frontend/src/components/Layout.jsx', content);
console.log('Modified Layout.jsx');
