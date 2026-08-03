/**
 * Helper to generate standardized student admission numbers and roll numbers
 */
const generateAdmissionNo = (userId, sessionYear = 2026) => {
  const paddedId = String(userId || 0).padStart(4, '0');
  const year = sessionYear || new Date().getFullYear();
  return `TS-${year}-${paddedId}`;
};

const generateRollNo = (userId) => {
  const paddedId = String(userId || 0).padStart(3, '0');
  return `R-${paddedId}`;
};

module.exports = {
  generateAdmissionNo,
  generateRollNo,
};
