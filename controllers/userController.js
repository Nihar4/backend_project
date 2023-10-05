import { dbConnection } from "../config/database.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Register EndPoint
export const register = catchAsyncError(async (req, res, next) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role)
        return next(new ErrorHandler("Please enter all fields", 400));

    if (role !== "teacher" && role !== "student")
        return next(new ErrorHandler("Please enter correct role", 400));

    const checkUserQuery = 'SELECT * FROM Users WHERE username = ?';
    dbConnection.query(checkUserQuery, [username], async (checkErr, results) => {
        if (checkErr) {
            return next(new ErrorHandler("Registration failed", 409));
        }
        if (results.length > 0) {
            return next(new ErrorHandler("User Already Exists", 409));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = 'INSERT INTO Users (username, password, role) VALUES (?, ?, ?)';
        dbConnection.query(insertUserQuery, [username, hashedPassword, role], (insertErr, result) => {
            if (insertErr) {
                return next(new ErrorHandler("Registration failed", 409));
            }
            const token = jwt.sign({ username: username, role: role }, process.env.JWT_SECRET, {
                expiresIn: "15d",
            });
            const options = {
                expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                // httpOnly: true,
                // secure: true,
                // sameSite: "none",
                httpOnly: false,
                secure: false,
                sameSite: false,
            };

            res.status(200).cookie("token", token, options).json({
                success: true,
                message: 'Registration successful'
            });
        });
    });
});


// Login EndPoint
export const login = catchAsyncError(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password)
        return next(new ErrorHandler("Please enter all fields", 400));

    const checkUserQuery = 'SELECT * FROM Users WHERE username = ?';
    dbConnection.query(checkUserQuery, [username], async (checkErr, results) => {
        if (checkErr) {
            return next(new ErrorHandler("Login failed", 409));
        }

        if (results.length === 0) {
            return next(new ErrorHandler("Incorrect Email or Password", 401));
        }

        const user = results[0];

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return next(new ErrorHandler("Incorrect Email or Password", 401));
        }

        const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "15d",
        });
        const options = {
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            // httpOnly: true,
            // secure: true,
            // sameSite: "none",
            httpOnly: false,
            secure: false,
            sameSite: false,
        };

        res.status(200).cookie("token", token, options).json({
            success: true,
            message: 'Login successful',
            user
        });

    });
});





