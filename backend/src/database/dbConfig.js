// const pg = require('pg');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    // user: process.env.DB_USER,
    // host: process.env.DB_HOST,
    // database: process.env.DB_NAME,
    // password: process.env.DB_PASSWORD,
    // port: process.env.DB_PORT,

    connectionString: process.env.DATABASE_URL, // Use DATABASE_URL for Heroku or other environments
    ssl: {
        rejectUnauthorized: true, // For development purposes, set to true in production
    },
    
})


// Test the database connection
pool.connect()
.then(() => {
    console.log('✅ Database connected successfully');
})
.catch((err) => {
    console.error('Database connection error:', err.stack);

    // if (!process.env.DATABASE_URL) {
    //     console.error("⚠️ DATABASE_URI not loaded. Check your .env file and dotenv.config().");
    //     }

    // console.log("DATABASE_URL:", process.env.DATABASE_URL);
});

// module.exports = { pool };
module.exports = { pool }; // Export the pool for use in other modules