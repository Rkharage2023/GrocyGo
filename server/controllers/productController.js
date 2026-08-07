const productService = require("../services/productService");

const createProduct = async(req, res) => {
    try {
        const productData = req.body;
        const product = await productService.createProduct(productData);
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data : product,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        }); 

    }

};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts(req.query);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async(req,res,next) => {
    try{
        const product = await(productService.getProductById(req.params.id));
        res.status(200).json({
            success : true,
            message : "Product featched successfully",
            data : product,
        });
    }catch(error){
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
}