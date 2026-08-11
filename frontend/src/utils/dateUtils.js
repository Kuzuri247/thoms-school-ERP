/**
 * Date utility helper functions
 */

export const isSundayDate = (dStr) => {
  if (!dStr) return false;
  const parts = String(dStr).split("T")[0].split("-");
  if (parts.length === 3) {
    const dt = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
    );
    return dt.getDay() === 0;
  }
  return new Date(dStr).getDay() === 0;
};
