import { dbConnection } from "../config/database.js";

// Function to create a table
function createTable(sql, tableName) {
  dbConnection.query(sql, (err, results) => {
    if (err) {
      console.error(`Error creating ${tableName} table: ${err}`);
      return;
    }
    console.log(`${tableName} table created`);
  });
}


// Create Users table
const usersTableSQL = `
  CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,  
    password VARCHAR(255) NOT NULL,
    role ENUM('teacher', 'student') NOT NULL
);
`;

// Create Assignments table
const assignmentsTableSQL = `
  CREATE TABLE IF NOT EXISTS Assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    total_score INT,
    teacher_id INT,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES Users(user_id)
  )
`;

// Create AssignmentSubmissions table
const assignmentSubmissionsTableSQL = `
  CREATE TABLE IF NOT EXISTS AssignmentSubmissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT,
    student_id INT,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_text TEXT,
    FOREIGN KEY (assignment_id) REFERENCES Assignments(assignment_id),
    FOREIGN KEY (student_id) REFERENCES Users(user_id)
  )
`;

// Create AssignmentGrades table
const assignmentGradesTableSQL = `
  CREATE TABLE IF NOT EXISTS AssignmentGrades (
    grade_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT,
    student_id INT,
    teacher_id INT,
    grade INT,
    comments TEXT,
    FOREIGN KEY (assignment_id) REFERENCES Assignments(assignment_id),
    FOREIGN KEY (student_id) REFERENCES Users(user_id),
    FOREIGN KEY (teacher_id) REFERENCES Users(user_id)
  )
`;

// Create AssignmentReports table
// const assignmentReportsTableSQL = `
//   CREATE TABLE IF NOT EXISTS AssignmentReports (
//     report_id INT AUTO_INCREMENT PRIMARY KEY,
//     student_id INT,
//     assignment_id INT,
//     submission_id INT,
//     grade_id INT,
//     submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     grade_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     grade INT,
//     comments TEXT,
//     FOREIGN KEY (student_id) REFERENCES Users(user_id),
//     FOREIGN KEY (assignment_id) REFERENCES Assignments(assignment_id),
//     FOREIGN KEY (submission_id) REFERENCES AssignmentSubmissions(submission_id),
//     FOREIGN KEY (grade_id) REFERENCES AssignmentGrades(grade_id)
//   )
// `;

// Call the createTable function for each table
export const createAllTables = async () => {
  // Connect to the database
  createTable(usersTableSQL, 'Users');
  createTable(assignmentsTableSQL, 'Assignments');
  createTable(assignmentSubmissionsTableSQL, 'AssignmentSubmissions');
  createTable(assignmentGradesTableSQL, 'AssignmentGrades');
  // createTable(assignmentReportsTableSQL, 'AssignmentReports');
}


// student subid assid gradeid 
