const { pool } = require('../database/dbConfig');
const { hashPassword, comparePassword, generateToken } = require('../utils/password.encrypt');

//Register User controller
const registerUser = async(req, res) =>{
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                status: "false",
                message: "All fields are required"
            });
        }
        // Check if user already exists
        const existingUser = await pool.query({
            // text: ('SELECT * FROM userTable WHERE email = $1'), values: [email]
           text: `SELECT EXISTS (SELECT * FROM userTable WHERE email = $1)`, values: [email],
     });
        // if (existingUser.rows.length > 0) {
        if (existingUser.rows[0].exists) {
            return res.status(400).json({
                status: "false",
                message: "User already exists"
            });
        }

        // Hashed the user password
        const securedPassword = await hashPassword(password);
        if (!securedPassword) {
            return res.status(500).json({
                status: "false",
                message: "Error hashing password"
            });
        }

        // Insert new user into the database
        const newUser = await pool.query({
            text:`INSERT INTO userTable ( firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING *`,
            values: [ firstName, lastName, email, securedPassword]
        } );
        
        newUser.rows[0].password = undefined; // Remove password from response
        res.status(201).json({
            status: "true",
            message: "User registered successfully",
            data: newUser.rows[0]
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            status: "false",
            message: `Internal server error, ${error.message}`
        });
        
    }
}


//Login user controller
const loginUser = async(req, res) =>{
     try {
         const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                status: "false",
                message: "Email and password are required"
            });
        }

        // Check if user exists
        const result = await pool.query({
            text: `SELECT * FROM userTable WHERE email = $1`, 
            values: [email]
        });

        const user = result.rows[0]; // Get the first user from the result
        // If user does not exist
        if (!user) {
            return res.status(404).json({
                status: "false",
                message: "Invalid email and password"
            });
        }
        // Compare the provided password with the stored hashed password
        // Using the comparePassword function to check if the password matches
        const isPasswordMatch = await comparePassword(password, user?.password); // Compare the password with the hashed password
       
        if (!isPasswordMatch) {
            return res.status(401).json({
                status: "false",
                message: "Invalid email and password"
            });
        }

        const token = generateToken(user.id); // Generate JWT token for the user

        // Remove password from response
        user.password = undefined;

        res.status(200).json({
            status: "true",
            message: "User logged in successfully",
            data: {
                user: user,
                token: token
            }
        });
        
    } catch (error) {
        console.error("Error Logging user:", error);
        res.status(500).json({
            status: "false",
            message: `Internal server error, ${error.message}`
        });  
    }
}


// const loginUser = async(req, res) =>{
//      try {
        
//     } catch (error) {
        
//     }
// }



module.exports = {
    registerUser, 
    loginUser 
}