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

    // Insertar roles base
    await pool.query(`
      INSERT IGNORE INTO roles (nombre) VALUES
      ('inversionista'), ('propietario'), ('zootecnista'), ('administrador')
    `)

    // Tabla usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id               INT PRIMARY KEY AUTO_INCREMENT,
        nombre           VARCHAR(100) NOT NULL,
        apellido         VARCHAR(100) NOT NULL,
        email            VARCHAR(255) NOT NULL UNIQUE,
        password_hash    VARCHAR(255) NOT NULL,
        rol_id           INT NOT NULL DEFAULT 1,
        activo           BOOLEAN DEFAULT TRUE,
        email_verificado BOOLEAN DEFAULT FALSE,
        refresh_token    VARCHAR(500) NULL,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (rol_id) REFERENCES roles(id)
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