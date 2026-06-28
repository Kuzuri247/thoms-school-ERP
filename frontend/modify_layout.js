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

// Insert access logic before studentLinks
content = content.replace('const studentLinks = [', accessLogic + '\n    const studentLinks = [');

// Now, wrap the menus. We can use regex to find each menu and wrap it.
const wrapMenu = (menuName, flagName) => {
    const searchString = `{/* ${menuName} */}\n                    <div className="pt-2">`;
    const replaceString = `{/* ${menuName} */}\n                    {${flagName} && (<div className="pt-2">`;
    
    // We also need to close the wrap. We know the menu ends with `</div>\n                    </div>` or similar.
    // Actually, it's easier to just match the start, and since we know they are sequential, we can just close it before the next menu starts.
    // But it's risky. Let's do it carefully with regex.
    
    // Pattern: {/* MenuName */} ... \n                    </div>
    // Wait, the menu is a div containing a button and a conditional div.
    // It looks like:
    /*
                    {/* Student Information Menu *\/}
                    <div className="pt-2">
                        ...
                    </div>
    */
    
    // Using regex to replace the start and end.
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
