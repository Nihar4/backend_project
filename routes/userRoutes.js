import express from "express";
import {

    register,

} from "../controllers/userController.js";
// import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// // To register a new user
router.route("/register").post(register);

// // Login
// router.route("/login").post(login);

// // logout
// router.route("/logout").get(logout);





export default router;