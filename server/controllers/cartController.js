const cartService = require("../services/cartService");

const addToCart = async (req, res, next) => {
    try {
        const cart = await cartService.addToCart(
            req.user.id,
            req.body.productId,
            req.body.quantity
        );
        res.status(201).json({
            succsess: true,
            message: "product added to cart successfully",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

const getMyCart = async (req, res, next) => {
    try {
        const { date } = req.query;
        const cart = await cartService.getMyCart(req.user.id, date);

        res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

const updateCartQuantity = async (req, res, next) => {
    try {
        const cartItem = await cartService.updateCartQuantity(
            req.user.id,
            req.params.productId,
            req.body.quantity
        );
        res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            data: cartItem,
        });

    } catch (error) {
        next(error);
    }
};

const removeFromCart = async (req, res, next) => {
    try {
        await cartService.removeFromCart(
            req.user.id,
            req.params.productId
        );
        res.status(200).json({
            success: true,
            message: "Product removed from cart successfully",
            data: null,
        });
    } catch (error) {
        next(error);
    }
}

const clearCart = async (req, res, next) => {
    try{
        await cartService.clearCart(req.user.id);
        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: null,
        });

    }catch(error){
        next(error);
    }
}

module.exports = {
    addToCart,
    getMyCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
};
 

 
