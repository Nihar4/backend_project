import { dbConnection } from "../config/database.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendEmail.js";

// Create a new assignment

export const getAllUsernames = () => {
    const query = "SELECT username FROM Users";

    dbConnection.query(query, (err, results) => {
        if (err) {
            // console.error(err);
            return res.status(500).json({ error: 'Error to Get All Users' });

        }

        const usernames = results.map((row) => row.username);
        return usernames;
    });
};

export const createassignments = catchAsyncError(async (req, res, next) => {
    const { title, description, due_date, total_score } = req.body;
    const teacher_id = req.user.user_id;

    const createAssignmentQuery = `
      INSERT INTO Assignments (title, description, due_date, total_score, teacher_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    dbConnection.query(
        createAssignmentQuery,
        [title, description, due_date, total_score, teacher_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to create assignment' });
            }
            const assignmentId = result.insertId;
            const to = getAllUsernames();
            // sendEmail(to,sub,mail);
            const message = "Assignment Added";
            sendEmail(["niharpatel4444@gmail.com", "20bce212@nirmauni.ac.in"], "New Assignment Added", message);
            res.status(201).json({ message: 'Assignment created', assignmentId });
        }
    );
});

export const getsingleAssignment = catchAsyncError(async (req, res, next) => {
    const { assignment_id } = req.body;

    try {
        const query = 'SELECT * FROM Assignments WHERE assignment_id = ?';

        dbConnection.query(query, [assignment_id], (checkErr, result) => {
            const data = result[0];
            if (checkErr) {
                return next(new ErrorHandler("Assignment Not Found", 409));
            }
            if (result.length > 0) {
                res.status(201).json({
                    success: true,
                    message: 'Assignment Found successfully',
                    data
                });
            }
            else {
                return next(new ErrorHandler("Assignment not found", 404));
            }
        });

    } catch (error) {
        console.log(error)
        return next(new ErrorHandler("Failed to retrieve assignment", 500));
    }
});

export const getallAssignments = catchAsyncError(async (req, res, next) => {
    try {
        const query = 'SELECT * FROM Assignments';

        dbConnection.query(query, (checkErr, result) => {
            if (checkErr) {
                return next(new ErrorHandler("Assignment Not Found", 409));
            }
            if (result.length > 0) {
                res.status(201).json({
                    success: true,
                    message: 'Assignments Found successfully',
                    result
                });
            }
            else {
                return next(new ErrorHandler("Assignment not found", 404));
            }
        });
    } catch (error) {
        console.log(error)
        return next(new ErrorHandler("Failed to retrieve assignments", 500));
    }
});

//UpdateAssignments
export const updateassignments = catchAsyncError(async (req, res, next) => {
    const { assignment_id, title, description, due_date, total_score } = req.body;
    const teacher_id = req.user.user_id;

    const findAssignmentQuery = `
      SELECT * FROM Assignments WHERE  assignment_id = ?
    `;

    dbConnection.query(
        findAssignmentQuery,
        [assignment_id],
        (err, result) => {
            if (err) {
                return next(new ErrorHandler("Failed to find assignment", 500));
            }
            if (result.length === 0)
                return next(new ErrorHandler("Not Found the assignment", 400));

            const teacherId = result[0].teacher_id;
            // console.log(result, teacherId, teacher_id)
            if (teacherId !== teacher_id)
                return next(new ErrorHandler("You have no rights to Change this Assignment", 400));

            const createAssignmentQuery = `
                UPDATE Assignments
                SET title = ?, description = ?, due_date = ?, total_score = ?, teacher_id = ?
                WHERE assignment_id = ?;
            `;

            dbConnection.query(
                createAssignmentQuery,
                [title, description, due_date, total_score, teacher_id, assignment_id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to update assignment' });
                    }
                    res.status(201).json({ message: 'Assignment updated' });
                }
            );
        }
    );
});


export const deletedata = catchAsyncError(async (req, res, next) => {
    const { assignment_id } = req.body;
    const teacher_id = req.user.user_id;
    const findAssignmentQuery = `
      SELECT * FROM Assignments WHERE  assignment_id = ?
    `;

    dbConnection.query(
        findAssignmentQuery,
        [assignment_id],
        (err, result) => {
            if (err) {
                return next(new ErrorHandler("Failed to find assignment", 500));
            }
            if (result.length === 0)
                return next(new ErrorHandler("Not Found the assignment", 400));

            const teacherId = result[0].teacher_id;
            // console.log(result, teacherId, teacher_id)
            if (teacherId !== teacher_id)
                return next(new ErrorHandler("You have no rights to Change this Assignment", 400));

            const deleteQuery = `DELETE FROM Assignments WHERE assignment_id = ?`;
            dbConnection.query(deleteQuery, [assignment_id], (deleteErr, result) => {
                if (deleteErr) {
                    return next(new ErrorHandler("deletion failed", 409));
                }
                if (result.affectedRows > 0) {
                    res.status(201).json({
                        success: true,
                        message: 'Assignment Deleted successfully',
                    });
                }
                else {
                    return next(new ErrorHandler("Assignment not found", 404));
                }
            });
        }
    );
    // try {
    //     const deleteQuery = `DELETE FROM Assignments WHERE assignment_id = ?`;
    //     dbConnection.query(deleteQuery, [assignment_id], (deleteErr, result) => {
    //         if (deleteErr) {
    //             return next(new ErrorHandler("deletion failed", 409));
    //         }
    //         if (result.affectedRows > 0) {
    //             res.status(201).json({
    //                 success: true,
    //                 message: 'Assignment Deleted successfully',
    //             });
    //         }
    //         else {
    //             return next(new ErrorHandler("Assignment not found", 404));
    //         }
    //     });
    // } catch (error) {
    //     return next(new ErrorHandler("Failed to delete assignment", 500));
    // }
});


