const categoryService = require("../services/categoryService");

const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories(req.query);

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await categoryService.getCategoryById(id);

        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await categoryService.updateCategory(id, req.body);

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await categoryService.deleteCategory(id);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message,
        });

    }
};


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
