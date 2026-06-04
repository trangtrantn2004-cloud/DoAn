-- Nero Coffee - Database Dump
-- Xuất bản ngày: 4/27/2026, 9:58:36 AM

SET FOREIGN_KEY_CHECKS = 0;
CREATE DATABASE IF NOT EXISTS `coffee_shop`;
USE `coffee_shop`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` VALUES 
(1, 'Admin Manager', 'admin@coffee.com', '$2b$10$tk6zCjLbcvaaTls4UAYsHuFmzJMqVSmRI6ydhu67pqQMlTfXMZgHm', 'admin', '2026-03-23 04:34:23'),
(2, 'Nguyễn Văn An', 'an@gmail.com', '$2b$10$tk6zCjLbcvaaTls4UAYsHuqpDkHHYX66Vsn/bG1FDhj6iK6WiwvG6', 'user', '2026-03-23 04:34:23'),
(3, 'Trần Thị Bình', 'binh@gmail.com', '$2b$10$tk6zCjLbcvaaTls4UAYsHuqpDkHHYX66Vsn/bG1FDhj6iK6WiwvG6', 'user', '2026-03-23 04:34:23'),
(4, 'Lê Minh Châu', 'chau@gmail.com', '$2b$10$tk6zCjLbcvaaTls4UAYsHuqpDkHHYX66Vsn/bG1FDhj6iK6WiwvG6', 'user', '2026-03-23 04:34:23'),
(5, 'Phạm Đức Dũng', 'dung@gmail.com', '$2b$10$tk6zCjLbcvaaTls4UAYsHuqpDkHHYX66Vsn/bG1FDhj6iK6WiwvG6', 'user', '2026-03-23 04:34:23'),
(6, 'Test User', 'test@gmail.com', '$2b$10$wH.Eiv347ObjcUcUyS0DueqELXw9voeOnneqkLgotS/gd5mVj795S', 'user', '2026-03-23 04:44:57'),
(7, 'Ducvit', 'Ducvitytb98@gmail.com', '$2b$10$8rfYWu2hi6oYuWNi5G62/.KKcXWs9yJCv3UfQXmbyjn4D3hMJAfce', 'user', '2026-03-23 07:36:09');

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` VALUES 
(1, 'Cà Phê', 'Các loại cà phê truyền thống và hiện đại', '2026-03-23 04:34:23'),
(2, 'Trà', 'Các loại trà thơm ngon, thanh mát', '2026-03-23 04:34:23'),
(3, 'Sinh Tố & Nước Ép', 'Sinh tố trái cây tươi và nước ép tự nhiên', '2026-03-23 04:34:23'),
(4, 'Bánh Ngọt', 'Bánh ngọt, bánh mì thơm ngon ăn kèm', '2026-03-23 04:34:23'),
(5, 'Đá Xay', 'Các loại đá xay mát lạnh, sảng khoái', '2026-03-23 04:34:23'),
(6, 'Tra Trai Cay', 'Tra giai nhiet', '2026-03-23 05:36:24'),
(7, 'Hoa quả', 'Hoa quả truyền thống', '2026-03-23 07:53:35');

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` VALUES 
(1, 1, 'Cà Phê Sữa Đá', 'Cà phê phin truyền thống pha với sữa đặc, thêm đá mát lạnh. Hương vị đậm đà, ngọt ngào.', '40000.00', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 1, '2026-03-23 04:34:23'),
(2, 1, 'Cà Phê Đen Đá', 'Cà phê phin nguyên chất, đậm đà, không pha sữa. Dành cho người yêu vị đắng truyền thống.', '37000.00', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400', 1, '2026-03-23 04:34:23'),
(3, 1, 'Cà Phê Muối', 'Vị cà phê đậm đà kết hợp với kem muối béo ngậy, tạo nên hương vị độc đáo khó quên.', '19000.00', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400', 1, '2026-03-23 04:34:23'),
(4, 1, 'Cappuccino', 'Espresso kết hợp sữa tươi đánh bông mịn, phủ lớp bọt sữa mềm mại thơm ngon.', '46000.00', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 1, '2026-03-23 04:34:23'),
(5, 1, 'Latte', 'Espresso hòa quyện cùng sữa tươi nóng, vị nhẹ nhàng và thanh tao.', '26000.00', 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', 0, '2026-03-23 04:34:23'),
(6, 1, 'Americano', 'Espresso pha loãng với nước nóng, giữ nguyên hương vị cà phê thuần túy.', '54000.00', 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400', 0, '2026-03-23 04:34:23'),
(7, 1, 'Mocha', 'Sự kết hợp hoàn hảo giữa espresso, socola và sữa tươi. Ngọt ngào, đậm đà.', '39000.00', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', 0, '2026-03-23 04:34:23'),
(8, 1, 'Cà Phê Trứng', 'Đặc sản Hà Nội - cà phê phin phủ lớp kem trứng béo ngậy, thơm lừng.', '53000.00', 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=400', 1, '2026-03-23 04:34:23'),
(9, 2, 'Trà Đào Cam Sả', 'Trà đào thơm ngọt kết hợp cam tươi và sả, mang đến hương vị sảng khoái.', '45000.00', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 1, '2026-03-23 04:34:23'),
(10, 2, 'Trà Sen Vàng', 'Trà ướp hương sen thanh nhã, vị ngọt tự nhiên, thích hợp thưởng thức mỗi ngày.', '59000.00', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', 0, '2026-03-23 04:34:23'),
(11, 2, 'Trà Vải', 'Trà xanh kết hợp vải tươi, ngọt thanh và thơm mát, cực kỳ giải khát.', '24000.00', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', 1, '2026-03-23 04:34:23'),
(12, 2, 'Hồng Trà Sữa', 'Hồng trà đậm đà pha cùng sữa tươi, thêm trân châu dai giòn.', '34000.00', 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400', 0, '2026-03-23 04:34:23'),
(13, 2, 'Trà Matcha Latte', 'Bột matcha Nhật Bản hòa quyện cùng sữa tươi, vị thanh nhã đặc biệt.', '19000.00', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', 1, '2026-03-23 04:34:23'),
(14, 3, 'Sinh Tố Bơ', 'Bơ chín mịn xay cùng sữa đặc và đá, béo ngậy thơm ngon.', '46000.00', 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400', 1, '2026-03-23 04:34:23'),
(15, 3, 'Sinh Tố Xoài', 'Xoài chín vàng xay nhuyễn, vị ngọt tự nhiên tươi mát.', '49000.00', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', 0, '2026-03-23 04:34:23'),
(16, 3, 'Nước Ép Cam', 'Cam tươi vắt nguyên chất, giàu vitamin C, tốt cho sức khỏe.', '53000.00', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 0, '2026-03-23 04:34:23'),
(17, 3, 'Sinh Tố Dâu', 'Dâu tây tươi xay mịn cùng sữa chua, vị chua ngọt hài hòa.', '46000.00', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', 1, '2026-03-23 04:34:23'),
(18, 4, 'Bánh Croissant Bơ', 'Bánh sừng bò Pháp, vỏ giòn xốp, ruột mềm thơm bơ.', '35000.00', 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400', 1, '2026-03-23 04:34:23'),
(19, 4, 'Bánh Tiramisu', 'Bánh Tiramisu Ý truyền thống, lớp kem mascarpone mềm mịn kết hợp cà phê.', '50000.00', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 1, '2026-03-23 04:34:23'),
(20, 4, 'Bánh Mì Bơ Tỏi', 'Bánh mì nướng giòn phết bơ tỏi thơm lừng, ăn kèm cà phê tuyệt vời.', '73000.00', 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400', 0, '2026-03-23 04:34:23'),
(21, 4, 'Mousse Socola', 'Mousse socola Bỉ mềm mịn như lụa, vị đắng ngọt hài hòa.', '46000.00', 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=400', 0, '2026-03-23 04:34:23'),
(22, 5, 'Đá Xay Socola', 'Socola đá xay mát lạnh, phủ kem whip và sốt socola, ngọt ngào sảng khoái.', '47000.00', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', 1, '2026-03-23 04:34:23'),
(23, 5, 'Đá Xay Dâu', 'Dâu tây đá xay, vị chua nhẹ ngọt thanh, thêm kem tươi béo ngậy.', '47000.00', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400', 0, '2026-03-23 04:34:23'),
(24, 5, 'Đá Xay Matcha', 'Matcha Nhật Bản đá xay mát lạnh, vị trà xanh thanh tao kết hợp kem tươi.', '66000.00', 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400', 1, '2026-03-23 04:34:23'),
(25, 5, 'Đá Xay Caramel', 'Caramel đá xay thơm ngọt, phủ kem whip và sốt caramel vàng óng.', '49000.00', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 0, '2026-03-23 04:34:23'),
(27, 1, 'Bạc Xỉu', 'Hương vị cà phê nồng nàn hòa quyện cùng vị ngọt béo của sữa đặc.', '50000.00', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=400', 1, '2026-03-23 06:31:19'),
(28, 2, 'Sting Do', 'Sting Do', '20000.00', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPld4fu6hzIfAz7NMVQ-JiPrv4R0WXhh4jzQ&s', 0, '2026-03-23 07:28:30'),
(29, 7, 'Đĩa hoa quả ', 'Đĩa Hoa Quả', '35000.00', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvOBC9r4wUMY7pTYzV3iMzLvSHffTSP-r2QA&s', 1, '2026-03-23 07:54:48'),
(30, 2, 'Trà Xoài Ít Đường', 'Hương vị trà xoài thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '46000.00', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 0, '2026-04-27 02:53:07'),
(31, 2, 'Trà Matcha Latte Nhỏ', 'Hương vị trà matcha latte thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '47000.00', 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', 0, '2026-04-27 02:53:07'),
(32, 5, 'Đá Xay Caramel Ít Đường', 'Hương vị đá xay caramel thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '69000.00', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400', 0, '2026-04-27 02:53:07'),
(33, 3, 'Sinh Tố Mít Nhỏ', 'Hương vị sinh tố mít thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '61000.00', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400', 0, '2026-04-27 02:53:07'),
(34, 5, 'Đá Xay Dâu Cao Cấp', 'Hương vị đá xay dâu thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '56000.00', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', 0, '2026-04-27 02:53:07'),
(35, 1, 'Cà Phê Vanilla Nhỏ', 'Hương vị cà phê vanilla thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '24000.00', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', 0, '2026-04-27 02:53:07'),
(36, 3, 'Sinh Tố Dưa Hấu Nhỏ', 'Hương vị sinh tố dưa hấu thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '51000.00', 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400', 0, '2026-04-27 02:53:07'),
(37, 1, 'Cà Phê Caramel Đặc Biệt', 'Hương vị cà phê caramel thơm ngon, kết hợp cùng phong cách đặc biệt, mang lại trải nghiệm tuyệt vời cho bạn.', '92000.00', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400', 0, '2026-04-27 02:53:07'),
(38, 5, 'Đá Xay Cookie Thêm Kem', 'Hương vị đá xay cookie thơm ngon, kết hợp cùng phong cách thêm kem, mang lại trải nghiệm tuyệt vời cho bạn.', '59000.00', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', 0, '2026-04-27 02:53:07'),
(39, 1, 'Cà Phê Kem Cheese Nhỏ', 'Hương vị cà phê kem cheese thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '26000.00', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', 0, '2026-04-27 02:53:07'),
(40, 5, 'Đá Xay Cookie Ít Đường', 'Hương vị đá xay cookie thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '46000.00', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 0, '2026-04-27 02:53:07'),
(41, 1, 'Americano Lớn', 'Hương vị americano thơm ngon, kết hợp cùng phong cách lớn, mang lại trải nghiệm tuyệt vời cho bạn.', '20000.00', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 0, '2026-04-27 02:53:07'),
(42, 3, 'Sinh Tố Xoài Hiện Đại', 'Hương vị sinh tố xoài thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '44000.00', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 0, '2026-04-27 02:53:07'),
(43, 2, 'Trà Thiết Quan Âm Truyền Thống', 'Hương vị trà thiết quan âm thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '46000.00', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', 0, '2026-04-27 02:53:07'),
(44, 3, 'Sinh Tố Xoài Hiện Đại', 'Hương vị sinh tố xoài thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '53000.00', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', 0, '2026-04-27 02:53:07'),
(45, 2, 'Trà Gừng Thêm Kem', 'Hương vị trà gừng thơm ngon, kết hợp cùng phong cách thêm kem, mang lại trải nghiệm tuyệt vời cho bạn.', '38000.00', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', 0, '2026-04-27 02:53:07'),
(46, 3, 'Sinh Tố Thanh Long Truyền Thống', 'Hương vị sinh tố thanh long thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '39000.00', 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', 1, '2026-04-27 02:53:07'),
(47, 5, 'Đá Xay Việt Quất Kem Cheese Hiện Đại', 'Hương vị đá xay việt quất kem cheese thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '47000.00', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 0, '2026-04-27 02:53:07'),
(48, 1, 'Cà Phê Vanilla Truyền Thống', 'Hương vị cà phê vanilla thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '43000.00', 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400', 0, '2026-04-27 02:53:07'),
(49, 5, 'Đá Xay Sữa Dừa Ít Đường', 'Hương vị đá xay sữa dừa thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '52000.00', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400', 0, '2026-04-27 02:53:07'),
(50, 1, 'Cold Brew Không Đường', 'Hương vị cold brew thơm ngon, kết hợp cùng phong cách không đường, mang lại trải nghiệm tuyệt vời cho bạn.', '52000.00', 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400', 0, '2026-04-27 02:53:07'),
(51, 2, 'Hồng Trà Sữa Thêm Kem', 'Hương vị hồng trà sữa thơm ngon, kết hợp cùng phong cách thêm kem, mang lại trải nghiệm tuyệt vời cho bạn.', '32000.00', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', 0, '2026-04-27 02:53:07'),
(52, 3, 'Sinh Tố Dưa Hấu Cao Cấp', 'Hương vị sinh tố dưa hấu thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '69000.00', 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=400', 0, '2026-04-27 02:53:07'),
(53, 2, 'Trà Nhài Không Đường', 'Hương vị trà nhài thơm ngon, kết hợp cùng phong cách không đường, mang lại trải nghiệm tuyệt vời cho bạn.', '53000.00', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400', 0, '2026-04-27 02:53:07'),
(54, 3, 'Nước Ép Chanh Dây Lớn', 'Hương vị nước ép chanh dây thơm ngon, kết hợp cùng phong cách lớn, mang lại trải nghiệm tuyệt vời cho bạn.', '50000.00', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', 0, '2026-04-27 02:53:07'),
(55, 3, 'Sinh Tố Chuối Không Đường', 'Hương vị sinh tố chuối thơm ngon, kết hợp cùng phong cách không đường, mang lại trải nghiệm tuyệt vời cho bạn.', '41000.00', 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400', 0, '2026-04-27 02:53:07'),
(56, 3, 'Nước Ép Dâu Tây Nhỏ', 'Hương vị nước ép dâu tây thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '63000.00', 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400', 1, '2026-04-27 02:53:07'),
(57, 2, 'Trà Sâm Dứa Cao Cấp', 'Hương vị trà sâm dứa thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '83000.00', 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=400', 0, '2026-04-27 02:53:07'),
(58, 3, 'Sinh Tố Kiwi Truyền Thống', 'Hương vị sinh tố kiwi thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '34000.00', 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=400', 1, '2026-04-27 02:53:07'),
(59, 1, 'Macchiato Lớn', 'Hương vị macchiato thơm ngon, kết hợp cùng phong cách lớn, mang lại trải nghiệm tuyệt vời cho bạn.', '29000.00', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', 1, '2026-04-27 02:53:07'),
(60, 3, 'Sinh Tố Dâu Hiện Đại', 'Hương vị sinh tố dâu thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '39000.00', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400', 1, '2026-04-27 02:53:07'),
(61, 1, 'Cà Phê Caramel Cao Cấp', 'Hương vị cà phê caramel thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '73000.00', 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400', 1, '2026-04-27 02:53:07'),
(62, 1, 'Cà Phê Trứng Nhỏ', 'Hương vị cà phê trứng thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '17000.00', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 0, '2026-04-27 02:53:07'),
(63, 3, 'Nước Ép Cam Nhỏ', 'Hương vị nước ép cam thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '62000.00', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400', 0, '2026-04-27 02:53:07'),
(64, 1, 'Cà Phê Caramel Thêm Kem', 'Hương vị cà phê caramel thơm ngon, kết hợp cùng phong cách thêm kem, mang lại trải nghiệm tuyệt vời cho bạn.', '48000.00', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', 1, '2026-04-27 02:53:07'),
(65, 3, 'Nước Ép Chanh Dây Đặc Biệt', 'Hương vị nước ép chanh dây thơm ngon, kết hợp cùng phong cách đặc biệt, mang lại trải nghiệm tuyệt vời cho bạn.', '74000.00', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400', 0, '2026-04-27 02:53:07'),
(66, 1, 'Cà Phê Hạnh Nhân Nhỏ', 'Hương vị cà phê hạnh nhân thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '43000.00', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', 0, '2026-04-27 02:53:07'),
(67, 2, 'Trà Ổi Hồng Hiện Đại', 'Hương vị trà ổi hồng thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '60000.00', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', 1, '2026-04-27 02:53:07'),
(68, 3, 'Sinh Tố Thanh Long Thêm Kem', 'Hương vị sinh tố thanh long thơm ngon, kết hợp cùng phong cách thêm kem, mang lại trải nghiệm tuyệt vời cho bạn.', '56000.00', 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400', 0, '2026-04-27 02:53:07'),
(69, 2, 'Trà Chanh Đặc Biệt', 'Hương vị trà chanh thơm ngon, kết hợp cùng phong cách đặc biệt, mang lại trải nghiệm tuyệt vời cho bạn.', '45000.00', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 0, '2026-04-27 02:53:07'),
(70, 2, 'Trà Việt Quất Ít Đường', 'Hương vị trà việt quất thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '36000.00', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 0, '2026-04-27 02:53:07'),
(71, 2, 'Trà Atiso Vừa', 'Hương vị trà atiso thơm ngon, kết hợp cùng phong cách vừa, mang lại trải nghiệm tuyệt vời cho bạn.', '21000.00', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', 0, '2026-04-27 02:53:07'),
(72, 5, 'Đá Xay Việt Quất Vừa', 'Hương vị đá xay việt quất thơm ngon, kết hợp cùng phong cách vừa, mang lại trải nghiệm tuyệt vời cho bạn.', '54000.00', 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=400', 0, '2026-04-27 02:53:07'),
(73, 2, 'Trà Ổi Hồng Hiện Đại', 'Hương vị trà ổi hồng thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '33000.00', 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400', 0, '2026-04-27 02:53:07'),
(74, 3, 'Sinh Tố Dâu Thêm Kem', 'Hương vị sinh tố dâu thơm ngon, kết hợp cùng phong cách thêm kem, mang lại trải nghiệm tuyệt vời cho bạn.', '63000.00', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 0, '2026-04-27 02:53:07'),
(75, 3, 'Sinh Tố Xoài Không Đường', 'Hương vị sinh tố xoài thơm ngon, kết hợp cùng phong cách không đường, mang lại trải nghiệm tuyệt vời cho bạn.', '52000.00', 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', 0, '2026-04-27 02:53:07'),
(76, 5, 'Đá Xay Matcha Hiện Đại', 'Hương vị đá xay matcha thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '50000.00', 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400', 0, '2026-04-27 02:53:07'),
(77, 2, 'Trà Tắc Truyền Thống', 'Hương vị trà tắc thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '43000.00', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 0, '2026-04-27 02:53:07'),
(78, 1, 'Cà Phê Hạnh Nhân Truyền Thống', 'Hương vị cà phê hạnh nhân thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '22000.00', 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400', 0, '2026-04-27 02:53:07'),
(79, 2, 'Trà Nhài Không Đường', 'Hương vị trà nhài thơm ngon, kết hợp cùng phong cách không đường, mang lại trải nghiệm tuyệt vời cho bạn.', '33000.00', 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400', 1, '2026-04-27 02:53:07'),
(80, 5, 'Đá Xay Sữa Dừa Cao Cấp', 'Hương vị đá xay sữa dừa thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '98000.00', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400', 0, '2026-04-27 02:53:07'),
(81, 5, 'Đá Xay Sữa Dừa Nhỏ', 'Hương vị đá xay sữa dừa thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '49000.00', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', 0, '2026-04-27 02:53:07'),
(82, 3, 'Nước Ép Thơm Lớn', 'Hương vị nước ép thơm thơm ngon, kết hợp cùng phong cách lớn, mang lại trải nghiệm tuyệt vời cho bạn.', '43000.00', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', 0, '2026-04-27 02:53:07'),
(83, 1, 'Americano Đặc Biệt', 'Hương vị americano thơm ngon, kết hợp cùng phong cách đặc biệt, mang lại trải nghiệm tuyệt vời cho bạn.', '17000.00', 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400', 0, '2026-04-27 02:53:07'),
(84, 2, 'Trà Tắc Lớn', 'Hương vị trà tắc thơm ngon, kết hợp cùng phong cách lớn, mang lại trải nghiệm tuyệt vời cho bạn.', '47000.00', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 0, '2026-04-27 02:53:07'),
(85, 5, 'Đá Xay Socola Cao Cấp', 'Hương vị đá xay socola thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '76000.00', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', 0, '2026-04-27 02:53:07'),
(86, 3, 'Sinh Tố Dưa Hấu Không Đường', 'Hương vị sinh tố dưa hấu thơm ngon, kết hợp cùng phong cách không đường, mang lại trải nghiệm tuyệt vời cho bạn.', '44000.00', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', 0, '2026-04-27 02:53:07'),
(87, 2, 'Hồng Trà Sữa Cao Cấp', 'Hương vị hồng trà sữa thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '56000.00', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', 0, '2026-04-27 02:53:07'),
(88, 3, 'Sinh Tố Chuối Truyền Thống', 'Hương vị sinh tố chuối thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '63000.00', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', 0, '2026-04-27 02:53:07'),
(89, 2, 'Trà Việt Quất Vừa', 'Hương vị trà việt quất thơm ngon, kết hợp cùng phong cách vừa, mang lại trải nghiệm tuyệt vời cho bạn.', '38000.00', 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400', 0, '2026-04-27 02:53:07'),
(90, 1, 'Americano Hiện Đại', 'Hương vị americano thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '43000.00', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 0, '2026-04-27 02:53:07'),
(91, 2, 'Trà Sen Vàng Cao Cấp', 'Hương vị trà sen vàng thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '97000.00', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400', 1, '2026-04-27 02:53:07'),
(92, 5, 'Đá Xay Socola Chip Vừa', 'Hương vị đá xay socola chip thơm ngon, kết hợp cùng phong cách vừa, mang lại trải nghiệm tuyệt vời cho bạn.', '58000.00', 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400', 0, '2026-04-27 02:53:07'),
(93, 1, 'Cà Phê Trứng Truyền Thống', 'Hương vị cà phê trứng thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '17000.00', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 0, '2026-04-27 02:53:07'),
(94, 5, 'Đá Xay Matcha Hiện Đại', 'Hương vị đá xay matcha thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '65000.00', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', 0, '2026-04-27 02:53:07'),
(95, 1, 'Cà Phê Muối Ít Đường', 'Hương vị cà phê muối thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '24000.00', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', 0, '2026-04-27 02:53:07'),
(96, 2, 'Trà Ổi Hồng Đặc Biệt', 'Hương vị trà ổi hồng thơm ngon, kết hợp cùng phong cách đặc biệt, mang lại trải nghiệm tuyệt vời cho bạn.', '32000.00', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', 0, '2026-04-27 02:53:07'),
(97, 1, 'Macchiato Ít Đường', 'Hương vị macchiato thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '45000.00', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 1, '2026-04-27 02:53:07'),
(98, 3, 'Nước Ép Rau Má Nhỏ', 'Hương vị nước ép rau má thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '38000.00', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400', 0, '2026-04-27 02:53:07'),
(99, 5, 'Đá Xay Phúc Bồn Tử Hiện Đại', 'Hương vị đá xay phúc bồn tử thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '48000.00', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', 0, '2026-04-27 02:53:07'),
(100, 2, 'Trà Xoài Lớn', 'Hương vị trà xoài thơm ngon, kết hợp cùng phong cách lớn, mang lại trải nghiệm tuyệt vời cho bạn.', '28000.00', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 0, '2026-04-27 02:53:07'),
(101, 2, 'Trà Matcha Latte Ít Đường', 'Hương vị trà matcha latte thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '54000.00', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', 0, '2026-04-27 02:53:07'),
(102, 2, 'Trà Nhài Cao Cấp', 'Hương vị trà nhài thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '45000.00', 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=400', 0, '2026-04-27 02:53:07'),
(103, 1, 'Cà Phê Hạnh Nhân Ít Đường', 'Hương vị cà phê hạnh nhân thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '44000.00', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 0, '2026-04-27 02:53:07'),
(104, 3, 'Nước Ép Thơm Truyền Thống', 'Hương vị nước ép thơm thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '48000.00', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', 0, '2026-04-27 02:53:07'),
(105, 1, 'Cà Phê Đen Đặc Biệt', 'Hương vị cà phê đen thơm ngon, kết hợp cùng phong cách đặc biệt, mang lại trải nghiệm tuyệt vời cho bạn.', '54000.00', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400', 0, '2026-04-27 02:53:07'),
(106, 3, 'Nước Ép Rau Má Thêm Kem', 'Hương vị nước ép rau má thơm ngon, kết hợp cùng phong cách thêm kem, mang lại trải nghiệm tuyệt vời cho bạn.', '39000.00', 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400', 0, '2026-04-27 02:53:07'),
(107, 3, 'Nước Ép Nho Hiện Đại', 'Hương vị nước ép nho thơm ngon, kết hợp cùng phong cách hiện đại, mang lại trải nghiệm tuyệt vời cho bạn.', '43000.00', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 0, '2026-04-27 02:53:07'),
(108, 2, 'Trà Ổi Hồng Truyền Thống', 'Hương vị trà ổi hồng thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '47000.00', 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', 0, '2026-04-27 02:53:07'),
(109, 3, 'Sinh Tố Dưa Hấu Không Đường', 'Hương vị sinh tố dưa hấu thơm ngon, kết hợp cùng phong cách không đường, mang lại trải nghiệm tuyệt vời cho bạn.', '31000.00', 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400', 0, '2026-04-27 02:53:07'),
(110, 1, 'Mocha Ít Đường', 'Hương vị mocha thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '21000.00', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400', 1, '2026-04-27 02:53:07'),
(111, 5, 'Đá Xay Socola Nhỏ', 'Hương vị đá xay socola thơm ngon, kết hợp cùng phong cách nhỏ, mang lại trải nghiệm tuyệt vời cho bạn.', '61000.00', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', 1, '2026-04-27 02:53:07'),
(112, 5, 'Đá Xay Socola Truyền Thống', 'Hương vị đá xay socola thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '58000.00', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 1, '2026-04-27 02:53:07'),
(113, 5, 'Đá Xay Socola Chip Không Đường', 'Hương vị đá xay socola chip thơm ngon, kết hợp cùng phong cách không đường, mang lại trải nghiệm tuyệt vời cho bạn.', '71000.00', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400', 1, '2026-04-27 02:53:07'),
(114, 5, 'Đá Xay Chanh Dây Ít Đường', 'Hương vị đá xay chanh dây thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '59000.00', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', 0, '2026-04-27 02:53:07'),
(115, 1, 'Latte Thêm Kem', 'Hương vị latte thơm ngon, kết hợp cùng phong cách thêm kem, mang lại trải nghiệm tuyệt vời cho bạn.', '33000.00', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', 0, '2026-04-27 02:53:07'),
(116, 1, 'Cà Phê Rhum Đặc Biệt', 'Hương vị cà phê rhum thơm ngon, kết hợp cùng phong cách đặc biệt, mang lại trải nghiệm tuyệt vời cho bạn.', '77000.00', 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', 0, '2026-04-27 02:53:07'),
(117, 2, 'Trà Sen Vàng Cao Cấp', 'Hương vị trà sen vàng thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '54000.00', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', 0, '2026-04-27 02:53:07'),
(118, 3, 'Sinh Tố Thanh Long Ít Đường', 'Hương vị sinh tố thanh long thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '37000.00', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', 0, '2026-04-27 02:53:07'),
(119, 1, 'Flat White Lớn', 'Hương vị flat white thơm ngon, kết hợp cùng phong cách lớn, mang lại trải nghiệm tuyệt vời cho bạn.', '16000.00', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 0, '2026-04-27 02:53:07'),
(120, 2, 'Trà Thiết Quan Âm Ít Đường', 'Hương vị trà thiết quan âm thơm ngon, kết hợp cùng phong cách ít đường, mang lại trải nghiệm tuyệt vời cho bạn.', '60000.00', 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400', 0, '2026-04-27 02:53:07'),
(121, 2, 'Trà Đào Cam Sả Cao Cấp', 'Hương vị trà đào cam sả thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '46000.00', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', 0, '2026-04-27 02:53:07'),
(122, 5, 'Đá Xay Sữa Dừa Truyền Thống', 'Hương vị đá xay sữa dừa thơm ngon, kết hợp cùng phong cách truyền thống, mang lại trải nghiệm tuyệt vời cho bạn.', '70000.00', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400', 0, '2026-04-27 02:53:07'),
(123, 3, 'Nước Ép Bưởi Đặc Biệt', 'Hương vị nước ép bưởi thơm ngon, kết hợp cùng phong cách đặc biệt, mang lại trải nghiệm tuyệt vời cho bạn.', '78000.00', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', 0, '2026-04-27 02:53:07'),
(124, 5, 'Đá Xay Phúc Bồn Tử Cao Cấp', 'Hương vị đá xay phúc bồn tử thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '56000.00', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400', 1, '2026-04-27 02:53:07'),
(125, 2, 'Trà Gừng Lớn', 'Hương vị trà gừng thơm ngon, kết hợp cùng phong cách lớn, mang lại trải nghiệm tuyệt vời cho bạn.', '40000.00', 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', 0, '2026-04-27 02:53:07'),
(126, 5, 'Đá Xay Dâu Cao Cấp', 'Hương vị đá xay dâu thơm ngon, kết hợp cùng phong cách cao cấp, mang lại trải nghiệm tuyệt vời cho bạn.', '68000.00', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', 0, '2026-04-27 02:53:07'),
(127, 3, 'Sinh Tố Kiwi Lớn', 'Hương vị sinh tố kiwi thơm ngon, kết hợp cùng phong cách lớn, mang lại trải nghiệm tuyệt vời cho bạn.', '34000.00', 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=400', 0, '2026-04-27 02:53:07'),
(128, 5, 'Đá Xay Cookie Thêm Kem', 'Hương vị đá xay cookie thơm ngon, kết hợp cùng phong cách thêm kem, mang lại trải nghiệm tuyệt vời cho bạn.', '70000.00', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 1, '2026-04-27 02:53:07'),
(129, 1, 'Cà Phê Cốt Dừa Thêm Kem', 'Hương vị cà phê cốt dừa thơm ngon, kết hợp cùng phong cách thêm kem, mang lại trải nghiệm tuyệt vời cho bạn.', '38000.00', 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400', 0, '2026-04-27 02:53:07');

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','completed','cancelled') DEFAULT 'pending',
  `shipping_address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `customer_name` varchar(100) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `order_type` enum('dine_in','delivery') DEFAULT 'delivery',
  `table_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `table_id` (`table_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `orders` VALUES 
(1, 1, '198000.00', 'completed', NULL, '2026-03-23 07:47:15', 'Đoàn Đắc Đức', NULL, 'dine_in', 7),
(2, 1, '58000.00', 'pending', NULL, '2026-03-23 07:59:02', 'Nguyễn Văn A', NULL, 'dine_in', 2),
(3, 1, '235000.00', 'pending', NULL, '2026-03-23 07:59:34', 'Nguyễn Văn A', NULL, 'dine_in', 7),
(4, 1, '100000.00', 'pending', 'Hà Nội', '2026-03-23 08:01:07', 'Nguyễn Văn A', '123123312', 'delivery', NULL);

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `order_items` VALUES 
(1, 1, 27, 4, '35000.00'),
(2, 1, 1, 2, '29000.00'),
(3, 2, 1, 2, '29000.00'),
(4, 3, 28, 1, '100000.00'),
(5, 3, 28, 1, '100000.00'),
(6, 3, 27, 1, '35000.00'),
(7, 4, 28, 1, '100000.00');

SET FOREIGN_KEY_CHECKS = 1;