import express from "express";
import url from "url";
import urljoin from "url-join";
import csrf from "csurf";
import { userService } from "../services/user";

// Sets up csrf protection
const csrfProtection = csrf({
  cookie: {
    sameSite: "lax",
  },
});

const router = express.Router();

// GET route for registration form
router.get("/", csrfProtection, (req, res) => {
  res.render("register", {
    csrfToken: req.csrfToken(),
    action: urljoin(process.env.BASE_URL || "", "/register"),
    pageTitle: "Authenticate | Register Page",
  });
});

// POST route for handling registration
router.post("/", csrfProtection, async (req, res, next) => {
  try {
    const { email, password, name, password_confirm } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.render("register", {
        csrfToken: req.csrfToken(),
        error: "Email and password are required",
        email,
        name,
      });
    }
    
    if (password !== password_confirm) {
      return res.render("register", {
        csrfToken: req.csrfToken(),
        error: "Passwords do not match",
        email,
        name,
      });
    }
    
    try {
      // Create user
      await userService.createUser(email, password, name);
      
      // Redirect to login with success message
      res.redirect("/login?registered=true");
    } catch (error) {
      return res.render("register", {
        csrfToken: req.csrfToken(),
        error: (error as Error).message || "Error creating user",
        email,
        name,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;