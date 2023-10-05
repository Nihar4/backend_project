import mysql from "mysql";
import { createAllTables } from "../models/CreateTable.js";

export const dbConnection = mysql.createConnection({
    host: 'localhost',
    user: 'project',
    password: 'mysql123',
    database: 'project'
});

export const connectDB = async () => {
    // Connect to the database
    dbConnection.connect(err => {
        if (err) {
            console.error('Error connecting to the database: ' + err.stack);
            return;
        }
        console.log('Connected to the database as ID ' + dbConnection.threadId);
        createAllTables();
    });
}



