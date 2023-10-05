import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";
import { dbConnection } from "../config/database.js";


export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    // console.log(req.cookies);
    const { token } = req.cookies;
    // console.log(token);
    if (!token) return next(new ErrorHandler("Not Logged In", 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // req.user = await Users.findById(decoded._id);
    const selectUserByIdQuery = 'SELECT * FROM Users WHERE username = ?';

    // Perform the MySQL query
    await dbConnection.query(selectUserByIdQuery, [decoded.username], (queryErr, results) => {
        if (queryErr) {
            return next(new ErrorHandler("failed", 409));
        }

        if (results.length === 0) {
            return next(new ErrorHandler("Not Login", 409));
        }
        console.log('User details:', results[0]);
        const user = results[0];

        // Attach the user data to the request object for further use
        req.user = user;

        // Continue with the next middleware
        next();

    })
});

export const authorizeTeacher = (req, res, next) => {
    console.log(req.user)
    if (req.user.role !== "teacher")
        return next(
            new ErrorHandler(`Only Teacher Can access this resource`, 403)
        );

    next();
};

// export const authorizeAdmin = (req, res, next) => {
//     if (req.user.role !== "admin")
//         return next(
//             new ErrorHandler(
//                 `${req.user.role} is not allowed to access this resource`,
//                 403
//             )
//         );

//     next();
// };
