-- Insertar rifa de ejemplo
INSERT INTO `Rifas` (`titulo`, `detalles`, `foto`, `fecha_culminacion`, `precio`, `cantidad_boletos`, `estado`) VALUES 
('Gran Rifa 2024', 'Rifa con increíbles premios para este año', '/placeholder.svg?height=400&width=400&text=Gran+Rifa+2024', DATE_ADD(NOW(), INTERVAL 30 DAY), 180.00, 1000, 'activa')
ON DUPLICATE KEY UPDATE `titulo` = `titulo`;

-- Obtener el ID de la rifa insertada
SET @rifa_id = LAST_INSERT_ID();

-- Insertar premios para la rifa
INSERT INTO `Premios` (`id_rifa`, `titulo`, `descripcion`, `foto_url`) VALUES 
(@rifa_id, 'Moto 0km', 'Motocicleta completamente nueva, modelo del año', '/placeholder.svg?height=300&width=300&text=Moto+0km'),
(@rifa_id, '500$ en Efectivo', 'Quinientos dólares americanos en efectivo', '/placeholder.svg?height=300&width=300&text=500+USD'),
(@rifa_id, '30 Cenas para 2 Personas', 'Treinta cenas románticas para dos personas en restaurantes selectos', '/placeholder.svg?height=300&width=300&text=30+Cenas')
ON DUPLICATE KEY UPDATE `titulo` = `titulo`;

-- Insertar algunos boletos de ejemplo
INSERT INTO `Boletos` (`id_rifa`, `numero_boleto`, `nombre_comprador`, `correo_comprador`, `telefono_comprador`, `cedula_comprador`) VALUES 
(@rifa_id, 1, 'Juan Pérez', 'juan.perez@email.com', '+58-412-1234567', 'V-12345678'),
(@rifa_id, 15, 'María García', 'maria.garcia@email.com', '+58-424-2345678', 'V-23456789'),
(@rifa_id, 42, 'Carlos López', 'carlos.lopez@email.com', '+58-414-3456789', 'V-34567890'),
(@rifa_id, 73, 'Ana Rodríguez', 'ana.rodriguez@email.com', '+58-426-4567890', 'V-45678901'),
(@rifa_id, 99, 'Luis Martínez', 'luis.martinez@email.com', '+58-412-5678901', 'V-56789012')
ON DUPLICATE KEY UPDATE `nombre_comprador` = `nombre_comprador`;
