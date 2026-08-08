const fs = require('fs');
const path = require('path');
require('dotenv').config();
const cloudinary = require('./config/cloudinary');

// Path to your test dataset directory
const DATASET_DIR = path.join(__dirname, 'test'); 

const results = [];

async function uploadDirectory(dirPath, folderOnCloudinary = 'Grocery_Img/Products') {
  if (!fs.existsSync(dirPath)) {
    console.error(`\n ERROR: Folder not found at "${dirPath}"`);
    console.error(` Please place your downloaded 'test' folder at "${DATASET_DIR}" or update the DATASET_DIR path in bulkUpload.js\n`);
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively upload subfolders (e.g. test/apples, test/tomatoes)
      await uploadDirectory(fullPath, `${folderOnCloudinary}/${entry.name}`);
    } else if (entry.isFile() && /\.(jpg|jpeg|png|webp|avif)$/i.test(entry.name)) {
      try {
        console.log(`Uploading ${entry.name}...`);
        const result = await cloudinary.uploader.upload(fullPath, {
          folder: folderOnCloudinary,
          use_filename: true,
          unique_filename: false,
        });
        console.log(` SUCCESS: ${entry.name} -> ${result.secure_url}`);
        results.push({
          file: entry.name,
          folder: folderOnCloudinary,
          url: result.secure_url,
          public_id: result.public_id,
        });
      } catch (err) {
        console.error(` ERROR uploading ${entry.name}:`, err.message);
      }
    }
  }
}

uploadDirectory(DATASET_DIR)
  .then(() => {
    if (results.length > 0) {
      const outputPath = path.join(__dirname, 'uploaded_images.json');
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      console.log(`\n All ${results.length} uploads completed! Saved manifest to ${outputPath}`);
    }
  })
  .catch((err) => console.error('Upload failed:', err));

