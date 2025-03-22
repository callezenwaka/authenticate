// provider/src/routes/login.ts
import express from "express"
import csrf from "csurf"
import { UserController } from "../controllers"

// Sets up csrf protection
const csrfProtection = csrf({
  cookie: {
    sameSite: "lax",
  },
})
const router = express.Router()

const userController = new UserController();

// GET route for the login page
router.get("/", csrfProtection, userController.getLoginPage);

// POST route for handling login submissions
router.post("/", csrfProtection, userController.authenticate);

export default router