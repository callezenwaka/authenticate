// provider/src/routes/register.ts
import express from "express";
import url from "url";
import urljoin from "url-join";
import csrf from "csurf";
import { UserService } from "../services";
import { databaseMiddleware } from "../middleware";

// Sets up csrf protection
const csrfProtection = csrf({
  cookie: {
    sameSite: "lax",
  },
});

const router = express.Router();

const userService = new UserService();

router.use(databaseMiddleware(true));

// GET route for registration form
router.get("/", csrfProtection, (req, res) => {
  // Parses the URL query
  const query = url.parse(req.url, true).query

  // Capture the login_challenge if it exists in the query
  const login_challenge = String(query.login_challenge);

  // Also capture any redirect_url
  const redirect_url = query.redirect_url as string | undefined;
  
  res.render("register", {
    csrfToken: req.csrfToken(),
    action: urljoin(process.env.BASE_URL!, "/register"),
    pageTitle: "Authenticate | Register Page",
    login_challenge: login_challenge || '', // Pass it to the template
    redirect_url,
  });
});

// POST route for handling registration
router.post("/", csrfProtection, async (req, res, next) => {
  try {
    const { email, password, username, password_confirm, login_challenge, redirect_url } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.render("register", {
        csrfToken: req.csrfToken(),
        error: "Email and password are required",
        email,
        username,
        login_challenge,
      });
    }
    
    if (password !== password_confirm) {
      return res.render("register", {
        csrfToken: req.csrfToken(),
        error: "Passwords do not match",
        email,
        username,
        login_challenge,
      });
    }
    
    try {
      // Create user
      await userService.registerUser({email, password, username});

      // Build redirect URL with all necessary parameters
      let redirectPath = "/login?registered=true";
      
      if (login_challenge) {
        redirectPath += `&login_challenge=${login_challenge}`;
      }
      
      if (redirect_url) {
        redirectPath += `&redirect_url=${encodeURIComponent(redirect_url)}`;
      }
      
      res.redirect(redirectPath);
    } catch (error) {
      return res.render("register", {
        csrfToken: req.csrfToken(),
        error: (error as Error).message || "Error creating user",
        email,
        username,
        login_challenge,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;