const pool = require('./database')

async function migrate() {
  try {
    // Tabla roles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id     INT PRIMARY KEY AUTO_INCREMENT,
        nombre ENUM('inversionista','propietario','zootecnista','administrador') NOT NULL UNIQUE
      )
    `)

    await pool.query(`
      INSERT IGNORE INTO roles (nombre) VALUES
      ('inversionista'), ('propietario'), ('zootecnista'), ('administrador')
    `)

    // Tabla usuarios base
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id               INT PRIMARY KEY AUTO_INCREMENT,
        nombre           VARCHAR(100) NOT NULL,
        apellido         VARCHAR(100) NOT NULL,
        email            VARCHAR(255) NOT NULL UNIQUE,
        password_hash    VARCHAR(255) NOT NULL,
        telefono         VARCHAR(20),
        cedula           VARCHAR(20) UNIQUE,
        ciudad           VARCHAR(100),
        rol_id           INT NOT NULL DEFAULT 1,
        activo           BOOLEAN DEFAULT TRUE,
        aprobado         BOOLEAN DEFAULT FALSE,
        email_verificado BOOLEAN DEFAULT FALSE,
        refresh_token    VARCHAR(500) NULL,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (rol_id) REFERENCES roles(id)
      )
    `)

    // Tabla datos inversor
    await pool.query(`
      CREATE TABLE IF NOT EXISTS datos_inversor (
        id                INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id        INT NOT NULL UNIQUE,
        monto_disponible  DECIMAL(15,2),
        banco             VARCHAR(100),
        tipo_cuenta       ENUM('ahorros','corriente'),
        numero_cuenta     VARCHAR(50),
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `)

    // Tabla datos propietario
    await pool.query(`
      CREATE TABLE IF NOT EXISTS datos_propietario (
        id                 INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id         INT NOT NULL UNIQUE,
        nombre_finca       VARCHAR(150),
        ubicacion          VARCHAR(255),
        hectareas          DECIMAL(10,2),
        capacidad_bovinos  INT,
        created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `)

    // Tabla datos zootecnista
    await pool.query(`
      CREATE TABLE IF NOT EXISTS datos_zootecnista (
        id                INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id        INT NOT NULL UNIQUE,
        tarjeta_profesional VARCHAR(50),
        universidad       VARCHAR(150),
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `)

    // Tabla configuración global (admin)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        precio_kilo     DECIMAL(10,2) NOT NULL DEFAULT 9600,
        peso_animal_kg  DECIMAL(8,2)  NOT NULL DEFAULT 450,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Insertar configuración inicial si no existe
    await pool.query(`
      INSERT IGNORE INTO configuracion (id, precio_kilo, peso_animal_kg)
      VALUES (1, 9600, 450)
    `)

    // Tabla inversiones completa
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inversiones (
        id                INT PRIMARY KEY AUTO_INCREMENT,
        inversionista_id  INT NOT NULL,
        finca_id          INT NOT NULL,
        monto_cop         DECIMAL(15,2) NOT NULL,
        cabezas           INT NOT NULL,
        dias_ciclo        INT NOT NULL DEFAULT 120,
        precio_kilo       DECIMAL(10,2) NOT NULL,
        peso_animal_kg    DECIMAL(8,2)  NOT NULL,
        estado            ENUM('activa','finalizada','cancelada') DEFAULT 'activa',
        fecha_inicio      DATE NOT NULL,
        fecha_fin         DATE NOT NULL,
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inversionista_id) REFERENCES usuarios(id),
        FOREIGN KEY (finca_id)         REFERENCES datos_propietario(id)
      )
    `)
    
    console.log('✅ Tablas creadas correctamente')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error en migración:', err.message)
    process.exit(1)
  }
}

migrate()