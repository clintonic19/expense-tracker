const { pool } = require("../database/dbConfig");
const { getMonthName } = require("../utils/monthsOfYear");

// Function to get transactions
// This function retrieves transactions based on the userId and optional date range and search criteria
const transactions = async(req, res) =>{
     try {
        todayDate = new Date();
       const  seven_daysAgo = new Date(todayDate);
        seven_daysAgo.setDate(todayDate.getDate() - 7); // Calculate the date 7 days ago from today

        const sevenDaysAgoDate = seven_daysAgo.toISOString().split('T')[0]; // Format date to YYYY-MM-DD
        // const todayDateFormatted = todayDate.toISOString().split('T')[0]; // Format
        
        const {dateFrom, dateTo, search } = req.query; // Destructure df, dt, and search from query parameters
        const { userId } = req.user; // Get userId from the authenticated user

        const startDate = new Date(dateFrom || sevenDaysAgoDate); // Use dateFrom or default to 7 days ago
        const endDate = new Date(dateTo || new Date()); // Use dateTo or default to today

        //fetch transactions from the database
        const transaction = await pool.query({
            text: `SELECT * FROM transaction WHERE user_id = $1 
            AND createdat BETWEEN $2 AND $3 AND 
            (description ILIKE '%'|| $4 || '%' OR status ILIKE '%'|| $4 || '%') ORDER BY id DESC`,
            values: [userId, startDate, endDate, search || '']
        })

        // Check if any transactions were found
        if (transaction.rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No transactions found for the specified criteria"
            });
        }

        // Return the transactions in the response
        res.status(200).json({
            status: true,
            message: "Transactions retrieved successfully",
            data: transaction.rows, // Return the first transaction found
        });

    
    } catch (error) {
        console.error("Error fetching transactions:", error.message);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
        
    }
}

// Function to get the dashboard data
// This function will handle fetching the dashboard data for the user
const dashboard = async(req, res) =>{
     try {
        const {userId} = req.user; // Get userId from the authenticated user
        let totalIncome = 0;
        let totalExpenses = 0;

        const transactionTotal = await pool.query({
            text: `SELECT type, SUM(amount) AS total_amount FROM transaction
            WHERE user_id = $1 GROUP BY type`,
            values: [userId],
        })
       const transactionAmount = transactionTotal.rows;

       // Calculate total income and expenses from the transaction amounts
       // Iterate through the transaction amounts and sum them up
       transactionAmount.forEach((transaction) =>{
            if(transaction.type === "Income"){
                totalIncome += Number(transaction.total_amount);
            } else {
                totalExpenses += Number(transaction.total_amount);
            }
       });

       const balance = totalIncome - totalExpenses; // Calculate the balance 
       
       //aggregate transactions to sum by type and group by month
       const year = new Date().getFullYear(); // Get the current year
       const startDate = new Date(year, 0, 1); // Start of the year
       const endDate = new Date( year, 11, 31, 23, 59, 59); // End of the year and Time

        console.log("starting Date::: ", startDate.toISOString());
       console.log("Ending Date::: ", endDate.toISOString());

       /// Fetch transactions for the current year
       const resultForYear = await pool.query({
        
        // Query to extract month and sum amount by type
            text: ` SELECT EXTRACT(MONTH FROM createdat) AS month,
            LOWER(type) AS type, SUM(amount) AS total_amount FROM transaction
            WHERE user_id = $1 AND createdat BETWEEN $2 AND $3
            GROUP BY EXTRACT(MONTH FROM createdat), LOWER(type)`,
            
            values: [userId, startDate, endDate ]
       }); 
       console.log("Monthly aggregates:::", resultForYear.rows);    

       // Create an array to hold the monthly data
       const getData = new Array(12).fill(null).map((_, index) =>{
        const monthlyData = resultForYear.rows.filter((item) =>{
            return parseInt(item.month) === index + 1 // Filter data for the current month
            // return Number(item.month) === index + 1 // Filter data for the current month
        });
        const income = Number(monthlyData.find((item) => item.type === "income")?.total_amount || 0);
        const expenses = Number(monthlyData.find((item) => item.type === "expense")?.total_amount || 0);

            return {
                label: getMonthName(index), // Get the month name using the utility function
                income,
                expenses
            }
       });

       // Fetch the last 5 transactions
       const last5Transaction = await pool.query({
        text: `SELECT * FROM transaction WHERE user_id = $1
                ORDER BY id DESC LIMIT 5`,
        values: [userId]
       });

       const lastTransaction = last5Transaction.rows;

       // Fetch the last account transactions
       const lastAccount = await pool.query({
        text: `SELECT * FROM transaction WHERE user_id = $1
                ORDER BY id DESC LIMIT 4`,
        values: [userId]
       });

       const lastAccountResult = lastAccount.rows;

       res.status(200).json({
        status: true,
        message: "Dashboard Display Successful",
        data: {chartData: getData,
        totalIncome,
        totalExpenses,
        balance,
        lastTransaction,
        lastAccountResult,}
       })  
    
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error, Unable to Fetch Dashboard Data",
            error: error.message
        });
    }
}

// Function to add a transaction
// This function will handle adding a new transaction to the database
const addTransaction = async(req, res) =>{
     try {

        const {userId} = req.user; // Get userId from the authenticated user
        const { account_id } = req.params; // Get account_id from the request parameters
        const { amount, description, source } = req.body; // Get amount, description, and status from the request body
        
        // Validate the input data
        if (!amount || !description || !source) {
            return res.status(400).json({
                status: false,
                message: "Amount, description, and source are required"
            });
        }

        // Check if the amount send is zero or less than zero
        if(Number(amount) <= 0){
            return res.status(400).json({
                status: false,
                message: "Amount must be greater than zero"
            });
        }

        // Prepare the query to insert the transaction
        const result = await pool.query({
            text: `SELECT * FROM account WHERE id = $1`,
            values: [ account_id ],
        })

        // Check if the account exists
        if (result.rows.length === 0) { 
            return res.status(404).json({
                status: false,
                message: `Account with ID ${account_id} not found`
            });
        };

        //Get the account information 
        const accountInfo = result.rows[0];
        if(!accountInfo){
            return res.status(404).json({
                status: false,
                message: `Account with ID ${account_id} not found`
            });
        };

        // Check if the account balance is less than or equal
        //  to zero or less than the amount to be added
        if(accountInfo.account_balance <= 0 || accountInfo.account_balance < Number(amount)){
            return res.status(400).json({
                status: false,
                message: " Insufficient account balance "
            });
        };

        // QUERY TO INSERT THE TRANSACTION /  begin 
        await pool.query("BEGIN")

        await pool.query({
            // Update the account balance minus the amount for the transaction
            text:`UPDATE account SET account_balance = account_balance - $1, updatedat = CURRENT_TIMESTAMP
            WHERE id = $2 RETURNING *`, 
            
            values:[amount, account_id],
        })

         await pool.query({
            // Insert the transaction into the transaction table
            text:`INSERT INTO transaction
                            (user_id, description, type, status, amount, source) 
                            VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,

            values:[    userId,
                        description,
                        "Expense",
                        "Completed",
                        amount,
                        source,
                    ],
        })

        // commit the transaction when all the queries are successful
        await pool.query("COMMIT")

        // Return a success response with the updated account information
        res.status(200).json({
            status: true,
            message: "Transaction added successfully",
            data: {
                account_id: accountInfo.id,
                account_name: accountInfo.account_name,
                account_balance: accountInfo.account_balance - Number(amount),
                transaction_amount: amount,
                description: description,
                source: source
            }
        });



    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error, Unable to Add Transaction",
            error: error.message
        });
    }
}

//// Function to transfer money to another account
// This function will handle the transfer of money from one account to another
const transferMoneyToAccount = async(req, res) =>{
     try {
        const { userId} = req.user; // Get userId from the authenticated user

        // Get the from_account_id, to_account_id, and amount from the request body
        // Ensure that the request body contains the necessary fields
        const { from_account_id, to_account_id, amount } = req.body; // Get

        // Validate the input data
        if (!from_account_id || !to_account_id || !amount) {
            return res.status(400).json({
                status: false,
                message: "From account ID, To account ID, and amount are required"
            });
        }

        // Check if the amount is zero or less than zero
        if(Number(amount) <= 0){
            return res.status(400).json({
                status: false,
                message: "Amount must be greater than zero"
            });
        };

        // check account information and balance from the "from_account_id"
        const fromAccountResult = await pool.query({
            text: `SELECT * FROM account WHERE id = $1`,
            values: [from_account_id],
        });

        const fromAccountInfo = fromAccountResult.rows[0]; // Get the first account from the result set

        if (!fromAccountInfo) {
            return res.status(404).json({
                status: false,
                message: `From account with ID ${from_account_id} not found`
            });
        };
        // Check if the from account balance is less than or equal to zero or less 
        // than the amount to be transferred
        if (Number(amount) > fromAccountInfo.account_balance || fromAccountInfo.account_balance <= 0) {
            return res.status(400).json({
                status: false,
                message: "Insufficient account balance in the from account"
            });
        };

        // QUERY TO INSERT THE TRANSACTION /  begin 
        await pool.query("BEGIN")

        //transfer money from  account
        await pool.query({
            // Update the account balance minus the amount for the transaction
            text:`UPDATE account SET account_balance = account_balance - $1, updatedat = CURRENT_TIMESTAMP
            WHERE id = $2 RETURNING *`, 
            
            values:[amount, from_account_id],
        });

        //transfer money to  account
       const toAccount = await pool.query({
            // Update the account balance minus the amount for the transaction
            text:`UPDATE account SET account_balance = account_balance + $1, updatedat = CURRENT_TIMESTAMP
            WHERE id = $2 RETURNING *`, 
            
            values:[amount, to_account_id],
        })

        //Insert the transaction into the transaction table
        const description = `Transfer from ${fromAccountInfo.account_name} to ${toAccount.rows[0].account_name}`;

         await pool.query({
            // Insert the transaction into the transaction table
            text:`INSERT INTO transaction
                            (user_id, description, type, status, amount, source) 
                            VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,

            values:[    userId,
                        description,
                        "Expense",
                        "Completed",
                        amount,
                        fromAccountInfo.account_name
                    ],
        })

        const description1 = `Received from ${fromAccountInfo.account_name} to ${toAccount.rows[0].account_name}`;
        await pool.query({
            // Insert the transaction into the transaction table
            text:`INSERT INTO transaction
                            (user_id, description, type, status, amount, source) 
                            VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,

            values:[    userId,
                        description1,
                        "Income",
                        "Completed",
                        amount,
                        toAccount.rows[0].account_name,
                    ],
        })

        // // commit the transaction when all the queries are successful
        await pool.query("COMMIT")

        // Return a success response with the updated account information
        res.status(200).json({
            status: true,
            message: "Money transferred successfully",
            data: {
                from_account_id: fromAccountInfo.id,
                from_account_name: fromAccountInfo.account_name,
                to_account_id: toAccount.rows[0].id,
                to_account_name: toAccount.rows[0].account_name,
                amount_transferred: amount,
                description: description
            }
        });

        
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error, Unable to Transfer Money",
            error: error.message
        });
    }
}

module.exports={
    transactions,
    dashboard,
    addTransaction,
    transferMoneyToAccount
}