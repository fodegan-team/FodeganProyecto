const mysql = require('mysql2/promise')
require('dotenv').config()

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0
})

pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL — fodegan_db')
    conn.release()
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message)
  })

module.exports = pool