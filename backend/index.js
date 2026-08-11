const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const rawBody = require("./middleware/rawBody");

const app = express();

const pool = require("./config/db");

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173"];

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  }),
);

// Startup validation for database connection
pool
  .getConnection()
  .then((conn) => {
    console.log("Database connection pool verified successfully.");
    conn.release();
  })
  .catch((err) => {
    console.error(
      "FATAL: Database connection failed during startup:",
      err.message,
    );
  });

app.use(cookieParser());
app.use(morgan("combined"));

const {
  router: paymentsRouter,
  webhookRouter,
} = require("./modules/payments/payments.route");

app.use("/api/payments/webhook", rawBody, webhookRouter);

app.use("/api/homework", express.json({ limit: "10mb" }));
app.use("/api/elearning", express.json({ limit: "10mb" }));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", require("./modules/auth/auth.route"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/payments", paymentsRouter);
app.use("/api/marks", require("./modules/marks/marks.routes"));
app.use("/api/attendance", require("./modules/attendance/attendance.routes"));
app.use("/api/homework", require("./modules/homework/homework.routes"));
app.use("/api/v1/timetable", require("./modules/timetable/timetable.routes"));
app.use("/api/timetable", require("./modules/timetable/timetable.routes"));
app.use("/api/teacher", require("./modules/academics/teacher.route"));
app.use("/api/transport", require("./modules/transport/transport.routes"));
app.use("/api/reports", require("./modules/reports/reports.route"));
app.use(
  "/api/global-reports",
  require("./modules/reports/globalReports.routes"),
);
app.use("/api/staff", require("./modules/staff/teacherAssignment.routes"));
app.use("/api/notices", require("./modules/notices/notices.route"));
app.use("/api/elearning", require("./modules/elearning/elearning.routes"));
app.use(
  "/api/communication",
  require("./modules/communication/communication.routes"),
);
app.use("/api/remarks", require("./modules/remarks/remarks.routes"));
app.use("/api/admin", require("./modules/academics/promotion.routes"));


app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      success: true,
      message: "Thomson School ERP API",
      db: "connected",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
