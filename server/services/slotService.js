const { Slot } = require("../models");
const AppError = require("../utils/AppError");
const { Op , col } = require("sequelize");
const dayjs = require("dayjs");

const deactivatePastSlots = async () => {
    const now = dayjs();
    const todayStr = now.format("YYYY-MM-DD");
    const currentTimeStr = now.format("HH:mm:ss");

    // Deactivate slots from previous days
    await Slot.update(
        { isActive: false },
        {
            where: {
                date: {
                    [Op.lt]: todayStr,
                },
                isActive: true,
            },
        }
    );

    // Deactivate slots of today that are in the past
    await Slot.update(
        { isActive: false },
        {
            where: {
                date: todayStr,
                startTime: {
                    [Op.lt]: currentTimeStr,
                },
                isActive: true,
            },
        }
    );
};

const createSlot = async (slotData) => {
    // Check if a slot already exists for the same date and time
    const existingSlot = await Slot.findOne({
        where: {
            date: slotData.date,
            startTime: slotData.startTime,
            endTime: slotData.endTime,
        },
    });

    if (existingSlot) {
        throw new AppError(
            "Slot already exists for the selected date and time",
            400
        );
    }

    if (slotData.startTime >= slotData.endTime) {
        throw new AppError(
            "Start time must be earlier than end time",
            400
        );
    }

    const slot = await Slot.create(slotData);

    return slot;
};

const getAllSlots = async () => {
    await deactivatePastSlots();
    const slots = await Slot.findAll({
        order: [
            ["date", "ASC"],
            ["startTime", "ASC"],
        ],
    });

    return slots;
};

const generateSlots = async (data) => {
    const {
        startDate,
        endDate,
        openingTime,
        closingTime,
        breakStartTime,
        breakEndTime,
        interval,
        maxCapacity,
    } = data;

    // Basic Validation
    if (dayjs(startDate).isAfter(dayjs(endDate))) {
        throw new AppError("Start date cannot be after end date", 400);
    }

    if (dayjs(startDate).isBefore(dayjs(), "day")) {
        throw new AppError("Start date cannot be in the past", 400);
    }

    if (interval <= 0) {
        throw new AppError("Interval must be greater than 0", 400);
    }

    if (maxCapacity <= 0) {
        throw new AppError("Maximum capacity must be greater than 0", 400);
    }

    // Check if slots already exist for the selected date range
    const existingSlots = await Slot.count({
        where: {
            date: {
                [Op.between]: [startDate, endDate],
            },
            isActive: true,
        },
    });

    if (existingSlots > 0) {
        throw new AppError(
            "Slots already exist for the selected date range. Please delete or deactivate them before generating new slots.",
            400
        );
    }

    const slots = [];

    let currentDate = dayjs(startDate);
    const lastDate = dayjs(endDate);

    while (
        currentDate.isBefore(lastDate) ||
        currentDate.isSame(lastDate, "day")
    ) {
        console.log(currentDate.format("YYYY-MM-DD"));

        let currentTime = dayjs(
            `${currentDate.format("YYYY-MM-DD")} ${openingTime}`
        );

        const closingDateTime = dayjs(
            `${currentDate.format("YYYY-MM-DD")} ${closingTime}`
        );

        const breakStart = breakStartTime
            ? dayjs(`${currentDate.format("YYYY-MM-DD")} ${breakStartTime}`)
            : null;

        const breakEnd = breakEndTime
            ? dayjs(`${currentDate.format("YYYY-MM-DD")} ${breakEndTime}`)
            : null;

        const now = dayjs();

        while (currentTime.isBefore(closingDateTime)) {
            const slotEnd = currentTime.add(interval, "minute");

            // Don't create a slot beyond closing time
            if (slotEnd.isAfter(closingDateTime)) {
                break;
            }

            // Mark slots in the past for today as inactive
            const isPast = currentDate.isSame(now, "day") && slotEnd.isBefore(now);

            // Skip slots that overlap the break
            if (
                breakStart &&
                breakEnd &&
                currentTime.isBefore(breakEnd) &&
                slotEnd.isAfter(breakStart)
            ) {
                currentTime = breakEnd;
                continue;
            }

            slots.push({
                date: currentDate.format("YYYY-MM-DD"),
                startTime: currentTime.format("HH:mm:ss"),
                endTime: slotEnd.format("HH:mm:ss"),
                maxCapacity,
                bookedCount: 0,
                isActive: !isPast,
            });

            currentTime = slotEnd;
        }

        currentDate = currentDate.add(1, "day");
    }

    try {
        await Slot.bulkCreate(slots);

        return {
            totalSlots: slots.length,
        };
    } catch (error) {

        if (error.name === "SequelizeUniqueConstraintError") {
            throw new AppError(
                "Slots already exist for the selected date range.",
                400
            );
        }

        throw error;
    }
};

const getAvailableSlots = async (date) => {
  if (!date) {
    throw new AppError("Date is required", 400);
  }

  await deactivatePastSlots();

  const slots = await Slot.findAll({
    where: {
      date,
      isActive: true,
      bookedCount: {
        [Op.lt]: col("maxCapacity"),
      },
    },
    order: [["startTime", "ASC"]],
  });

  return slots.map((slot) => ({
    id: slot.id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    maxCapacity: slot.maxCapacity,
    bookedCount: slot.bookedCount,
    availableCapacity: slot.maxCapacity - slot.bookedCount,
  }));
};
  
const updateSlot = async (id, slotData) => {
  const slot = await Slot.findByPk(id);
  if (!slot) {
    throw new AppError("Slot not found", 404);
  }
  await slot.update(slotData);
  return slot;
};

const deleteSlot = async (id) => {
  const slot = await Slot.findByPk(id);
  if (!slot) {
    throw new AppError("Slot not found", 404);
  }

  if (slot.bookedCount > 0) {
    throw new AppError("Cannot delete slot because it already has active customer bookings.", 400);
  }

  try {
    await slot.destroy();
  } catch (error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw new AppError("Cannot delete slot because it is referenced by existing orders.", 400);
    }
    throw error;
  }
};

const bulkUpdateSlotStatus = async (date, isActive) => {
  if (!date) {
    throw new AppError("Date is required", 400);
  }

  const [affectedCount] = await Slot.update(
    { isActive },
    {
      where: {
        date,
      },
    }
  );

  return { affectedCount };
};

const bulkDeleteSlots = async (date) => {
  if (!date) {
    throw new AppError("Date is required", 400);
  }

  // Find if there are any slots with bookings
  const bookedSlotsCount = await Slot.count({
    where: {
      date,
      bookedCount: {
        [Op.gt]: 0,
      },
    },
  });

  // Delete all slots on this date with 0 bookings
  const deletedCount = await Slot.destroy({
    where: {
      date,
      bookedCount: 0,
    },
  });

  return {
    deletedCount,
    keptCount: bookedSlotsCount,
  };
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
