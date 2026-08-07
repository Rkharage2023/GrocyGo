import API from "./api";

/**
 * Slot service — centralised API calls for pickup slots.
 * Admin-only mutations (create, generate, view all) require a valid admin token
 * which is automatically attached by the Axios interceptor in api.js.
 */

/** Admin: Create a single slot */
export const createSlot = (slotData) =>
  API.post("/slots", slotData).then((r) => r.data);

/** Admin: Get all slots (history/management) */
export const getAllSlots = () =>
  API.get("/slots").then((r) => r.data);

/** Admin: Generate slot schedule bulk */
export const generateSlots = (data) =>
  API.post("/slots/generate", data).then((r) => r.data);

/** Customer/Admin: Get available slots by date (YYYY-MM-DD) */
export const getAvailableSlots = (date) =>
  API.get("/slots/available", { params: { date } }).then((r) => r.data);

/** Admin: Update slot by ID */
export const updateSlot = (slotId, slotData) =>
  API.put(`/slots/${slotId}`, slotData).then((r) => r.data);

/** Admin: Delete slot by ID */
export const deleteSlot = (slotId) =>
  API.delete(`/slots/${slotId}`).then((r) => r.data);

/** Admin: Bulk status update slots for a day */
export const bulkUpdateSlotStatus = (date, isActive) =>
  API.put("/slots/bulk/status", { date, isActive }).then((r) => r.data);

/** Admin: Bulk delete slots for a day */
export const bulkDeleteSlots = (date) =>
  API.delete("/slots/bulk", { data: { date } }).then((r) => r.data);
