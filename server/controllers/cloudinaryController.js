const cloudinary = require("../config/cloudinary");

let cache = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const getCloudinaryImages = async (req, res) => {
  try {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        message: "Cloudinary images fetched from cache",
        data: cache.data,
      });
    }

    console.log("Fetching resources from Cloudinary API...");
    // Fetch up to 500 resources in Cloudinary
    const result = await cloudinary.api.resources({
      max_results: 500,
      type: "upload",
    });

    const categories = [];
    const products = [];
    const all = [];

    (result.resources || []).forEach((resource) => {
      let folder = resource.asset_folder || resource.folder || "";
      if (!folder && resource.public_id && resource.public_id.includes("/")) {
        const parts = resource.public_id.split("/");
        parts.pop();
        folder = parts.join("/");
      }

      const folderLower = folder.toLowerCase();
      const filenameVal = resource.display_name || resource.filename || resource.public_id.split("/").pop();

      const item = {
        public_id: resource.public_id,
        url: resource.secure_url,
        folderPath: folder,
        folderName: folder.split("/").pop() || "General",
        filename: filenameVal,
      };

      all.push(item);

      if (folderLower.includes("categor")) {
        categories.push(item);
      }
      if (folderLower.includes("product")) {
        products.push(item);
      }
    });

    const responseData = {
      categories: categories.length > 0 ? categories : all,
      products: products.length > 0 ? products : all,
      all: all,
    };

    // Cache the response
    cache.data = responseData;
    cache.timestamp = now;

    res.status(200).json({
      success: true,
      message: "Cloudinary images fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching Cloudinary images:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Cloudinary images: " + error.message,
    });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

    const { target } = req.body;
    let folder = "Grocery_Img";
    if (target === "categories") {
      folder = "Grocery_Img/Categories";
    } else if (target === "products") {
      folder = "Grocery_Img/Products";
    }

    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const result = await uploadStream();

    // Reset local cache to ensure the new image shows up immediately
    cache.data = null;
    cache.timestamp = 0;

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image",
    });
  }
};

module.exports = {
  getCloudinaryImages,
  uploadImage,
};
