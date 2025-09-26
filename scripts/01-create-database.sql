-- Crear base de datos para el sistema de rifas
CREATE TABLE IF NOT EXISTS `Rifas` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `titulo` VARCHAR(255) NOT NULL,
  `detalles` TEXT,
  `foto` VARCHAR(255),
  `fecha_culminacion` DATETIME NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `cantidad_boletos` INT NOT NULL,
  `estado` ENUM ('activa', 'finalizada', 'pendiente') DEFAULT 'pendiente',
  `fecha_creacion` DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS `Premios` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `id_rifa` INT NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descripcion` TEXT,
  `foto_url` VARCHAR(255),
  FOREIGN KEY (`id_rifa`) REFERENCES `Rifas` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `Boletos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `id_rifa` INT NOT NULL,
  `numero_boleto` INT NOT NULL,
  `nombre_comprador` VARCHAR(255) NOT NULL,
  `correo_comprador` VARCHAR(255) NOT NULL,
  `telefono_comprador` VARCHAR(20),
  `cedula_comprador` VARCHAR(20),
  `fecha_compra` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`id_rifa`) REFERENCES `Rifas` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_boleto_rifa` (`id_rifa`, `numero_boleto`)
);

-- Tabla para administradores
CREATE TABLE IF NOT EXISTS `Administradores` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `usuario` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `fecha_creacion` DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

-- Insertar admin por defecto (usuario: admin, contraseña: admin123)
INSERT INTO `Administradores` (`usuario`, `password_hash`) VALUES 
('admin', '$2b$10$rOzJqQZ8kVJ8kVJ8kVJ8kOzJqQZ8kVJ8kVJ8kVJ8kVJ8kVJ8kVJ8k') 
ON DUPLICATE KEY UPDATE `usuario` = `usuario`;
