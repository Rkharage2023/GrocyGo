-- ============================================================
-- GrocyGo — Seed Data
-- Database: grocery_store
-- Skips: users (already have 2 customers + 1 admin)
-- Includes: categories + products (Fully aligned with Multilingual & Pricing migrations)
-- ============================================================

USE grocery_store;

-- Force the connection character set to utf8mb4 to support emojis and Marathi script
SET NAMES utf8mb4;

-- Safely drop existing tables (disabling foreign keys temporarily to avoid constraint issues)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
SET FOREIGN_KEY_CHECKS = 1;

-- Create categories table with full schema support (including multilingual name_en and name_mr)
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name_en` VARCHAR(255) NOT NULL UNIQUE,
  `name_mr` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `image` VARCHAR(255) NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create products table with full schema support (multilingual names/descriptions & purchasePrice)
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name_en` VARCHAR(255) NOT NULL,
  `name_mr` VARCHAR(255) NOT NULL,
  `description_en` TEXT NULL,
  `description_mr` TEXT NULL,
  `purchasePrice` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `price` DECIMAL(10, 2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `unit` VARCHAR(255) NOT NULL,
  `image` VARCHAR(255) NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `categoryId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_categories` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_products_name_en` (`name_en`),
  INDEX `idx_products_name_mr` (`name_mr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- STEP 1: CATEGORIES  (run this first)
-- ============================================================

INSERT INTO `categories` (`id`, `name_en`, `name_mr`, `description`, `image`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Fruits & Vegetables',  'फळे आणि भाज्या',           'Fresh daily fruits and vegetables',              'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860009/Fruits_and_vegetables_iy4uw6.png', 1, NOW(), NOW()),
(2, 'Dairy & Eggs',         'दुग्धजन्य पदार्थ आणि अंडी',  'Milk, cheese, butter, curd, and eggs',           'https://res.cloudinary.com/n0he2dk8/image/upload/v1783869620/Dairy_and_eggs_johjhr.png', 1, NOW(), NOW()),
(3, 'Grains & Cereals',     'धान्य आणि कडधान्ये',       'Rice, wheat, oats, pulses and lentils',          'https://res.cloudinary.com/n0he2dk8/image/upload/v1783859962/grains_and_cereals_ci6pob.png', 1, NOW(), NOW()),
(4, 'Snacks & Beverages',   'स्नॅक्स आणि पेये',         'Chips, biscuits, juices, tea and coffee',        'https://res.cloudinary.com/n0he2dk8/image/upload/v1783859903/Snacks_and_beverages_p7tsla.png', 1, NOW(), NOW()),
(5, 'Meat & Fish',          'मांस आणि मासे',           'Fresh chicken, mutton, fish and seafood',        'https://res.cloudinary.com/n0he2dk8/image/upload/v1783859934/Fresh_meats_zmadqd.png', 1, NOW(), NOW()),
(6, 'Bakery & Bread',       'बेकरी आणि पाव',            'Fresh breads, cakes, buns and pastries',         'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860081/baked_bakery_anf1c7.png', 1, NOW(), NOW()),
(7, 'Spices & Condiments',  'मसाले आणि सॉस',            'Masalas, sauces, pickles and oils',              'https://res.cloudinary.com/n0he2dk8/image/upload/v1783859851/Spice_b41rcj.png', 1, NOW(), NOW()),
(8, 'Frozen Foods',         'फ्रोझन पदार्थ',            'Frozen vegetables, ice cream and ready meals',   'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860039/frozen_foods_rjymar.png', 1, NOW(), NOW());

-- Verify: SELECT id, name_en, name_mr FROM categories;


-- ============================================================
-- STEP 2: PRODUCTS
-- Assumes category IDs are 1-8 in the order inserted above.
-- Includes name_en, name_mr, description_en, description_mr, purchasePrice, createdAt, updatedAt
-- ============================================================

INSERT INTO `products` (`id`, `name_en`, `name_mr`, `description_en`, `description_mr`, `purchasePrice`, `price`, `stock`, `unit`, `image`, `isActive`, `categoryId`, `createdAt`, `updatedAt`) VALUES
(1, 'Tomatoes', 'टोमॅटो', 'Fresh red farm tomatoes', 'ताजे लाल शेतातले टोमॅटो', 18.00, 25.00, 80, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861176/Fresh_tomatoes_gzxrkk.png', 1, 1, NOW(), NOW()),
(2, 'Onions', 'कांदे', 'Premium quality white onions', 'उत्कृष्ट दर्जाचे पांढरे कांदे', 22.00, 30.00, 120, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860946/Onions_newzui.png', 1, 1, NOW(), NOW()),
(3, 'Potatoes', 'बटाटे', 'Farm-fresh potatoes', 'शेतातले ताजे बटाटे', 20.00, 28.00, 100, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860996/Potatoes_sekdcl.png', 1, 1, NOW(), NOW()),
(4, 'Spinach', 'पालक', 'Tender green spinach leaves', 'कोवळी हिरवी पालकाची पाने', 10.00, 15.00, 60, '250g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861049/Fresh_spinach_qt5kbd.png', 1, 1, NOW(), NOW()),
(5, 'Bananas', 'केळी', 'Ripe yellow bananas, pack of 6', 'पिवळी पिकलेली केळी, ६ चा पॅक', 28.00, 40.00, 90, 'Pack', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860205/Ripe_bananas_hgooij.png', 1, 1, NOW(), NOW()),
(6, 'Apples', 'सफरचंद', 'Fresh red Shimla apples', 'शिमला ताजी लाल सफरचंद', 75.00, 99.00, 50, '4 pcs', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860187/Red_apples_tvfshj.png', 1, 1, NOW(), NOW()),
(7, 'Carrots', 'गाजर', 'Crunchy fresh orange carrots', 'कुरकुरीत ताजे नारंगी गाजर', 25.00, 35.00, 70, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860280/carrots_jxv42f.png', 1, 1, NOW(), NOW()),
(8, 'Cucumber', 'काकडी', 'Cool and crisp cucumbers', 'ताजी आणि कुरकुरीत काकडी', 14.00, 20.00, 55, '2 pcs', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860395/cucumbers_sblp1x.png', 1, 1, NOW(), NOW()),
(9, 'Full Cream Milk', 'फुल क्रीम दूध', 'Fresh pasteurised full cream milk', 'ताजे पाश्चराइज्ड फुल क्रीम दूध', 48.00, 60.00, 100, '1L', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860886/Milk_hgdsws.png', 1, 2, NOW(), NOW()),
(10, 'Amul Butter', 'अमुल लोणी', 'Salted butter from Amul', 'अमुल सॉल्टेड लोणी', 45.00, 55.00, 80, '100g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860172/Amul_butter_pfsuzo.png', 1, 2, NOW(), NOW()),
(11, 'Paneer', 'पनीर', 'Fresh soft cottage cheese', 'ताजे मऊ पनीर', 70.00, 90.00, 45, '200g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860958/Fresh_paneer_gdeny4.png', 1, 2, NOW(), NOW()),
(12, 'Curd / Dahi', 'दही', 'Thick set creamy curd', 'घट्ट आणि मलईदार दही', 32.00, 45.00, 60, '400g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860851/Fresh_curd_mmbt2v.png', 1, 2, NOW(), NOW()),
(13, 'Eggs', 'अंडी', 'Farm-fresh eggs, tray of 12', 'फार्म-ताजी अंडी, १२ चा ट्रे', 60.00, 80.00, 70, 'Tray', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860859/fresh_eggs_fh3y3a.png', 1, 2, NOW(), NOW()),
(14, 'Cheese Slices', 'चीज स्लाइसेस', 'Processed cheese slices, pack of 10', 'प्रोसेस्ड चीज स्लाइसेस, १० चा पॅक', 78.00, 99.00, 40, 'Pack', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860239/Amul_cheese_slices_sryfne.png', 1, 2, NOW(), NOW()),
(15, 'Basmati Rice', 'बासमती तांदूळ', 'Long grain premium basmati rice', 'लांब दाण्याचा प्रीमियम बासमती तांदूळ', 95.00, 120.00, 60, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860218/Basmati_rice_2_vsij4y.png', 1, 3, NOW(), NOW()),
(16, 'Wheat Flour (Atta)', 'गव्हाचे पीठ (आटा)', 'Whole wheat chakki fresh atta', 'गव्हाचे चक्की फ्रेश पीठ', 50.00, 65.00, 80, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861212/wheat_flour_2_oyovox.png', 1, 3, NOW(), NOW()),
(17, 'Toor Dal', 'तूर डाळ', 'Yellow pigeon peas dal', 'पिवळी तूर डाळ', 72.00, 90.00, 50, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861188/toor_dal_2_q0htqo.png', 1, 3, NOW(), NOW()),
(18, 'Chana Dal', 'चना डाळ', 'Split chickpea lentils', 'हरभरा डाळ', 68.00, 85.00, 50, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860230/chana_dal_mlgxm7.png', 1, 3, NOW(), NOW()),
(19, 'Rolled Oats', 'रोल्ड ओट्स', 'Quick cook breakfast oats', 'झटपट तयार होणारे ओट्स', 58.00, 75.00, 40, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861029/Rolled_oats_gitecf.png', 1, 3, NOW(), NOW()),
(20, 'Poha', 'पोहे', 'Flattened rice flakes for breakfast', 'न्याहारीसाठी सडलेले पोहे', 32.00, 45.00, 55, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860987/Poha_qx2cs9.png', 1, 3, NOW(), NOW()),
(21, 'Lays Classic', 'लेज क्लासिक', 'Classic salted potato chips', 'क्लासिक सॉल्टेड बटाटा चिप्स', 15.00, 20.00, 100, '73g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860920/Lay_s_Classic_chips_hpad2i.png', 1, 4, NOW(), NOW()),
(22, 'Bournvita', 'बॉर्नव्हिटा', 'Chocolate malt health drink powder', 'चॉकलेट माल्ट हेल्थ ड्रिंक पावडर', 160.00, 199.00, 30, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860271/Bournvita_tka2qw.png', 1, 4, NOW(), NOW()),
(23, 'Tata Tea Gold', 'टाटा टी गोल्ड', 'Premium blend black tea leaves', 'प्रीमियम ब्लेंड काळा चहा', 100.00, 130.00, 50, '250g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861239/whole_wheat_bread_sdos3n.png', 1, 4, NOW(), NOW()),
(24, 'Tropicana Orange', 'ट्रॉपिकाना ऑरेंज', 'Fresh orange juice, no added sugar', 'ताजा संत्र्याचा रस', 60.00, 80.00, 60, '1L', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860791/orange_juice_m1bwcq.png', 1, 4, NOW(), NOW()),
(25, 'Good Day Biscuits', 'गुड डे बिस्किटे', 'Butter cookies pack', 'बटर कुकीज पॅक', 22.00, 30.00, 90, '250g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860902/Good_Day_iruya8.png', 1, 4, NOW(), NOW()),
(26, 'Sprite', 'स्प्राइट', 'Chilled lime soda carbonated drink', 'थंड लिंबू सोडा पेय', 30.00, 40.00, 80, '750ml', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861133/Tata_Tea_Gold_rnskfj.png', 1, 4, NOW(), NOW()),
(27, 'Chicken Breast', 'चिकन ब्रेस्ट', 'Fresh boneless skinless chicken breast', 'ताजे बोनलेस चिकन ब्रेस्ट', 170.00, 220.00, 30, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860348/lean_chicken_xg8rqy.png', 1, 5, NOW(), NOW()),
(28, 'Rohu Fish', 'रोहू मासा', 'Fresh Rohu fish, cleaned and cut', 'ताजा स्वच्छ केलेला रोहू मासा', 140.00, 180.00, 20, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860658/rohu_fish_boprsd.png', 1, 5, NOW(), NOW()),
(29, 'Prawns', 'कोळंबी', 'Fresh medium-sized prawns, deveined', 'ताजी मध्यम कोळंबी', 190.00, 250.00, 15, '250g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861006/Fresh_prawns_gbqxha.png', 1, 5, NOW(), NOW()),
(30, 'Mutton (Goat)', 'मटण (बोकड)', 'Fresh tender goat mutton pieces', 'ताजे बोकडाचे मटण', 300.00, 380.00, 10, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860938/nutritious_mutton_s7jc6c.png', 1, 5, NOW(), NOW()),
(31, 'Salmon Fillet', 'सॅल्मन फिले', 'Fresh Atlantic salmon fillet', 'ताजे अटलांटिक सॅल्मन', 270.00, 350.00, 8, '250g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861039/premium_salmon_fillet_me63cl.png', 1, 5, NOW(), NOW()),
(32, 'Whole Wheat Bread', 'होल व्हीट ब्रेड', 'Soft whole wheat sandwich bread loaf', 'मऊ गव्हाचा सँडविच ब्रेड', 32.00, 45.00, 40, '400g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861239/whole_wheat_bread_sdos3n.png', 1, 6, NOW(), NOW()),
(33, 'Croissants', 'क्रॉसंट्स', 'Buttery flaky croissants, pack of 4', 'बटरी आणि मऊ क्रॉसंट्स, ४ चा पॅक', 60.00, 80.00, 25, 'Pack', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860843/warm_croissants_pr0qfw.png', 1, 6, NOW(), NOW()),
(34, 'Burger Buns', 'बर्गर बन्स', 'Soft sesame burger buns, pack of 6', 'मऊ तीळ बर्गर बन्स, ६ चा पॅक', 40.00, 55.00, 30, 'Pack', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860197/soft_burger_buns_sbmojz.png', 1, 6, NOW(), NOW()),
(35, 'Pav (Dinner Rolls)', 'पाव', 'Soft ladi pav rolls, pack of 12', 'मऊ लडी पाव, १२ चा पॅक', 25.00, 35.00, 50, 'Pack', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860976/baked_soft_pav_rolls_rnstk5.png', 1, 6, NOW(), NOW()),
(36, 'Chocolate Cake', 'चॉकलेट केक', 'Moist chocolate sponge cake slice', 'चॉकलेट स्पंज केक स्लाइझ', 50.00, 70.00, 20, '1 pc', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860364/chocolate_cake_wjka1m.png', 1, 6, NOW(), NOW()),
(37, 'Turmeric Powder', 'हळद पावडर', 'Pure haldi powder for cooking', 'शुद्ध स्वयंपाकाची हळद पावडर', 40.00, 55.00, 60, '100g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861198/Turmeric_powder_amzsyl.png', 1, 7, NOW(), NOW()),
(38, 'Red Chilli Powder', 'लाल तिखट पावडर', 'Spicy Kashmiri lal mirch powder', 'काश्मिरी लाल तिखट पावडर', 48.00, 65.00, 55, '100g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861020/Red_chili_powder_eexayv.png', 1, 7, NOW(), NOW()),
(39, 'Garam Masala', 'गरम मसाला', 'Aromatic whole spice blend powder', 'सुवासिक गरम मसाला पावडर', 55.00, 75.00, 45, '50g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860894/Garam_masala_l6i00h.png', 1, 7, NOW(), NOW()),
(40, 'Tomato Ketchup', 'टोमॅटो केचप', 'Heinz classic tomato ketchup', 'क्लासिक टोमॅटो केचप', 72.00, 95.00, 40, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861156/tomato_ketchup_j59s7a.png', 1, 7, NOW(), NOW()),
(41, 'Mustard Oil', 'मोहरीचे तेल', 'Cold-pressed pure mustard cooking oil', 'शुद्ध मोहरीचे स्वयंपाकाचे तेल', 92.00, 120.00, 35, '1L', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860928/mustard_oil_h0wo09.png', 1, 7, NOW(), NOW()),
(42, 'Coconut Oil', 'खोबरेल तेल', 'Pure organic virgin coconut oil', 'शुद्ध खोबरेल तेल', 115.00, 150.00, 4, '500ml', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860753/coconut_oil_td8kwv.png', 1, 7, NOW(), NOW()),
(43, 'Frozen Peas', 'फ्रोझन मटार', 'Sweet green peas, quick frozen', 'गोड हिरवे फ्रोझन मटार', 48.00, 65.00, 40, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860877/frozen_peas_hruvln.png', 1, 8, NOW(), NOW()),
(44, 'Ice Cream Vanilla', 'व्हॅनिला आईस्क्रीम', 'Creamy vanilla ice cream tub', 'मलईदार व्हॅनिला आईस्क्रीम', 90.00, 120.00, 25, '500ml', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860911/vanilla_ice_cream_b7bl6e.png', 1, 8, NOW(), NOW()),
(45, 'Frozen Corn', 'फ्रोझन मका', 'Golden sweet corn kernels, frozen', 'गोड फ्रोझन मक्याचे दाणे', 50.00, 70.00, 35, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860868/frozen_corn_jocrzx.png', 1, 8, NOW(), NOW()),
(46, 'Frozen Paratha', 'फ्रोझन पराठा', 'Ready-to-cook wheat parathas, pack of 5', 'तयार पराठे, ५ चा पॅक', 68.00, 90.00, 30, 'Pack', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860579/Freshly_frozen_vtq8rm.png', 1, 8, NOW(), NOW()),
(47, 'Chicken Nuggets', 'चिकन नगेट्स', 'Crispy breaded chicken nuggets, 15 pcs', 'कुरकुरीत चिकन नगेट्स, १५ पीसेस', 135.00, 180.00, 3, 'Pack', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860609/Chicken_Nuggets_sqbur2.png', 1, 8, NOW(), NOW()),
(48, 'Hapus Mango', 'हापूस आंबा', 'Fresh and sweet', 'ताजा आणि गोड हापूस आंबा', 230.00, 300.00, 5, '12 pcs', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783875244/Hapus_mango_tcwsas.jpg', 1, 1, NOW(), NOW());

-- ============================================================
-- Verification Queries
-- ============================================================
-- SELECT id, name_en, name_mr FROM categories ORDER BY id;
-- SELECT id, name_en, name_mr, purchasePrice, price, stock, unit, categoryId FROM products ORDER BY categoryId, id;
-- SELECT COUNT(*) AS total_products FROM products;
