import mysql from "mysql2";

import { createAllTables } from "../models/CreateTable.js";

export const dbConnection = mysql.createConnection("mysql://root:gRhXFInR1DvhGnoFptuK@containers-us-west-155.railway.app:5748/railway");

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



