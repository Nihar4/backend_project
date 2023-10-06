import { dbConnection } from "../config/database.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";


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
            // sendEmail(to, "New Assignment Added", message);
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
});

export const sortAndFilterAssignments = catchAsyncError(async (req, res, next) => {
    const { startDate, endDate, sortBy } = req.query;

    if (!startDate || !endDate) {
        return next(new ErrorHandler("Start date, end date, and sort option are required", 400));
    }

    let orderByClause;
    if (sortBy === 'due_date_asc') {
        orderByClause = 'ORDER BY due_date ASC';
    } else if (sortBy === 'total_marks_desc') {
        orderByClause = 'ORDER BY total_score DESC';
    } else {
        orderByClause = ''
        // return next(new ErrorHandler("Invalid sort option", 400));
    }

    const filterQuery = `
        SELECT * FROM Assignments
        WHERE due_date BETWEEN ? AND ?
        ${orderByClause}
    `;

    dbConnection.query(filterQuery, [startDate, endDate], (err, results) => {
        if (err) {
            return next(new ErrorHandler("Failed to fetch and sort assignments", 500));
        }

        res.status(201).json({
            success: true,
            assignments: results,
        });
    });
});



export const SubmitAssignment = catchAsyncError(async (req, res, next) => {

    const { assignment_id, submission_text } = req.body;
    const student_id = req.user.user_id; // Assuming student ID is available in req.user.user_id

    // Check if the assignment exists
    const findAssignmentQuery = 'SELECT * FROM Assignments WHERE assignment_id = ?';
    dbConnection.query(findAssignmentQuery, [assignment_id], async (err, assignmentResults) => {
        if (err) {
            return next(new ErrorHandler("Failed to find assignment", 500));
        }

        if (assignmentResults.length === 0) {
            return next(new ErrorHandler("Assignment not found", 404));
        }

        // Check if the assignment submission already exists for the same student
        const findSubmissionQuery = 'SELECT * FROM AssignmentSubmissions WHERE assignment_id = ? AND student_id = ?';
        dbConnection.query(findSubmissionQuery, [assignment_id, student_id], async (err, submissionResults) => {
            if (err) {
                return next(new ErrorHandler("Failed to check assignment submission", 500));
            }

            // If a submission already exists, you may choose to update it instead of creating a new one
            if (submissionResults.length > 0) {
                const updateSubmissionQuery = 'UPDATE AssignmentSubmissions SET submission_text = ? WHERE assignment_id = ? AND student_id = ?';
                dbConnection.query(updateSubmissionQuery, [submission_text, assignment_id, student_id], (err, updateResult) => {
                    if (err) {
                        return next(new ErrorHandler("Failed to update assignment submission", 500));
                    }

                    res.status(200).json({ success: true, message: 'Assignment submission updated successfully' });
                });
            } else {
                // Create a new assignment submission
                const createSubmissionQuery = 'INSERT INTO AssignmentSubmissions (assignment_id, student_id, submission_text) VALUES (?, ?, ?)';
                dbConnection.query(createSubmissionQuery, [assignment_id, student_id, submission_text], (err, createResult) => {
                    if (err) {
                        return next(new ErrorHandler("Failed to create assignment submission", 500));
                    }

                    res.status(201).json({ success: true, message: 'Assignment submitted successfully' });
                });
            }
        });
    });

})


// Create an API endpoint for teachers to give grades to assignment submissions
export const GiveGrade = catchAsyncError(async (req, res, next) => {
    const { assignment_id, student_id, grade, comments } = req.body;
    const teacher_id = req.user.user_id; // Assuming teacher ID is available in req.user.user_id

    // Check if the assignment exists
    const findAssignmentQuery = 'SELECT * FROM Assignments WHERE assignment_id = ?';
    dbConnection.query(findAssignmentQuery, [assignment_id], async (err, assignmentResults) => {
        if (err) {
            return next(new ErrorHandler("Failed to find assignment", 500));
        }

        if (assignmentResults.length === 0) {
            return next(new ErrorHandler("Assignment not found", 404));
        }

        const assignment = assignmentResults[0];

        // Check if the teacher is the owner of the assignment
        if (assignment.teacher_id !== teacher_id) {
            return next(new ErrorHandler("You have no rights to grade this assignment", 403));
        }

        // Check if the grade is not more than the total marks of the assignment
        if (grade > assignment.total_score) {
            return next(new ErrorHandler("Grade cannot be more than the total marks", 400));
        }

        // Check if the submission exists
        const findSubmissionQuery = 'SELECT * FROM AssignmentSubmissions WHERE assignment_id = ? AND student_id = ?';
        dbConnection.query(findSubmissionQuery, [assignment_id, student_id], async (err, submissionResults) => {
            if (err) {
                return next(new ErrorHandler("Failed to check assignment submission", 500));
            }

            if (submissionResults.length === 0) {
                return next(new ErrorHandler("Submission not found", 404));
            }
            const findSubmissionQuery = 'SELECT * FROM AssignmentGrades WHERE assignment_id = ? AND student_id = ?';
            dbConnection.query(findSubmissionQuery, [assignment_id, student_id], async (err, submissionResults) => {
                if (err) {
                    return next(new ErrorHandler("Failed to check assignment submission", 500));
                }

                // If a submission already exists, you may choose to update it instead of creating a new one
                if (submissionResults.length > 0) {
                    const updateGradeQuery = 'UPDATE AssignmentGrades SET grade = ?, comments = ? WHERE assignment_id = ? AND student_id = ?';

                    dbConnection.query(updateGradeQuery, [grade, comments, assignment_id, student_id], (err, updateResult) => {
                        if (err) {
                            return next(new ErrorHandler("Failed to update assignment grade", 500));
                        }

                        res.status(200).json({ success: true, message: 'Grade updated successfully' });
                    });
                } else {
                    // Create a new assignment submission
                    const createSubmissionQuery = 'INSERT INTO AssignmentGrades (assignment_id, student_id,teacher_id,grade,comments) VALUES (?, ?, ?,?,?)';
                    dbConnection.query(createSubmissionQuery, [assignment_id, student_id, teacher_id, grade, comments], (err, createResult) => {
                        if (err) {
                            return next(new ErrorHandler("Failed to create assignment submission", 500));
                        }

                        res.status(201).json({ success: true, message: 'Grade submitted successfully' });
                    });
                }
            });
            // Update the grade and comments for the assignment submission

        });
    });

});

export const StudentReport = catchAsyncError(async (req, res, next) => {
    const studentId = req.params.studentId;
    const reportQuery = `
    SELECT 
    A.title AS assignment_title,
    A.due_date AS due_date,
    ASUB.submission_date AS submission_date,
    A.total_score AS total_marks,
    AG.grade AS given_grade,
    U.username AS teacher_name 
    FROM Assignments AS A
    LEFT JOIN AssignmentSubmissions AS ASUB ON A.assignment_id = ASUB.assignment_id AND ASUB.student_id = ?
    LEFT JOIN AssignmentGrades AS AG ON A.assignment_id = AG.assignment_id AND AG.student_id = ?
    LEFT JOIN Users AS U ON A.teacher_id = U.user_id
`;

    dbConnection.query(reportQuery, [studentId, studentId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch student report' });
        }

        const studentReport = results.map((row) => {
            const assignmentDetails = {
                assignment_title: row.assignment_title,
                due_date: row.due_date.toISOString().split('T')[0],
                submission_date: row.submission_date
                    ? row.submission_date.toISOString().split('T')[0]
                    : 'Not submitted',
                total_marks: row.total_marks,
                given_grade: row.given_grade !== null ? row.given_grade : 'Not given',
                teacher_name: row.teacher_name,
            };
            return assignmentDetails;
        });

        res.status(200).json({ student_report: studentReport });
    });
});

