const { Category, Product } = require("../models");
const AppError = require("../utils/AppError");

// Create Category
const createCategory = async (categoryData) => {
  const { name_en, name_mr } = categoryData;
  const { Op } = require("sequelize");

  const existingCategory = await Category.findOne({
    where: {
      [Op.or]: [
        { name_en: name_en },
        { name_mr: name_mr }
      ],
      isActive: true,
    },
  });

  if (existingCategory) {
    throw new AppError("Category already exists", 400);
  }

  const category = await Category.create(categoryData);

  return category;
};

// Get All Categories
const getAllCategories = async (query = {}) => {
  const where = {};
  if (query.includeInactive !== "true") {
    where.isActive = true;
  }
  const categories = await Category.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  return categories;
};

// Get Category By ID
const getCategoryById = async (id) => {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

// Update Category
const updateCategory = async (id, categoryData) => {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (categoryData.name_en || categoryData.name_mr) {
    const { Op } = require("sequelize");
    const orConditions = [];
    if (categoryData.name_en) orConditions.push({ name_en: categoryData.name_en });
    if (categoryData.name_mr) orConditions.push({ name_mr: categoryData.name_mr });

    const existingCategory = await Category.findOne({
      where: {
        [Op.or]: orConditions,
        isActive: true,
      },
    });

    if (existingCategory && existingCategory.id !== category.id) {
      throw new AppError("Category name (English or Marathi) already exists", 400);
    }
  }

  await category.update(categoryData);

  // Propagate isActive status changes to all associated products
  if (categoryData.isActive !== undefined) {
    const newStatus = categoryData.isActive === true || categoryData.isActive === "true";
    await Product.update(
      { isActive: newStatus },
      {
        where: {
          categoryId: id,
        },
      }
    );
  }

  return category;
};

// Hard Delete Category
const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  try {
    // Automatically delete all products in this category permanently
    await Product.destroy({
      where: {
        categoryId: id,
      },
    });

    await category.destroy();
  } catch (error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw new AppError(
        "Cannot delete category because some of its products are referenced in customer orders. Please deactivate the category instead.",
        400
      );
    }
    throw error;
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};