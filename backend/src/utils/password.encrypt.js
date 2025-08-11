const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//function to hash a password
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw new Error("Hashing failed");
    }
};

// Function to compare a password with a hashed password
const comparePassword = async (password, userPassword) => {
    try {
         if (!password || !userPassword) {
            throw new Error("Missing password or hash for comparison");
        }
        // Compare the plain password with the hashed password
        // bcrypt.compare returns a promise that resolves to true or false
        const isMatch = await bcrypt.compare(password, userPassword);
        return isMatch;
    } catch (error) {
        console.error("Error comparing password:", error);
        throw new Error("Comparison failed");
    }
}

// Function to generate JWT token
const generateToken = (userId) => {   
    try {
        const token = jwt.sign(          
            { userId: userId }, // Payload containing user information
            
            process.env.JWT_SECRET,
            
            { expiresIn: '1d' } // Token expiration time
        );
        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        throw new Error("Token generation failed");
    }
}

module.exports = {
    hashPassword,
    comparePassword,
    generateToken
};