// src/routes/login.ts
import express, { Request, Response, NextFunction } from "express"
import url from "url"
import urljoin from "url-join"
import csrf from "csurf"
import { hydraAdmin } from "../config"
import { oidcConformityMaybeFakeAcr } from "./stub/oidc-cert"
import { userService } from "../services/user" // Import the user service

// Sets up csrf protection
const csrfProtection = csrf({
  cookie: {
    sameSite: "lax",
  },
})
const router = express.Router()

router.get("/", csrfProtection, (req: Request, res: Response, next: NextFunction) => {
  // Parses the URL query
  const query = url.parse(req.url, true).query

  // Check if we're coming from registration without a valid challenge
  if (query.registered === 'true' && !query.login_challenge) {
    // Show a simple login page with success message
    return res.render("login", {
      csrfToken: req.csrfToken(),
      challenge: '',
      action: urljoin(process.env.BASE_URL || "http://localhost:3000", "/login"),
      hint: '',
      query: req.query,
      pageTitle: "Authenticate | Login Page",
      showOAuthLoginNote: true, // Flag to indicate this is not an OAuth login
    });
  }

  // The challenge is used to fetch information about the login request from ORY Hydra.
  const challenge = String(query.login_challenge || '')
  if (!challenge) {
    next(new Error("Expected a login challenge to be set but received none."))
    return
  }

  console.log(`Getting login request for challenge: ${challenge}`)

  hydraAdmin
    .getOAuth2LoginRequest({
      loginChallenge: challenge,
    })
    .then((loginRequest) => {
      console.log("Successfully retrieved login request")
      
      // If hydra was already able to authenticate the user, skip will be true and we do not need to re-authenticate
      // the user.
      if (loginRequest.skip) {
        // You can apply logic here, for example update the number of times the user logged in.
        console.log(`User ${loginRequest.subject} already authenticated, skipping login`)

        // Now it's time to grant the login request. You could also deny the request if something went terribly wrong
        // (e.g. your arch-enemy logging in...)
        return hydraAdmin
          .acceptOAuth2LoginRequest({
            loginChallenge: challenge,
            acceptOAuth2LoginRequest: {
              // All we need to do is to confirm that we indeed want to log in the user.
              subject: String(loginRequest.subject),
            },
          })
          .then(({ redirect_to }) => {
            console.log(`Redirecting pre-authenticated user to: ${redirect_to}`)
            // All we need to do now is to redirect the user back to hydra!
            res.redirect(String(redirect_to))
          })
      }

      console.log("User needs to log in, showing login form")
      // If authentication can't be skipped we MUST show the login UI.
      res.render("login", {
        csrfToken: req.csrfToken(),
        challenge: challenge,
        action: urljoin(process.env.BASE_URL || "http://localhost:3000", "/login"),
        hint: loginRequest.oidc_context?.login_hint || "",
        clientName: loginRequest.client.client_name || loginRequest.client.client_id,
        requestedScopes: loginRequest.requested_scope || [],
        query: req.query, // Pass query params to show registration success message
        pageTitle: "Authenticate | Login Page",
        showOAuthLoginNote: false,
      })
    })
    .catch(error => {
      console.error("Error getting login request:", error)
      if (error.response) {
        console.error("Response status:", error.response.status)
        console.error("Response data:", error.response.data)
      }
      next(error)
    })
})

router.post("/", csrfProtection, async (req: Request, res: Response, next: NextFunction) => {
  // The challenge is now a hidden input field, so let's take it from the request body instead
  const challenge = req.body.challenge
  
  // If there's no challenge, this might be a regular login (not OAuth)
  if (!challenge) {
    console.log("No challenge in login form, handling as regular login")
    try {
      const user = await userService.authenticate(req.body.email, req.body.password)
      if (!user) {
        return res.render("login", {
          csrfToken: req.csrfToken(),
          error: "The email or password is incorrect",
          showOAuthLoginNote: true,
        })
      }
      
      // Regular login success - redirect to main application
      return res.redirect("http://localhost:5555")
    } catch (error) {
      return next(error)
    }
  }

  // This is an OAuth login
  console.log(`Processing OAuth login with challenge: ${challenge}`)

  // Let's see if the user decided to accept or reject the consent request..
  if (req.body.submit === "Deny access") {
    console.log("User denied access")
    // Looks like the consent request was denied by the user
    return (
      hydraAdmin
        .rejectOAuth2LoginRequest({
          loginChallenge: challenge,
          rejectOAuth2Request: {
            error: "access_denied",
            error_description: "The resource owner denied the request",
          },
        })
        .then(({ redirect_to }) => {
          console.log(`Redirecting after denial to: ${redirect_to}`)
          // All we need to do now is to redirect the browser back to hydra!
          res.redirect(String(redirect_to))
        })
        // This will handle any error that happens when making HTTP calls to hydra
        .catch(next)
    )
  }

  try {
    console.log(`Authenticating user: ${req.body.email}`)
    // Authenticate the user with the user service
    const user = await userService.authenticate(req.body.email, req.body.password)
    
    // If authentication fails, show the login form again with an error
    if (!user) {
      console.log("Authentication failed")
      return res.render("login", {
        csrfToken: req.csrfToken(),
        challenge: challenge,
        error: "The email or password is incorrect",
        action: urljoin(process.env.BASE_URL || "http://localhost:3000", "/login"),
      })
    }

    console.log(`User authenticated successfully: ${user.id}`)
    // User is authenticated, accept the login request
    const loginRequest = await hydraAdmin.getOAuth2LoginRequest({ 
      loginChallenge: challenge 
    })
    
    console.log("Accepting OAuth login request")
    await hydraAdmin.acceptOAuth2LoginRequest({
      loginChallenge: challenge,
      acceptOAuth2LoginRequest: {
        // Use the user's ID as the subject
        subject: user.id,

        // This tells hydra to remember the browser and automatically authenticate the user in future requests. This will
        // set the "skip" parameter in the other route to true on subsequent requests!
        remember: Boolean(req.body.remember),

        // When the session expires, in seconds. Set this to 0 so it will never expire.
        remember_for: 3600,

        // Sets which "level" (e.g. 2-factor authentication) of authentication the user has. The value is really arbitrary
        // and optional. In the context of OpenID Connect, a value of 0 indicates the lowest authorization level.
        // acr: '0',
        //
        // If the environment variable CONFORMITY_FAKE_CLAIMS is set we are assuming that
        // the app is built for the automated OpenID Connect Conformity Test Suite. You
        // can peak inside the code for some ideas, but be aware that all data is fake
        // and this only exists to fake a login system which works in accordance to OpenID Connect.
        //
        // If that variable is not set, the ACR value will be set to the default passed here ('0')
        acr: oidcConformityMaybeFakeAcr(loginRequest, "0"),
      },
    }).then(({ redirect_to }) => {
      console.log(`Redirecting after successful login to: ${redirect_to}`)
      // All we need to do now is to redirect the user back to hydra!
      res.redirect(String(redirect_to))
    })
  } catch (error) {
    console.error("Error in login post handler:", error)
    // Handle any errors
    next(error)
  }
})

export default router