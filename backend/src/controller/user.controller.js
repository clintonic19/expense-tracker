const { pool } = require("../database/dbConfig");
const { comparePassword, hashPassword } = require("../utils/password.encrypt");

//FUNCTION TO GET USER DETAILS
// This function retrieves the user details based on the userId from the request object

const getUser = async(req, res ) =>{
try {
    const{ userId }= req.user;
     // Insert new user into the database
        const getUser = await pool.query({
            text:`SELECT * FROM userTable WHERE id = $1`,
            values: [ userId ]
        } );
        const user = getUser.rows[0]; // Fetch the first user from the result set

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }  
        user.password = undefined; // Remove password from the response
        console.log("User fetched successfully:", user);
        

        res.status(200).json({
            status: 200,
            message: "User fetched successfully",
            data: user
        });        
} catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ 
        status: 500,
        message: "Internal Server Error"
    });
}
}

//FUNCTION TO UPDATE USER DETAILS
// This function updates the user details based on the userId from the request object
// It expects the updated user data in the request body
const updateUser = async(req, res ) =>{
    try {
       
        const{ userId }= req.user;

        // Destructure the updated user data from the request body
        const{ firstName, lastName, currency, country, contact  }=req.body;

        // Check if the user exists in the database
         const getExistingUser = await pool.query({
            text:`SELECT * FROM userTable WHERE id = $1`,
            values: [ userId ]
        } );
        const user = getExistingUser.rows[0]; // Fetch the first user from the result set

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }

        // Update user details in the database
        const updatedUser = await pool.query({
            text: `UPDATE userTable SET firstname = $1, lastname = $2, 
                        currency = $3, country = $4, contact = $5,
                        updatedat = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *`,
            values: [ firstName, lastName, currency, country, contact, userId ]
        })
        updatedUser.rows[0].password = undefined;
        console.log("User updated successfully:", updatedUser.rows[0]);

        res.status(200).json({
            status: 200,
            message: "User updated successfully",
            data: updatedUser.rows[0]
        });
      
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ 
            status: 500,
            message: "Internal Server Error"
        });
        
    }
}

//FUNCTION TO CHANGE USER PASSWORD
const changePassword = async(req, res ) =>{
    try {
        const{ userId }= req.user;
        const{ currentPassword, newPassword, confirmPassword }=req.body // Destructure the updated user data from the request body
       
        // Check if the user exists in the database
       const getExistingUser = await pool.query({
            text:`SELECT * FROM userTable WHERE id = $1`,
            values: [ userId ]
        } );
        const user = getExistingUser.rows[0]; // Fetch the first user from the result set

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        } 

         // Check if the current password matches the existing password
        if (currentPassword && newPassword && confirmPassword) {
            
            // Validate that new password and confirm password match
            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    status: 400,
                    message: "New password and confirm password do not match"
                });
            }
            // Assuming you have a function to compare passwords
            // Using the comparePassword function to check if the password matches
            const isCurrentPasswordMatch = await comparePassword(currentPassword, user?.password);
            // If current password does not match the existing password
            if (!isCurrentPasswordMatch) {
                return res.status(401).json({
                    status: 401,
                    message: "Current password is incorrect"
                });
            }
        }
        //hash the new password if it is provided
        const hashedPassword = await hashPassword(newPassword);

        // Update user details in the database
       await pool.query({
            text: `UPDATE userTable SET password = $1 WHERE id = $2`,
            values: [ hashedPassword, userId ]
        });

        console.log("User updated successfully:", user);

        res.status(200).json({
            status: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Error changing password:", error.message);
        res.status(500).json({ 
            status: 500,
            message: "Internal Server Error"
        });
        
    }
}

const deleteUser = async(req, res ) =>{
    try {
        const{ userId }= req.user;
              
        // Check if the user exists in the database
       const getExistingUser = await pool.query({
            text:`SELECT * FROM userTable WHERE id = $1`,
            values: [ userId ]
        } );
        const user = getExistingUser.rows[0]; // Fetch the first user from the result set

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }
        //delete user from the database
        await pool.query({
            text: `DELETE FROM userTable WHERE id = $1`,
            values: [ userId ]
        });
        user.password = undefined; // Remove password from the response
        console.log("User deleted successfully:", user);
        res.status(200).json({
            status: 200,
            message: "User deleted successfully"
        }); 
        
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ 
            status: 500,
            message: "Internal Server Error"
        });        
    }
}

module.exports = {
    getUser,
    changePassword,
    updateUser,
    deleteUser
};