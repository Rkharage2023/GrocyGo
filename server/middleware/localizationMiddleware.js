const localize = (obj, lang) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => localize(item, lang));
  }

  // Handle Sequelize instances or plain objects
  let data = obj;
  if (typeof obj.toJSON === "function") {
    data = obj.toJSON();
  } else if (obj.dataValues) {
    data = { ...obj.dataValues };
  } else {
    data = { ...obj };
  }

  // Translate category or product names
  if (data.name_en !== undefined || data.name_mr !== undefined) {
    data.name = lang === "mr" ? (data.name_mr || data.name_en) : (data.name_en || data.name_mr);
  }

  // Translate product descriptions
  if (data.description_en !== undefined || data.description_mr !== undefined) {
    data.description = lang === "mr" ? (data.description_mr || data.description_en) : (data.description_en || data.description_mr);
  }

  // Recursively localize all nested objects (like included category, product inside cart/order item)
  for (const key in data) {
    if (data[key] !== null && typeof data[key] === "object") {
      data[key] = localize(data[key], lang);
    }
  }

  return data;
};

const localizationMiddleware = (req, res, next) => {
  const lang = req.query.lang || req.headers["accept-language"] || "en";

  const originalJson = res.json;

  res.json = function (body) {
    if (body && body.data) {
      body.data = localize(body.data, lang);
    }
    return originalJson.call(this, body);
  };

  next();
};

module.exports = localizationMiddleware;
