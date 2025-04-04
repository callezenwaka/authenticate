// provider/src/routes/login.ts
import express, { Request, Response, NextFunction } from "express"
import csrf from "csurf"
import url from "url"
import urljoin from "url-join"
import { oidcConformityMaybeFakeAcr } from "./stub/oidc-cert";
import { logger } from "../utils"
import { hydraAdmin } from "../config"
import { UserService } from "../services";
import { databaseMiddleware } from "../middleware";

// Sets up csrf protection
const csrfProtection = csrf({
  cookie: {
    sameSite: "lax",
  },
})
const router = express.Router()

const userService = new UserService();

router.use(databaseMiddleware(true));

router.get("/", csrfProtection, async (req: Request, res: Response, next: NextFunction) => {
  // Parses the URL query
  const query = url.parse(req.url, true).query;

  // Check if we're coming from registration without a valid challenge
  if (query.registered === 'true' && !query.login_challenge) {
    // Capture any redirect_url from the query parameters
    const redirect_url = query.redirect_url as string | undefined;

    // Show a simple login page with success message
    return res.render("login", {
      csrfToken: req.csrfToken(),
      challenge: '',
      action: urljoin(process.env.BASE_URL!, "/login"),
      hint: '',
      query: req.query,
      redirect_url, // Pass through the redirect URL
      pageTitle: "Authenticate | Login Page",
      showOAuthLoginNote: true, // Flag to indicate this is not an OAuth login
    });
  }

  // The challenge is used to fetch information about the login request from ORY Hydra.
  const challenge = String(query.login_challenge)
  if (!challenge) {
    next(new Error("Expected a login challenge to be set but received none."));
    return;
  }

  hydraAdmin
    .getOAuth2LoginRequest({
      loginChallenge: challenge,
    })
    .then((loginRequest) => {
      // If hydra was already able to authenticate the user, skip will be true and we do not need to re-authenticate
      // the user.
      if (loginRequest.skip) {
        // You can apply logic here, for example update the number of times the user logged in.
        // ...

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
            // All we need to do now is to redirect the user back to hydra!
            res.redirect(String(redirect_to))
          })
      }

      // If authentication can't be skipped we MUST show the login UI.
      res.render("login", {
        csrfToken: req.csrfToken(),
        challenge: challenge,
        action: urljoin(process.env.BASE_URL!, "/login"),
        hint: loginRequest.oidc_context?.login_hint || "",
        clientName: loginRequest.client.client_name || loginRequest.client.client_id,
        requestedScopes: loginRequest.requested_scope || [],
        query: req.query, // Pass query params to show registration success message
        pageTitle: "Authenticate | Login Page",
        showOAuthLoginNote: false,
      });
    })
    // This will handle any error that happens when making HTTP calls to hydra
    .catch(next)
})

router.post("/", csrfProtection, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // The challenge is now a hidden input field, so let's take it from the request body instead
    const { email, password, challenge, redirect_url } = req.body;

    // If there's no challenge, this might be a regular login (not OAuth)
    if (!challenge) {
      try {
        const user = await userService.loginUser({ email, password });
        if (!user) {
          return res.render("login", {
            csrfToken: req.csrfToken(),
            error: "The email or password is incorrect",
            redirect_url, // Preserve the redirect URL on error
            showOAuthLoginNote: true,
          });
        }

        // Regular login success - redirect to client-specified URL or default
        return res.redirect(redirect_url);
      } catch (error) {
        return next(error);
      }
    }

    // Let's see if the user decided to accept or reject the consent request..
    if (req.body.submit === "Deny access") {
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
            // All we need to do now is to redirect the browser back to hydra!
            res.redirect(String(redirect_to))
          })
          // This will handle any error that happens when making HTTP calls to hydra
          .catch(next)
      )
    }

    // Authenticate the user with the user service
    const user = await userService.loginUser({ email, password });

    // If authentication fails, show the login form again with an error
    if (!user) {
      return res.render("login", {
        csrfToken: req.csrfToken(),
        challenge: challenge,
        error: "The email or password is incorrect",
        action: urljoin(process.env.BASE_URL!, "/login"),
      });
    }

    // User is authenticated, accept the login request
    const loginRequest = await hydraAdmin.getOAuth2LoginRequest({
      loginChallenge: challenge
    });

    const { redirect_to } = await hydraAdmin.acceptOAuth2LoginRequest({
      loginChallenge: challenge,
      acceptOAuth2LoginRequest: {
        // Use the user's ID as the subject
        subject: user.sub,

        // This tells hydra to remember the browser and automatically authenticate the user in future requests
        remember: Boolean(req.body.remember),

        // When the session expires, in seconds. Set this to 0 so it will never expire.
        remember_for: 3600,

        // Sets which "level" of authentication the user has
        acr: oidcConformityMaybeFakeAcr(loginRequest, "0"),
      },
    });

    // All we need to do now is to redirect the user back to hydra!
    res.redirect(String(redirect_to));

  } catch (error) {
    logger.error("Error in login post handler:", error);
    // Handle any errors
    next(error);
  }
})

export default router