-- ============================================================
-- Dake Kirana Store (डाके किराणा स्टोअर्स) — Seed Data
-- Database: grocery_store
-- Includes: authentic Kirana categories + products with English & Marathi titles
-- ============================================================

USE grocery_store;

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
SET FOREIGN_KEY_CHECKS = 1;

-- Create categories table
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

-- Create products table
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
-- CATEGORIES
-- ============================================================

INSERT INTO `categories` (`id`, `name_en`, `name_mr`, `description`, `image`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Grains, Atta & Pulses',     'धान्य, आटा व डाळी',         'Wheat flour, rice, pulses, poha, rawa & cereals',  'https://res.cloudinary.com/n0he2dk8/image/upload/v1783859962/grains_and_cereals_ci6pob.png', 1, NOW(), NOW()),
(2, 'Edible Oils & Ghee',       'खाद्यतेल आणि तूप',         'Groundnut oil, sunflower oil, mustard oil & pure ghee', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860928/mustard_oil_h0wo09.png', 1, NOW(), NOW()),
(3, 'Spices, Masala & Salt',    'मसाले, चटणी आणि मीठ',      'Kanda lasun masala, turmeric, chilli powder, sugar & salt', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783859851/Spice_b41rcj.png', 1, NOW(), NOW()),
(4, 'Tea, Sugar & Beverages',   'चहा, साखर आणि पेये',       'Society tea, Red Label, coffee, Bournvita & drinks', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861239/whole_wheat_bread_sdos3n.png', 1, NOW(), NOW()),
(5, 'Dairy & Breakfast',        'दूध आणि नाश्ता',            'Fresh milk, butter, paneer, curd & breakfast items', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783869620/Dairy_and_eggs_johjhr.png', 1, NOW(), NOW()),
(6, 'Snacks & Biscuits',        'बिस्किटे आणि स्नॅक्स',       'Parle-G, Good Day, chips, namkeen & biscuits', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783859903/Snacks_and_beverages_p7tsla.png', 1, NOW(), NOW()),
(7, 'Soaps & Detergents',       'साबण आणि स्वच्छता',        'Washing powder, soaps, toothpaste & dishwash', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861198/Turmeric_powder_amzsyl.png', 1, NOW(), NOW()),
(8, 'Fruits & Vegetables',      'फळे आणि भाज्या',           'Farm fresh daily onions, potatoes, tomatoes & fruits', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860009/Fruits_and_vegetables_iy4uw6.png', 1, NOW(), NOW());


-- ============================================================
-- PRODUCTS (Dake Kirana Catalog)
-- ============================================================

INSERT INTO `products` (`id`, `name_en`, `name_mr`, `description_en`, `description_mr`, `purchasePrice`, `price`, `stock`, `unit`, `image`, `isActive`, `categoryId`, `createdAt`, `updatedAt`) VALUES

-- Category 1: Grains, Atta & Pulses
(1, 'Aashirvaad Chakki Fresh Atta 5kg', 'आशिर्वाद चक्की फ्रेश आटा ५ किलो', '100% pure whole wheat chakki fresh atta', '१००% शुद्ध गव्हाचे चक्की फ्रेश पीठ', 205.00, 240.00, 45, '5kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861212/wheat_flour_2_oyovox.png', 1, 1, NOW(), NOW()),
(2, 'Lokwan Wheat (Selected) 10kg', 'लोकवण गहू (निवडक) १० किलो', 'Premium cleaned Lokwan wheat grains', 'उत्कृष्ट दर्जाचा स्वच्छ केलेला लोकवण गहू', 380.00, 440.00, 50, '10kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861212/wheat_flour_2_oyovox.png', 1, 1, NOW(), NOW()),
(3, 'Indrayani Rice 5kg', 'इंद्रायणी तांदूळ (सुवासिक) ५ किलो', 'Fragrant aromatic Indrayani rice', 'अत्यंत सुवासिक आणि मऊ शिजणारा इंद्रायणी तांदूळ', 310.00, 375.00, 30, '5kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860218/Basmati_rice_2_vsij4y.png', 1, 1, NOW(), NOW()),
(4, 'Premium Basmati Rice 1kg', 'प्रीमियम बासमती तांदूळ १ किलो', 'Long grain aged Basmati rice', 'लांब दाण्याचा सुवासिक बासमती तांदूळ', 95.00, 125.00, 60, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860218/Basmati_rice_2_vsij4y.png', 1, 1, NOW(), NOW()),
(5, 'Unpolished Toor Dal 1kg', 'पिवळी तूर डाळ (लहरी) १ किलो', 'Clean unpolished yellow pigeon peas dal', 'स्वच्छ आणि पौष्टिक पिवळी तूर डाळ', 138.00, 165.00, 50, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861188/toor_dal_2_q0htqo.png', 1, 1, NOW(), NOW()),
(6, 'Chana Dal 1kg', 'हरभरा डाळ १ किलो', 'Split bengal gram chana dal', 'उत्कृष्ट दर्जाची स्वच्छ हरभरा डाळ', 76.00, 92.00, 55, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860230/chana_dal_mlgxm7.png', 1, 1, NOW(), NOW()),
(7, 'Moong Dal 500g', 'पिवळी मूग डाळ ५०० ग्रॅम', 'Yellow split moong dal', 'सहज पचणारी पिवळी मूग डाळ', 50.00, 65.00, 40, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861188/toor_dal_2_q0htqo.png', 1, 1, NOW(), NOW()),
(8, 'Thick Poha 1kg', 'जाड पोहे (न्याहारीसाठी) १ किलो', 'Fresh flaked rice for Maharashtrian Poha', 'उत्कृष्ट दर्जाचे पांढरे जाड पोहे', 42.00, 56.00, 70, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860987/Poha_qx2cs9.png', 1, 1, NOW(), NOW()),
(9, 'Fine Rawa / Sooji 500g', 'बारीक रवा ५०० ग्रॅम', 'Fresh semolina rawa for upma and sweets', 'उपमा व शिऱ्यासाठी बारीक रवा', 24.00, 32.00, 50, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861029/Rolled_oats_gitecf.png', 1, 1, NOW(), NOW()),

-- Category 2: Edible Oils & Ghee
(10, 'Gemini Groundnut Oil 1L Pouch', 'जेमिनी शुद्ध शेंगदाणा तेल १ लि', 'Pure filtered groundnut cooking oil', 'अत्यंत शुद्ध आणि आरोग्यदायी शेंगदाणा तेल', 146.00, 172.00, 80, '1L', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860928/mustard_oil_h0wo09.png', 1, 2, NOW(), NOW()),
(11, 'Gemini Groundnut Oil 5L Jar', 'जेमिनी शेंगदाणा तेल ५ लि जार', '5 Litre bulk jar of Gemini Groundnut Oil', '५ लिटरचा शेंगदाणा तेल फॅमिली जार', 740.00, 850.00, 25, '5L', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860928/mustard_oil_h0wo09.png', 1, 2, NOW(), NOW()),
(12, 'Fortune Sunlite Sunflower Oil 1L', 'फॉर्च्यून सूर्यफूल तेल १ लि', 'Refined sunflower cooking oil', 'हल्के आणि पचनास सोपे सूर्यफूल तेल', 124.00, 148.00, 60, '1L', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860928/mustard_oil_h0wo09.png', 1, 2, NOW(), NOW()),
(13, 'Gowardhan Pure Cow Ghee 500ml', 'गोवर्धन शुद्ध गाईचे तूप ५०० मिली', 'Pure aromatic cow ghee tin/pack', 'स्वादिष्ट आणि सुवासिक शुद्ध गाईचे तूप', 310.00, 365.00, 35, '500ml', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860172/Amul_butter_pfsuzo.png', 1, 2, NOW(), NOW()),
(14, 'Amul Pure Ghee 1L Tin', 'अमुल शुद्ध तूप १ लिटर टिन', 'Pure milk fat ghee from Amul', 'अमुलचे शुद्ध दाणेदार तूप', 610.00, 690.00, 20, '1L', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860172/Amul_butter_pfsuzo.png', 1, 2, NOW(), NOW()),

-- Category 3: Spices, Masala & Salt
(15, 'Bedekar Kanda Lasun Masala 500g', 'बेडेकर कांदा-लसूण मसाला ५०० ग्रॅम', 'Traditional Maharashtrian spicy masala blend', 'खमंग आणि झणझणीत कांदा-लसूण मसाला', 110.00, 140.00, 40, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860894/Garam_masala_l6i00h.png', 1, 3, NOW(), NOW()),
(16, 'Pravin Kanda Lasun Masala 250g', 'प्रवीण कांदा-लसूण मसाला २५० ग्रॅम', 'Spicy aromatic Kolhapuri style masala', 'कोल्हापुरी चवीचा खास मसाला', 58.00, 75.00, 50, '250g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860894/Garam_masala_l6i00h.png', 1, 3, NOW(), NOW()),
(17, 'Everest Turmeric Powder 200g', 'एव्हरेस्ट हळद पावडर २०० ग्रॅम', 'Pure natural turmeric haldi powder', 'शुद्ध आणि नैसर्गिक हळद पावडर', 38.00, 50.00, 65, '200g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861198/Turmeric_powder_amzsyl.png', 1, 3, NOW(), NOW()),
(18, 'Kashmiri Red Chilli Powder 200g', 'काश्मिरी लाल तिखट पावडर २०० ग्रॅम', 'Rich color and mild spice chilli powder', 'छान रंग आणि मध्यम तिखट लाल मिरची पावडर', 52.00, 72.00, 60, '200g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861020/Red_chili_powder_eexayv.png', 1, 3, NOW(), NOW()),
(19, 'Tata Salt Iodized 1kg', 'टाटा आयोडीन युक्त मीठ १ किलो', 'Vacuum evaporated pure iodized salt', 'शुद्ध आणि सुरक्षित टाटा मीठ', 22.00, 28.00, 120, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861198/Turmeric_powder_amzsyl.png', 1, 3, NOW(), NOW()),
(20, 'Kolhapuri Organic Jaggery (Gul) 1kg', 'कोल्हापुरी सेंद्रिय गूळ १ किलो', 'Natural unrefined chemical-free jaggery', 'रसायनमुक्त सेंद्रिय पिवळा गूळ', 54.00, 70.00, 50, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860894/Garam_masala_l6i00h.png', 1, 3, NOW(), NOW()),

-- Category 4: Tea, Sugar & Beverages
(21, 'Society Tea Leaf 500g', 'सोसायटी प्रीमियम चहा ५०० ग्रॅम', 'Strong aromatic blend tea leaves', 'अत्यंत कडक आणि सुवासिक चहा', 268.00, 310.00, 45, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861239/whole_wheat_bread_sdos3n.png', 1, 4, NOW(), NOW()),
(22, 'Red Label Natural Care Tea 250g', 'रेड लेबल चहा २५० ग्रॅम', 'Tea infused with 5 Ayurvedic ingredients', 'आयुर्वेदिक घटकांनी युक्त चहा', 125.00, 150.00, 50, '250g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861239/whole_wheat_bread_sdos3n.png', 1, 4, NOW(), NOW()),
(23, 'Pure White Sugar 1kg', 'शुद्ध पांढरी साखर १ किलो', 'Clean medium crystal sugar', 'स्वच्छ आणि मोठी पांढरी साखर', 38.00, 44.00, 150, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861029/Rolled_oats_gitecf.png', 1, 4, NOW(), NOW()),
(24, 'Pure White Sugar 5kg Bag', 'साखर ५ किलो बॅग', '5kg bulk family packing sugar', '५ किलो कौटुंबिक साखरेची बॅग', 185.00, 215.00, 40, '5kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861029/Rolled_oats_gitecf.png', 1, 4, NOW(), NOW()),
(25, 'Bournvita Health Drink 500g', 'बॉर्नव्हिटा ५०० ग्रॅम', 'Chocolate malt health drink powder', 'चॉकलेट माल्ट न्यूट्रिशन पावडर', 165.00, 199.00, 30, '500g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860271/Bournvita_tka2qw.png', 1, 4, NOW(), NOW()),

-- Category 5: Dairy & Breakfast
(26, 'Full Cream Fresh Milk 1L', 'ताजे फुल क्रीम दूध १ लिटर', 'Pasteurised full cream fresh milk', 'ताजे पाश्चराइज्ड फुल क्रीम दूध', 48.00, 60.00, 100, '1L', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860886/Milk_hgdsws.png', 1, 5, NOW(), NOW()),
(27, 'Amul Butter 100g', 'अमुल लोणी १०० ग्रॅम', 'Salted butter from Amul', 'अमुल सॉल्टेड बटर', 46.00, 56.00, 80, '100g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860172/Amul_butter_pfsuzo.png', 1, 5, NOW(), NOW()),
(28, 'Fresh Soft Paneer 200g', 'ताजे मऊ पनीर २०० ग्रॅम', 'Fresh cottage cheese for cooking', 'ताजे आणि मऊ मलाई पनीर', 70.00, 90.00, 45, '200g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860958/Fresh_paneer_gdeny4.png', 1, 5, NOW(), NOW()),
(29, 'Thick Set Curd / Dahi 400g', 'घट्ट आणि मलईदार दही ४०० ग्रॅम', 'Thick set creamy curd', 'मऊ आणि घट्ट मलईदार दही', 32.00, 45.00, 60, '400g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860851/Fresh_curd_mmbt2v.png', 1, 5, NOW(), NOW()),

-- Category 6: Snacks & Biscuits
(30, 'Parle-G Gold Biscuits Pack', 'पारले-जी गोल्ड बिस्किटे पॅक', 'Classic glucose biscuits pack', 'लोकप्रिय पारले-जी बिस्किटे', 24.00, 30.00, 100, 'Pack', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860902/Good_Day_iruya8.png', 1, 6, NOW(), NOW()),
(31, 'Britannia Good Day Butter 200g', 'गुड डे बटर कुकीज २०० ग्रॅम', 'Rich butter cookies', 'बटर समृद्ध स्वादिष्ट कुकीज', 25.00, 35.00, 90, '200g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860902/Good_Day_iruya8.png', 1, 6, NOW(), NOW()),
(32, 'Lays Classic Potato Chips', 'लेज बटाटा चिप्स ७३ ग्रॅम', 'Crispy salted potato chips', 'कुरकुरीत बटाटा चिप्स', 15.00, 20.00, 100, '73g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860920/Lay_s_Classic_chips_hpad2i.png', 1, 6, NOW(), NOW()),

-- Category 7: Soaps & Detergents
(33, 'Surf Excel Easy Wash 1kg', 'सर्फ एक्सेल पावडर १ किलो', 'Detergent powder for easy stain removal', 'डाग दूर करणारी सर्फ एक्सेल पावडर', 122.00, 145.00, 50, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861198/Turmeric_powder_amzsyl.png', 1, 7, NOW(), NOW()),
(34, 'Rin Detergent Bar (Pack of 4)', 'रिन डिटर्जंट बार (४ चा पॅक)', 'Detergent bar for bright clean clothes', 'कपड्यांच्या स्वच्छतेसाठी रिन साबण', 38.00, 48.00, 60, 'Pack', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861198/Turmeric_powder_amzsyl.png', 1, 7, NOW(), NOW()),
(35, 'Lux Rose Beauty Soap (Pack of 3)', 'लक्स गुलाब साबण (३ चा पॅक)', 'Fragrant beauty bath soap pack', 'गुलाबाचा सुवासिक लक्स साबण', 85.00, 108.00, 40, 'Pack', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861198/Turmeric_powder_amzsyl.png', 1, 7, NOW(), NOW()),
(36, 'Colgate Strong Teeth 200g', 'कोलगेट टूथपेस्ट २०० ग्रॅम', 'Calcium dental care toothpaste', 'दातांच्या मजबुतीसाठी कोलगेट टूथपेस्ट', 88.00, 110.00, 55, '200g', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861198/Turmeric_powder_amzsyl.png', 1, 7, NOW(), NOW()),

-- Category 8: Fruits & Vegetables
(37, 'Farm Fresh Red Tomatoes 1kg', 'ताजे लाल शेतातले टोमॅटो १ किलो', 'Fresh red farm tomatoes', 'ताजे लाल शेतातले टोमॅटो', 22.00, 30.00, 80, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783861176/Fresh_tomatoes_gzxrkk.png', 1, 8, NOW(), NOW()),
(38, 'Quality Red Onions 1kg', 'उत्कृष्ट दर्जाचे कांदे १ किलो', 'Clean dry quality red onions', 'निवडक पांढरे व लाल कांदे', 24.00, 32.00, 120, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860946/Onions_newzui.png', 1, 8, NOW(), NOW()),
(39, 'Farm Fresh Potatoes 1kg', 'शेतातले ताजे बटाटे १ किलो', 'Fresh yellow farm potatoes', 'शेतातले ताजे बटाटे', 20.00, 28.00, 100, '1kg', 'https://res.cloudinary.com/n0he2dk8/image/upload/v1783860996/Potatoes_sekdcl.png', 1, 8, NOW(), NOW());
