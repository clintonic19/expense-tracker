require('dotenv').config(); // Load environment variables from .env file
const cors = require('cors');
const express = require('express');
const mainRoutes = require('./routes/main.route'); // Ensure this is the correct path to your routers file
// const pg = require('pg');
// const { Pool } = pg;
const connectDB = require('./database/dbConfig'); // Ensure this is the correct path to your dbConfig file

const app = express();
const PORT = process.env.PORT || 5000;
// Connect to the database
// connectDB();

app.use(cors(
    {
        origin: 'http://localhost:5173', // Change this to your frontend URL in production
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
        credentials: true, // Allow credentials if needed
    }
)); // Allow all origins for development purposes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', mainRoutes); // Importing API routes

// app.use("*", (req, res) =>{
//     res.status(404).json({ 
//         status: 404,
//         message: "Invalid Url Not Found"
//      });
// })

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})