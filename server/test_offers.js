const { Offer, Product, Category, sequelize } = require("./models");
const { getActiveOffers, getProductPriceDetails } = require("./utils/offerCalculator");

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    const offers = await getActiveOffers();
    console.log(`Active Offers found: ${offers.length}`);
    for (const o of offers) {
      console.log(`- Offer ID: ${o.id}, Title: "${o.title}", Type: ${o.offerType}`);
      console.log(`  Associated Products:`, o.Products?.map(p => p.id));
      console.log(`  Associated Categories:`, o.Categories?.map(c => c.id));
    }

    const products = await Product.findAll({ limit: 5 });
    console.log(`\nProducts checked:`);
    for (const p of products) {
      const details = getProductPriceDetails(p, offers);
      console.log(`- Product ID: ${p.id}, Name: "${p.name_en}", Price: ₹${p.price}`);
      console.log(`  Dynamic Price Details:`, JSON.stringify(details, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

run();
