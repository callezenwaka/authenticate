// provider/src/routes/register.ts
import express from "express";
import url from "url";
import urljoin from "url-join";
import csrf from "csurf";
import { userService } from "../services/user";
import { databaseMiddleware } from "../middleware";

// Sets up csrf protection
const csrfProtection = csrf({
  cookie: {
    sameSite: "lax",
  },
});

const router = express.Router();

router.use(databaseMiddleware(true));

// GET route for registration form
router.get("/", csrfProtection, (req, res) => {
  // Capture the login_challenge if it exists in the query
  const login_challenge = req.query.login_challenge;
  
  res.render("register", {
    csrfToken: req.csrfToken(),
    action: urljoin(process.env.BASE_URL || "http://localhost:3000", "/register"),
    pageTitle: "Authenticate | Register Page",
    login_challenge: login_challenge || '', // Pass it to the template
  });
});

// POST route for handling registration
router.post("/", csrfProtection, async (req, res, next) => {
  try {
    const { email, password, name, password_confirm, login_challenge } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.render("register", {
        csrfToken: req.csrfToken(),
        error: "Email and password are required",
        email,
        name,
        login_challenge,
      });
    }
    
    if (password !== password_confirm) {
      return res.render("register", {
        csrfToken: req.csrfToken(),
        error: "Passwords do not match",
        email,
        name,
        login_challenge,
      });
    }
    
    try {
      // Create user
      await userService.createUser(email, password, name);
      
      // Redirect to login with success message
      // Include the login challenge if it exists
      if (login_challenge) {
        res.redirect(`/login?registered=true&login_challenge=${login_challenge}`);
      } else {
        res.redirect("/login?registered=true");
      }
    } catch (error) {
      return res.render("register", {
        csrfToken: req.csrfToken(),
        error: (error as Error).message || "Error creating user",
        email,
        name,
        login_challenge,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;