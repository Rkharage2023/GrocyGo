const sequelize = require("../config/database");

const db = {};

db.sequelize = sequelize;

// Import Models
db.User = require("./User");
db.Category = require("./Category");
db.Product = require("./Product");
db.Cart = require("./Cart");
db.CartItem = require("./CartItem");
db.Order = require("./Order");
db.OrderItem = require("./OrderItem");
db.Slot = require("./Slot");
db.RefreshToken = require("./RefreshToken");
db.Otp = require("./Otp");
db.ProductKeyword = require("./ProductKeyword");
db.Offer = require("./Offer");
db.OfferProduct = require("./OfferProduct");
db.OfferCategory = require("./OfferCategory");

// Relationships
db.Category.hasMany(db.Product, {
  foreignKey: "categoryId",
  onDelete: "RESTRICT",
});

db.Product.belongsTo(db.Category, {
  foreignKey: "categoryId",
});


//User <-> Cart
db.User.hasOne(db.Cart, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

db.Cart.belongsTo(db.User, {
  foreignKey: "userId",
});

//Cart <-> CartItem
db.Cart.hasMany(db.CartItem, {
  foreignKey: "cartId",
  onDelete: "CASCADE",
});

db.CartItem.belongsTo(db.Cart, {
  foreignKey: "cartId",
});

//Product <-> CartItem
db.Product.hasMany(db.CartItem, {
  foreignKey: "productId",
});

db.CartItem.belongsTo(db.Product, {
  foreignKey: "productId",
});


//User ↔ Order

db.User.hasMany(db.Order, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

db.Order.belongsTo(db.User, {
  foreignKey: "userId",
});

// Order ↔ OrderItem

db.Order.hasMany(db.OrderItem, {
  foreignKey: "orderId",
  onDelete: "CASCADE",
});

db.OrderItem.belongsTo(db.Order, {
  foreignKey: "orderId",
});

// Product ↔ OrderItem

db.Product.hasMany(db.OrderItem, {
  foreignKey: "productId",
});

db.OrderItem.belongsTo(db.Product, {
  foreignKey: "productId",
});


// Slot ↔ Order

db.Slot.hasMany(db.Order, {
  foreignKey: "slotId",
});

db.Order.belongsTo(db.Slot, {
  foreignKey: "slotId",
});

// User ↔ RefreshToken
db.User.hasMany(db.RefreshToken, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

db.RefreshToken.belongsTo(db.User, {
  foreignKey: "userId",
});

// Product ↔ ProductKeyword
db.Product.hasMany(db.ProductKeyword, {
  foreignKey: "productId",
  onDelete: "CASCADE",
});

db.ProductKeyword.belongsTo(db.Product, {
  foreignKey: "productId",
});

// Product <-> Offer (Many-to-Many)
db.Product.belongsToMany(db.Offer, {
  through: db.OfferProduct,
  foreignKey: "productId",
  otherKey: "offerId",
});
db.Offer.belongsToMany(db.Product, {
  through: db.OfferProduct,
  foreignKey: "offerId",
  otherKey: "productId",
});

// Category <-> Offer (Many-to-Many)
db.Category.belongsToMany(db.Offer, {
  through: db.OfferCategory,
  foreignKey: "categoryId",
  otherKey: "offerId",
});
db.Offer.belongsToMany(db.Category, {
  through: db.OfferCategory,
  foreignKey: "offerId",
  otherKey: "categoryId",
});

module.exports = db;