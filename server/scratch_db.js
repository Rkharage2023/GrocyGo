const { sequelize, OrderItem, Product } = require("./models");

async function fixProfits() {
  const transaction = await sequelize.transaction();
  try {
    const itemsToFix = await OrderItem.findAll({
      where: {
        purchasePriceAtOrder: 0.00,
        finalSellingPriceAtOrder: 0.00
      }
    });

    console.log(`Found ${itemsToFix.length} OrderItems with zeroed pricing fields.`);

    for (const item of itemsToFix) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        item.purchasePriceAtOrder = product.purchasePrice || 0;
        item.sellingPriceAtOrder = product.price;
        item.finalSellingPriceAtOrder = item.price;
        item.discountAtOrder = Number(product.price) - Number(item.price);
        await item.save({ transaction });
      }
    }
    
    await transaction.commit();
    console.log("Successfully fixed previous order items.");
  } catch (err) {
    await transaction.rollback();
    console.error("Error fixing order items:", err);
  } finally {
    process.exit(0);
  }
}

fixProfits();
