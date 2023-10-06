import express from "express";

import { GiveGrade, StudentReport, SubmitAssignment, createassignments, deletedata, getallAssignments, getsingleAssignment, sortAndFilterAssignments, updateassignments } from "../controllers/assignmentController.js";
import { authorizeStudent, authorizeTeacher, isAuthenticated } from "../middlewares/auth.js";


const router = express.Router();

// // To register a new user
router.route("/createassignment").post(isAuthenticated, authorizeTeacher, createassignments);

router.route("/updateassignments").put(isAuthenticated, authorizeTeacher, updateassignments);

router.route("/getassignment").get(isAuthenticated, getsingleAssignment);

router.route("/getallassignment").get(isAuthenticated, getallAssignments);

router.route("/deleteassignment").delete(isAuthenticated, authorizeTeacher, deletedata);

router.route("/filterassignment").get(isAuthenticated, sortAndFilterAssignments);

router.route("/submitassignment").post(isAuthenticated, authorizeStudent, SubmitAssignment);

router.route("/givegrade").post(isAuthenticated, authorizeTeacher, GiveGrade);

router.route("/student/report/:studentId").get(isAuthenticated, authorizeTeacher, StudentReport);




export default router;