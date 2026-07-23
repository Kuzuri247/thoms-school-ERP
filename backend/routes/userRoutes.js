const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.get('/:id/profile', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const userId = req.params.id;
        const isSelf = Number(req.user?.id) === Number(userId);
        const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user?.role);

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied: Cannot view other user profiles' });
        }
        
        // 1. Fetch base user info
        const [users] = await pool.query(
            'SELECT id, email, full_name, role, phone, class, section, status, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];
        let profileData = { ...user };

        // 2. Fetch extended profile based on role
        if (user.role === ROLES.STUDENT) {
            const [students] = await pool.query(
                'SELECT admission_no, roll_no, first_name, last_name, gender, blood_group, city, state, admission_date FROM students WHERE user_id = ?',
                [userId]
            );
            if (students.length > 0) {
                profileData = { ...profileData, ...students[0], profile_type: 'student' };
            }
        } else {
            // For teacher, admin, principal, etc.
            const [staff] = await pool.query(
                'SELECT employee_code, first_name, last_name, designation, department, joining_date, qualification, phone as emergency_phone FROM staff_profiles WHERE user_id = ?',
                [userId]
            );
            if (staff.length > 0) {
                profileData = { ...profileData, ...staff[0], profile_type: 'staff' };
            }
        }

        res.json({ success: true, data: profileData });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
