import { dbConnection } from "../config/database.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

// app.post('/register', async (req, res) => {
//     const { username, password, role } = req.body;

//     try {
//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Insert user into the Users table
//         const insertUserQuery = 'INSERT INTO Users (username, password, role) VALUES (?, ?, ?)';
//         dbConnection.query(insertUserQuery, [username, hashedPassword, role], (err, result) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ error: 'Registration failed' });
//             }

//             res.status(201).json({ message: 'Registration successful' });
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Registration failed' });
//     }
// });

export const register = catchAsyncError(async (req, res, next) => {
    const { username, password, role } = req.body;

    console.log(username, password, role);
    if (!username || !password || !role)
        return next(new ErrorHandler("Please enter all fields", 400));

    // Check if a user with the same username already exists in the MySQL database
    const checkUserQuery = 'SELECT * FROM Users WHERE username = ?';
    dbConnection.query(checkUserQuery, [username], async (checkErr, results) => {
        if (checkErr) {
            console.error(checkErr);
            return res.status(500).json({ error: 'Registration failed' });
        }

        if (results.length > 0) {
            return next(new ErrorHandler("User Already Exists", 409));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the Users table
        const insertUserQuery = 'INSERT INTO Users (username, password, role) VALUES (?, ?, ?)';
        dbConnection.query(insertUserQuery, [username, hashedPassword, role], (insertErr, result) => {
            if (insertErr) {
                console.error(insertErr);
                return res.status(500).json({ error: 'Registration failed' });
            }

            res.status(201).json({ message: 'Registration successful' });
        });
    });
});


// Login Endpoint
// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         // Retrieve user from the database by username
//         const getUserQuery = 'SELECT * FROM Users WHERE username = ?';
//         dbConnection.query(getUserQuery, [username], async (err, results) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ error: 'Login failed' });
//             }

//             if (results.length === 0) {
//                 return res.status(401).json({ error: 'Authentication failed' });
//             }

//             const user = results[0];

//             // Compare the provided password with the stored hashed password
//             const passwordMatch = await bcrypt.compare(password, user.password);

//             if (!passwordMatch) {
//                 return res.status(401).json({ error: 'Authentication failed' });
//             }

//             // Create and send a JWT token
//             const token = jwt.sign({ userId: user.user_id, role: user.role }, 'your_secret_key', {
//                 expiresIn: '1h', // Set the token expiration time
//             });

//             res.status(200).json({ token });
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Login failed' });
//     }
// });



// export const login = catchAsyncError(async (req, res, next) => {
//     const { email, password } = req.body;

//     if (!email || !password)
//         return next(new ErrorHandler("Please enter all field", 400));

//     const user = await Users.findOne({ email }).select("+password");

//     if (!user) return next(new ErrorHandler("Incorrect Email or Password", 401));

//     const isMatch = await user.comparePassword(password);

//     if (!isMatch)
//         return next(new ErrorHandler("Incorrect Email or Password", 401));

//     sendToken(res, user, `Welcome back, ${user.name}`, 200);
// });

// export const logout = catchAsyncError(async (req, res, next) => {
//     res
//         .status(200)
//         .cookie("token", "", {
//             expires: new Date(Date.now()),
//             httpOnly: false,
//             secure: false,
//             sameSite: false,
//         })
//         .json({
//             success: true,
//             message: "Logged Out Successfully",
//         });
// });