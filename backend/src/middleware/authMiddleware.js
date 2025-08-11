const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next)=>{
    try {
        // Check if the request has an Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization || req.cookies.jwt;
    if (!authHeader || !authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            status: "false",
            message: "Unauthorized access, no token provided"
        });
    } 

    // Extract the token from the Authorization header
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            status: "false",
            message: "Unauthorized access, token not found"
        });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return res.status(401).json({
            status: "false",
            message: "Unauthorized access, invalid token"
        });
    }

    // Attach the user information to the request object
    // req.user = decoded; // Assuming the token contains user information
    req.user = {
        userId: decoded.userId // Attach userId to the request body
    }
    // console.log("Authentication successful, user ID:", decoded.userId);
    //  console.log("User fetched successfully:", user);

    next(); // Call the next middleware or route handler
    

    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({
            status: "false",
            message: "Unauthorized access"
        });
        
    }
}

module.exports = { authMiddleware };