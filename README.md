# 🏫 Thomson School ERP - Enterprise School Management Platform

A modern, full-stack, role-based Enterprise Resource Planning (ERP) application engineered for educational institutions. Thomson School ERP provides a streamlined administrative interface, fee financial auditing, real-time notice broadcasting, dynamic academic calendar management, and dedicated workstation portals for Students, Teachers, Cashiers, Admins, and Super Admins.

---

## 🚀 Technology Stack

### **Frontend**
- **Core Framework**: React 19 (Vite 8)
- **Routing**: React Router v7
- **State Management**: Zustand (with persistent storage)
- **Data Fetching**: TanStack React Query v5 & Axios
- **Styling**: TailwindCSS v4 & Lucide React Icons

### **Backend**
- **Runtime & Server**: Node.js (CommonJS) & Express 5
- **Database**: MySQL 8.0 (`mysql2/promise`)
- **Security & Auth**: JSON Web Tokens (JWT), Bcrypt password hashing, Helmet, Rate-Limiting & CORS
- **Payments Integration**: Razorpay SDK

---

## 🔒 Role-Based Access Control (RBAC) & Portals

The application features 5 strictly isolated role portals:

1. 👑 **Super Admin Portal**
   - Comprehensive system metrics (`Total Students`, `Teachers`, `Staff`, `Admins`).
   - Financial Fee Collection Audit & Aggregate Inflow metrics.
   - Full User & Staff Directory management.

2. 🛡️ **Admin Portal**
   - Class Standards & Student Roster Directory (`Class 8` to `Class 12`).
   - Staff Section Management (Teachers, Cashiers, Administrative Staff).
   - Global & Role-Targeted Notice Board broadcasting.
   - School Fleet Transport & Pickup Stops management.
   - Communication Desk.

3. 👩‍🏫 **Teacher Suite**
   - Class Workstation & Subject Assignments.
   - Daily Student Attendance Register.
   - Term Marks Entry & Examination Grading.
   - Class Schedule & Timetables.

4. 🎓 **Student Portal**
   - Personal Academic Dashboard & Class Schedule.
   - Homework & Work Assignments.
   - Personal Fee Balance & Receipt History.
   - Academic Calendar & Exam Notices.

5. 💳 **Cashier / Finance Desk**
   - Student Fee Collection Terminal & Invoicing.
   - Student Balance Lookup.

---

## 🔑 Default Demo Login Credentials

All seeded accounts share the default password: **`Thomson2026!`**

| Role | Email | Default Password | Initial View |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@thomson.edu` | `Thomson2026!` | Financial Audit & Super Admin Overview |
| **Admin** | `admin@thomson.edu` | `Thomson2026!` | Admin Directory & School Workstation |
| **Teacher** | `teacher@thomson.edu` | `Thomson2026!` | Class 10 Workstation & Attendance |
| **Student** | `student@thomson.edu` | `Thomson2026!` | Class 10-A Student Portal |
| **Cashier** | `cashier@thomson.edu` | `Thomson2026!` | Fees Terminal |

> 💡 **Quick Login**: On the `/login` page, you can use the **Demo Accounts Quick Selector** cards to automatically log into any account in one click.

---

## 🛠️ Prerequisites

Ensure you have the following software installed on your machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MySQL Server**: `v8.0` or higher (running locally or remotely)

---

## ⚙️ Environment Configuration

### **1. Backend Environment (`backend/.env`)**
Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_erp
DB_PORT=3306

# JWT Authentication Secrets
JWT_ACCESS_SECRET=thomson_erp_access_secret_key_2026
JWT_REFRESH_SECRET=thomson_erp_refresh_secret_key_2026
JWT_SECRET=thomson_erp_access_secret_key_2026

# Optional Razorpay Gateway Credentials
RAZORPAY_KEY_ID=rzp_test_sample
RAZORPAY_KEY_SECRET=sample_secret
```

### **2. Frontend Environment (`frontend/.env`)**
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📥 Installation & Setup Instructions

Follow these step-by-step instructions to get the project running locally.

### **Step 1: Clone the Repository**
```bash
git clone 
cd thoms-school-ERP
```

### **Step 2: Install Backend Dependencies**
```bash
cd backend
npm install
```

### **Step 3: Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### **Step 4: Initialize MySQL Database Schema**
Ensure MySQL server is running, then run the database setup script to create the `school_erp` database and required tables:
```bash
cd ../backend
node setupDb.js
```

### **Step 5: Seed Mock Demo Data**
Execute the seeder script to populate classes (8-12), sections, subjects, teachers, students, attendance, timetables, fee records, and initial notices:
```bash
node seedMockData.js
```

---

## 🚀 Running the Project

### **Option A: Run Servers Separately**

1. **Start Backend Server** (Port `5000`):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Client** (Port `5173`):
   ```bash
   cd frontend
   npm run dev
   ```

### **Option B: Run All-in-One from Root**
```bash
npm start
```

Access the application in your browser at: **`http://localhost:5173`**

---

## 📁 Repository Structure

```
thoms-school-ERP/
├── README.md                  # Comprehensive Documentation
├── package.json               # Root scripts
├── backend/
│   ├── config/                # DB pool & constants
│   ├── middleware/            # Auth JWT, RBAC & rate limiters
│   ├── modules/               # Feature-based API modules (auth, notices)
│   ├── routes/                # Express API route handlers
│   ├── index.js               # Express application entry point
│   ├── setupDb.js             # MySQL Schema creation script
│   └── seedMockData.js        # Comprehensive DB Seeder script
└── frontend/
    ├── public/                # Static assets & brand graphics
    └── src/
        ├── api/               # Axios client & 401 refresh interceptors
        ├── components/        # Shell layout, navbar, sidebar, modals
        ├── context/           # AuthContext providers
        ├── features/          # Feature domains (academics, admin, fees, notices, users)
        ├── pages/             # Route pages (Login, Dashboards, Landing)
        ├── store/             # Zustand persistent store
        ├── utils/             # Role utilities & formatters
        ├── App.jsx            # React Router v7 routes
        └── main.jsx           # React app mount
```

---

## 🧪 Key Functionalities Verified

- ✅ **Dynamic Notifications & Academic Calendar**: Admins can post official announcements via the top bar modal (`type: global`), which instantly reflect across all user profiles and pin to the month-wise Academic Calendar.
- ✅ **Interactive Calendar Date Rules**: Date picker enforces today/future dates for event creation, preventing past-date scheduling while highlighting today's date.
- ✅ **Self-Service Password Changes**: Every logged-in user can update their password under **My Profile & Security**, executing `bcrypt` hashing and SQL updates.
- ✅ **Extended JWT Session Duration**: Configured token refresh interceptors and extended access token validity to keep user sessions logged in.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
