const { pool } = require("../database/dbConfig");

// Function to get account details
// This function retrieves the account details based on the userId from the request object
const getAccount = async(req, res) =>{
     try {
        const{ userId }= req.user;

        const account = await pool.query({
            text: `SELECT * FROM account WHERE user_id = $1`,
            values: [userId]
        })

        res.status(200).json({
            status: 200,
            message: "Account retrieved successfully",
            data: account.rows[0] // Assuming you want to return the first account found
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
        
    }
};

// Function to create a new account
// This function should be called when a user signs up or requests an account creation
const createAccount = async(req, res) =>{
     try {
        const{ userId }= req.user;
        const { name, amount, account_number } = req.body; // Assuming you might want to get some data from the request body
        
        // Auto-generate account number if not provided
        // if (!account_number) {
        //     account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        // }
        
        // Check if the account already exists for the user
        const existingAccount = {
            text: `SELECT * FROM account WHERE account_name = $1 AND user_id = $2`,
            values: [name, userId]
        };
        // Execute the query to check for existing account
        const accountResult = await pool.query(existingAccount);
        const account =  accountResult.rows[0]; // Fetch the first account from the result set
        
        // If an account already exists, return a response
        // If no account exists, create a new one
        if (account) {
            return res.status(400).json({
                status: 400,
                message: "Account already exists"
            });
        }
        
        // Execute the query to create a new account
        const newAccount = await pool.query({
            text: `INSERT INTO account 
                            (user_id, account_name, account_number, account_balance ) 
                            VALUES ($1, $2, $3, $4) RETURNING *`,
            values: [userId, name, amount, account_number]
        });

        // Execute the query to insert a new account
        const newAccountResult =  newAccount.rows[0]; // Fetch the first account from the result set
        
        console.log("New Account Result::::", newAccountResult);

         // Ensure name is an array for the query
         const userAccount = Array.isArray(name) ? name : [name];

        const updatedAccount = {
            text: `UPDATE userTable SET accounts = array_cat(
            accounts, $1 ), updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            values: [ userAccount, userId ]
        }; // Update the account with the new name
        
        await pool.query(updatedAccount); // Execute the query to update the user account

        //add initial deposit to the account/transaction
    const description = `${newAccountResult.account_name}  Initial Deposit `;
        
        // Prepare the query to insert the initial deposit transaction
        // This query assumes you have a 'transaction' table to log transactions      
        const initialDepositQuery = await pool.query ({
                    text: `INSERT INTO transaction
                            (user_id, description, type, status, amount, source) 
                            VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
                    values: [
                        userId,
                        description,
                        "Income",
                        "Completed",
                        amount,
                        newAccountResult.account_name,
                    ],
                }); //
        console.log("New account created successfully:", newAccountResult);
        console.log("Initial Deposit::::", initialDepositQuery);
        // await pool.query(initialDepositQuery); // Execute the query to add initial deposit  
        
        // Execute the query to create a new account
        // Return a success response with the newly created account
        // This response will be sent back to the client after successful account creation
        res.status(201).json({
            status: 201,
            message: `${newAccountResult.account_name} Account created successfully`,
            data: newAccountResult // Return the newly created account
        });
                
    } catch (error) {
        console.error("Error creating account:", error.message);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
        
    }
};

// Function to add money to an account
// This function should be called when a user wants to add funds to their account
const addMoneyToAccount = async(req, res) =>{
     try {
        const{ userId }= req.user;
        const{ id }= req.params;
        // const accountId = Number(req.params.id);
        const{ amount }= req.body; // Assuming you want to get the amount to add from the request body

        //Ensure the amount is a valid number
        const newAmount = Number(amount);

        // Check if the amount is a valid number and greater than zero
        if (isNaN(newAmount) || newAmount <= 0) {
            return res.status(400).json({
                status: 400,
                message: "Invalid amount"
            });
        }

        const result = await pool.query({
            text: `UPDATE account SET account_balance = account_balance + $1,
                    updatedat = CURRENT_TIMESTAMP 
                    WHERE id = $2 RETURNING *`,
            values: [newAmount, id, ],
        })

        console.log("Updating account with ID:::", id);
        console.log("Query result:", result);

        // if (result.row[0] === 0) {
        //         return res.status(404).json({
        //             status: 404,
        //             message: `Account with ID ${id} not found.`,
        //         });
        //     }

        const accountInfo = result.rows[0]; // Fetch the first account from the result set
        const description = `${accountInfo.account_name} Deposit`;

        // Prepare the query to insert the deposit transaction
        const depositTransaction =  {      
                    text: `INSERT INTO transaction
                            (user_id, description, type, status, amount, source) 
                            VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,

                    values: [
                        userId,
                        description,
                        "income",
                        "Completed",
                        amount,
                        accountInfo.account_name,
                    ],
                }; 
        await pool.query(depositTransaction); // Execute the query to add deposit transaction
        
        console.log("Deposit Transaction::::", depositTransaction);
         console.log("Money added successfully:", accountInfo);
     
        // Return a success response with the updated account information
        res.status(200).json({
            status: 200,
            message: "Money added successfully",
            data: accountInfo // Return the updated account information
        });
            
    } catch (error) {
        console.error("Error adding money to account:", error.message);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });      
    }
}




module.exports = {
    getAccount,
    createAccount,
    addMoneyToAccount
}