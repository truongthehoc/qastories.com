-- =====================================================
-- QA STORIES - DATABASE SCHEMA (MySQL) v2.0
-- =====================================================

CREATE DATABASE IF NOT EXISTS `qastories` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `qastories`;

-- 1. Bảng Quản trị viên (Admins)
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL DEFAULT 'Admin',
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `permissions` JSON NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `avatar` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Slider / Banner Trang Chủ (Banners)
CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NULL,
  `subtitle` VARCHAR(500) NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `link_url` VARCHAR(255) DEFAULT '/contact',
  `button_text` VARCHAR(100) DEFAULT 'Đặt Lịch Ngay',
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Quản lý Lịch hẹn Khách hàng (Bookings)
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'Họ tên bố/mẹ',
  `phone` VARCHAR(50) NOT NULL COMMENT 'Số điện thoại',
  `email` VARCHAR(255) NULL COMMENT 'Địa chỉ email',
  `date` VARCHAR(50) NULL COMMENT 'Ngày dự kiến chụp',
  `service` VARCHAR(255) NOT NULL COMMENT 'Gói dịch vụ đã chọn',
  `note` TEXT NULL COMMENT 'Ghi chú yêu cầu',
  `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending' COMMENT 'Trạng thái xử lý',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Quản lý Danh mục & Album ảnh (Albums)
CREATE TABLE IF NOT EXISTS `albums` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `category` VARCHAR(100) NOT NULL COMMENT 'newborn, 100days, 1year, family...',
  `category_label` VARCHAR(100) NULL,
  `cover_image` VARCHAR(500) NULL,
  `description` TEXT NULL,
  `location` VARCHAR(255) NULL,
  `date_shot` VARCHAR(100) NULL,
  `package_name` VARCHAR(255) NULL,
  `story` TEXT NULL,
  `is_featured` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Lưu trữ Chi tiết Ảnh trong Album (Photos)
CREATE TABLE IF NOT EXISTS `photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `album_id` INT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NULL,
  `size` INT NULL,
  `url` VARCHAR(500) NOT NULL,
  `title` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Cài đặt Hệ thống & Nhận diện Thương hiệu (System Settings)
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` LONGTEXT NULL,
  `setting_group` VARCHAR(50) DEFAULT 'general',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng Thống kê Lượt xem Trang (Page Views / Analytics)
CREATE TABLE IF NOT EXISTS `page_views` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `path` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NULL,
  `ip_address` VARCHAR(100) NULL,
  `user_agent` TEXT NULL,
  `device_type` VARCHAR(50) DEFAULT 'desktop',
  `referer` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng Quản lý Danh mục Gói Dịch Vụ / Báo Giá (Service Packages)
CREATE TABLE IF NOT EXISTS `packages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'newborn' COMMENT 'newborn, 100days, 1year, family, combo, other',
  `price` DECIMAL(15, 0) DEFAULT 0 COMMENT 'Giá dịch vụ (VNĐ)',
  `original_price` DECIMAL(15, 0) NULL COMMENT 'Giá gốc trước giảm (VNĐ)',
  `duration` VARCHAR(100) NULL COMMENT 'Thời gian thực hiện (VD: 90 - 120 phút)',
  `description` TEXT NULL COMMENT 'Mô tả ngắn về gói dịch vụ',
  `includes` TEXT NULL COMMENT 'Chi tiết quyền lợi, sản phẩm bàn giao (JSON hoặc text)',
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT 'Gói nổi bật khuyên dùng',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Trạng thái mở nhận lịch',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

