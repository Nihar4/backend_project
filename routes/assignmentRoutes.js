import express from "express";

import { createassignments, deletedata, getallAssignments, getsingleAssignment, updateassignments } from "../controllers/assignmentController.js";
import { authorizeTeacher, isAuthenticated } from "../middlewares/auth.js";
// import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// // To register a new user
router.route("/createassignment").post(isAuthenticated, authorizeTeacher, createassignments);

router.route("/updateassignments").put(isAuthenticated, authorizeTeacher, updateassignments);

router.route("/getassignment").get(isAuthenticated, getsingleAssignment);

router.route("/getallassignment").get(isAuthenticated, getallAssignments);

router.route("/deleteassignment").delete(isAuthenticated, authorizeTeacher, deletedata);





export default router;