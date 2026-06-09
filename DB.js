require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: '12345',
    host: 'localhost',
    port: 5432,
    database: 'v.rabaka'
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};