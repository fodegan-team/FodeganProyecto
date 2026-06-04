const pool = require('./database')

async function migrate() {
  try {
    // ── ROLES ────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id     INT PRIMARY KEY AUTO_INCREMENT,
        nombre ENUM('inversionista','propietario','zootecnista','administrador') NOT NULL UNIQUE
      )
    `)
    await pool.query(`
      INSERT IGNORE INTO roles (nombre) VALUES
      ('inversionista'),('propietario'),('zootecnista'),('administrador')
    `)

    // ── USUARIOS ──────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id               INT PRIMARY KEY AUTO_INCREMENT,
        nombre           VARCHAR(100) NOT NULL,
        apellido         VARCHAR(100) NOT NULL,
        email            VARCHAR(255) NOT NULL UNIQUE,
        password_hash    VARCHAR(255) NOT NULL,
        telefono         VARCHAR(20),
        cedula           VARCHAR(20),
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

    // ── CONFIGURACIÓN GLOBAL ──────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        precio_kilo     DECIMAL(10,2) NOT NULL DEFAULT 9600,
        peso_animal_kg  DECIMAL(8,2)  NOT NULL DEFAULT 450,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    await pool.query(`INSERT IGNORE INTO configuracion (id) VALUES (1)`)

    // ── FINCAS ────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fincas (
        id                   INT PRIMARY KEY AUTO_INCREMENT,
        propietario_id       INT NOT NULL,
        nombre_real          VARCHAR(150) NOT NULL,
        nombre_ficticio      VARCHAR(150),
        ubicacion            VARCHAR(255),
        hectareas            DECIMAL(10,2),
        capacidad_total      INT,
        capacidad_disponible INT,
        estado               ENUM('pendiente','aprobada','rechazada','inactiva') DEFAULT 'pendiente',
        motivo_rechazo       TEXT NULL,
        created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (propietario_id) REFERENCES usuarios(id)
      )
    `)

    // ── DATOS INVERSOR ────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS datos_inversor (
        id               INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id       INT NOT NULL UNIQUE,
        monto_disponible DECIMAL(15,2),
        banco            VARCHAR(100),
        tipo_cuenta      ENUM('ahorros','corriente'),
        numero_cuenta    VARCHAR(50),
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `)

    // ── DATOS ZOOTECNISTA ─────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS datos_zootecnista (
        id                  INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id          INT NOT NULL UNIQUE,
        tarjeta_profesional VARCHAR(50),
        universidad         VARCHAR(150),
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `)

    // ── ASIGNACIONES ZOOTECNISTA-FINCA ────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS asignaciones_zootecnista (
        id             INT PRIMARY KEY AUTO_INCREMENT,
        zootecnista_id INT NOT NULL,
        finca_id       INT NOT NULL,
        activa         BOOLEAN DEFAULT TRUE,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (zootecnista_id) REFERENCES usuarios(id),
        FOREIGN KEY (finca_id)       REFERENCES fincas(id),
        UNIQUE KEY unique_asignacion (zootecnista_id, finca_id)
      )
    `)

    // ── INVERSIONES ───────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inversiones (
        id                  INT PRIMARY KEY AUTO_INCREMENT,
        inversionista_id    INT NOT NULL,
        finca_id            INT NOT NULL,
        monto_cop           DECIMAL(15,2) NOT NULL,
        cantidad_animales   INT NOT NULL,
        dias_ciclo          INT NOT NULL DEFAULT 120,
        rendimiento_pct     DECIMAL(5,2) NOT NULL DEFAULT 12.00,
        precio_kilo         DECIMAL(10,2) NOT NULL,
        peso_animal_kg      DECIMAL(8,2)  NOT NULL,
        estado              ENUM('pendiente_reunion','activa','finalizada','cancelada') DEFAULT 'pendiente_reunion',
        fecha_inversion     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_inicio_ciclo  DATE NULL,
        fecha_fin_ciclo     DATE NULL,
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inversionista_id) REFERENCES usuarios(id),
        FOREIGN KEY (finca_id)         REFERENCES fincas(id)
      )
    `)

    // ── ANIMALES ──────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS animales (
        id            INT PRIMARY KEY AUTO_INCREMENT,
        inversion_id  INT NOT NULL,
        codigo        VARCHAR(10) NOT NULL,
        peso_inicial  DECIMAL(8,2) NOT NULL,
        estado_actual ENUM('buen_estado','excelente','enfermo','mal_estado') DEFAULT 'buen_estado',
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inversion_id) REFERENCES inversiones(id) ON DELETE CASCADE
      )
    `)

    // ── SEGUIMIENTO MENSUAL ───────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seguimiento_peso (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        animal_id       INT NOT NULL,
        inversion_id    INT NOT NULL,
        mes_numero      INT NOT NULL,
        peso_kg         DECIMAL(8,2) NOT NULL,
        estado          ENUM('buen_estado','excelente','enfermo','mal_estado') DEFAULT 'buen_estado',
        zootecnista_id  INT NOT NULL,
        fecha_registro  DATE NOT NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_seguimiento (animal_id, mes_numero),
        FOREIGN KEY (animal_id)      REFERENCES animales(id)   ON DELETE CASCADE,
        FOREIGN KEY (inversion_id)   REFERENCES inversiones(id) ON DELETE CASCADE,
        FOREIGN KEY (zootecnista_id) REFERENCES usuarios(id)
      )
    `)

    // ── COMENTARIOS ───────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id             INT PRIMARY KEY AUTO_INCREMENT,
        inversion_id   INT NOT NULL,
        animal_id      INT NULL,
        zootecnista_id INT NOT NULL,
        contenido      TEXT NOT NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inversion_id)   REFERENCES inversiones(id) ON DELETE CASCADE,
        FOREIGN KEY (animal_id)      REFERENCES animales(id)    ON DELETE SET NULL,
        FOREIGN KEY (zootecnista_id) REFERENCES usuarios(id)
      )
    `)

    // ── REUNIONES ─────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reuniones (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        inversion_id    INT NOT NULL,
        tipo            ENUM('post_inversion','cierre') DEFAULT 'post_inversion',
        fecha_propuesta DATETIME NULL,
        estado          ENUM('pendiente','completada','cancelada') DEFAULT 'pendiente',
        notas           TEXT NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inversion_id) REFERENCES inversiones(id) ON DELETE CASCADE
      )
    `)

    // ── VISITAS ───────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitas (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        zootecnista_id  INT NOT NULL,
        finca_id        INT NOT NULL,
        fecha_visita    DATETIME NOT NULL,
        tipo            ENUM('pesaje','vacunacion','revision','control_sanitario') DEFAULT 'pesaje',
        estado          ENUM('pendiente','confirmada','completada','cancelada') DEFAULT 'pendiente',
        notas           TEXT NULL,
        created_by      INT NOT NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (zootecnista_id) REFERENCES usuarios(id),
        FOREIGN KEY (finca_id)       REFERENCES fincas(id),
        FOREIGN KEY (created_by)     REFERENCES usuarios(id)
      )
    `)

    // ── REPORTES TÉCNICOS ─────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reportes_tecnicos (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        animal_id       INT NOT NULL,
        inversion_id    INT NOT NULL,
        zootecnista_id  INT NOT NULL,
        visita_id       INT NULL,
        tipo_revision   ENUM('control_sanitario','vacunacion','control_peso','revision_general') NOT NULL,
        estado_animal   ENUM('excelente','bueno','regular','enfermo','muerto') NOT NULL,
        observaciones   TEXT NOT NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_id)      REFERENCES animales(id)    ON DELETE CASCADE,
        FOREIGN KEY (inversion_id)   REFERENCES inversiones(id) ON DELETE CASCADE,
        FOREIGN KEY (zootecnista_id) REFERENCES usuarios(id),
        FOREIGN KEY (visita_id)      REFERENCES visitas(id)     ON DELETE SET NULL
      )
    `)

    // ── EVIDENCIAS ────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS evidencias (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        animal_id       INT NOT NULL,
        inversion_id    INT NOT NULL,
        zootecnista_id  INT NOT NULL,
        reporte_id      INT NULL,
        url_imagen      VARCHAR(500) NOT NULL,
        descripcion     VARCHAR(255) NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_id)      REFERENCES animales(id)          ON DELETE CASCADE,
        FOREIGN KEY (inversion_id)   REFERENCES inversiones(id)       ON DELETE CASCADE,
        FOREIGN KEY (zootecnista_id) REFERENCES usuarios(id),
        FOREIGN KEY (reporte_id)     REFERENCES reportes_tecnicos(id) ON DELETE SET NULL
      )
    `)

    // ── ALERTAS SANITARIAS ────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alertas_sanitarias (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        animal_id       INT NOT NULL,
        inversion_id    INT NOT NULL,
        zootecnista_id  INT NOT NULL,
        descripcion     TEXT NOT NULL,
        urgencia        ENUM('baja','media','alta','critica') DEFAULT 'media',
        estado          ENUM('activa','resuelta') DEFAULT 'activa',
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_id)      REFERENCES animales(id)    ON DELETE CASCADE,
        FOREIGN KEY (inversion_id)   REFERENCES inversiones(id) ON DELETE CASCADE,
        FOREIGN KEY (zootecnista_id) REFERENCES usuarios(id)
      )
    `)
    console.log('✅ Todas las tablas creadas correctamente')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error en migración:', err.message)
    process.exit(1)
  }
}

migrate()