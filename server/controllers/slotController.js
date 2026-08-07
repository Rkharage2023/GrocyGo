const slotService = require("../services/slotService");

const createSlot = async (req, res, next) => {
  try {
    const slot = await slotService.createSlot(req.body);

    res.status(201).json({
      success: true,
      message: "Slot created successfully",
      data: slot,
    });
  } catch (error) {
    next(error);
  }
};

const getAllSlots = async (req, res, next) => {
  try {
    const slots = await slotService.getAllSlots();

    res.status(200).json({
      success: true,
      message: "Slots fetched successfully",
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

const generateSlots = async (req, res, next) => {
  try {
    const result = await slotService.generateSlots(req.body);

    res.status(201).json({
      success: true,
      message: "Slots generated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const slots = await slotService.getAvailableSlots(req.query.date);

    res.status(200).json({
      success: true,
      message: "Available slots fetched successfully",
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

const updateSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slot = await slotService.updateSlot(id, req.body);

    res.status(200).json({
      success: true,
      message: "Slot updated successfully",
      data: slot,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    await slotService.deleteSlot(id);

    res.status(200).json({
      success: true,
      message: "Slot deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const bulkUpdateSlotStatus = async (req, res, next) => {
  try {
    const { date, isActive } = req.body;
    const result = await slotService.bulkUpdateSlotStatus(date, isActive);

    res.status(200).json({
      success: true,
      message: `Successfully updated status of ${result.affectedCount} slots.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const bulkDeleteSlots = async (req, res, next) => {
  try {
    const { date } = req.body;
    const result = await slotService.bulkDeleteSlots(date);

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} unbooked slots. ${result.keptCount} slots with active bookings were kept.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSlot,
  getAllSlots,
  generateSlots,
  getAvailableSlots,
  updateSlot,
  deleteSlot,
  bulkUpdateSlotStatus,
  bulkDeleteSlots,
};

