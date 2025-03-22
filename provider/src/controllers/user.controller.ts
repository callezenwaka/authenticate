// provider/src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services';
import { CreateUserDto, LoginUserDto } from '../types';
import url from 'url';
import urljoin from 'url-join';
import { hydraAdmin } from '../config';
import { oidcConformityMaybeFakeAcr } from '../routes/stub/oidc-cert';

export class UserController {
  // List of allowed domains for redirects
  private allowedDomains: string[] = [];
  // Default redirect URL
  private defaultRedirectUrl: string;
  
  constructor(private userService = new UserService()) {
    // Initialize from environment variables
    this.defaultRedirectUrl = process.env.DEFAULT_REDIRECT_URL || "http://localhost:5555";
    const allowedDomainsStr = process.env.ALLOWED_REDIRECT_DOMAINS || "localhost:5555,localhost:3000";
    this.allowedDomains = allowedDomainsStr.split(',').map(domain => domain.trim());
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const newUser = await this.userService.createUser(userData);
      
      // Remove password hash from response
      const { passwordHash, ...userResponse } = newUser;
      
      res.status(201).json({ success: true, data: userResponse });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({ success: false, message: error.message });
      }
      next(error);
    }
  };

  authenticateUser = async (email: string, password: string) => {
    const userData: LoginUserDto = { email, password };
    return this.userService.authenticateUser(userData);
  };

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, challenge } = req.body;
      
      // If there's no challenge, this might be a regular login (not OAuth)
      if (!challenge) {
        console.log("No challenge in login form, handling as regular login");
        try {
          const user = await this.authenticateUser(email, password);
          if (!user) {
            return res.render("login", {
              csrfToken: req.csrfToken(),
              error: "The email or password is incorrect",
              redirect_url: req.body.redirect_url, // Preserve the redirect URL on error
              showOAuthLoginNote: true,
            });
          }
          
          // Regular login success - redirect to client-specified URL or default
          const redirectUrl = this.validateAndGetRedirectUrl(req.body.redirect_url);
          return res.redirect(redirectUrl);
        } catch (error) {
          return next(error);
        }
      }

      // This is an OAuth login
      console.log(`Processing OAuth login with challenge: ${challenge}`);

      // Let's see if the user decided to accept or reject the consent request
      if (req.body.submit === "Deny access") {
        console.log("User denied access");
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
              console.log(`Redirecting after denial to: ${redirect_to}`);
              // All we need to do now is to redirect the browser back to hydra!
              res.redirect(String(redirect_to));
            })
            // This will handle any error that happens when making HTTP calls to hydra
            .catch(next)
        );
      }

      console.log(`Authenticating user: ${email}`);
      // Authenticate the user with the user service
      const user = await this.authenticateUser(email, password);
      
      // If authentication fails, show the login form again with an error
      if (!user) {
        console.log("Authentication failed");
        return res.render("login", {
          csrfToken: req.csrfToken(),
          challenge: challenge,
          error: "The email or password is incorrect",
          action: urljoin(process.env.BASE_URL || "http://localhost:3000", "/login"),
        });
      }

      console.log(`User authenticated successfully: ${user.sub}`);
      // User is authenticated, accept the login request
      const loginRequest = await hydraAdmin.getOAuth2LoginRequest({ 
        loginChallenge: challenge 
      });
      
      console.log("Accepting OAuth login request");
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
      
      console.log(`Redirecting after successful login to: ${redirect_to}`);
      // All we need to do now is to redirect the user back to hydra!
      res.redirect(String(redirect_to));
    } catch (error) {
      console.error("Error in login post handler:", error);
      // Handle any errors
      next(error);
    }
  };

  /**
   * Validates a redirect URL to prevent open redirect vulnerabilities
   * 
   * @param redirectUrl The URL to validate
   * @returns A safe redirect URL (either the validated input or the default)
   */
  private validateAndGetRedirectUrl(redirectUrl?: string): string {
    // If no redirect URL provided, use default
    if (!redirectUrl) {
      return this.defaultRedirectUrl;
    }
    
    try {
      // Parse the URL to extract the hostname
      const parsedUrl = new URL(redirectUrl);
      
      // Check if the hostname is in our allowed list
      for (const domain of this.allowedDomains) {
        if (parsedUrl.host === domain) {
          return redirectUrl;
        }
      }
      
      // If we get here, the domain wasn't in our allowed list
      console.warn(`Redirect to disallowed domain attempted: ${parsedUrl.host}`);
      return this.defaultRedirectUrl;
    } catch (error) {
      // If URL parsing fails, return the default
      console.warn(`Invalid redirect URL: ${redirectUrl}`);
      return this.defaultRedirectUrl;
    }
  }

  getLoginPage = (req: Request, res: Response, next: NextFunction) => {
    // Parses the URL query
    const query = url.parse(req.url, true).query;

    // Check if we're coming from registration without a valid challenge
    if (query.registered === 'true' && !query.login_challenge) {
              // Capture any redirect_url from the query parameters
        const redirectUrl = query.redirect_url as string | undefined;
        
        // Show a simple login page with success message
        return res.render("login", {
          csrfToken: req.csrfToken(),
          challenge: '',
          action: urljoin(process.env.BASE_URL || "http://localhost:3000", "/login"),
          hint: '',
          query: req.query,
          redirect_url: redirectUrl, // Pass through the redirect URL
          pageTitle: "Authenticate | Login Page",
          showOAuthLoginNote: true, // Flag to indicate this is not an OAuth login
        });
    }

    // The challenge is used to fetch information about the login request from ORY Hydra.
    const challenge = String(query.login_challenge || '');
    if (!challenge) {
      next(new Error("Expected a login challenge to be set but received none."));
      return;
    }

    console.log(`Getting login request for challenge: ${challenge}`);

    hydraAdmin
      .getOAuth2LoginRequest({
        loginChallenge: challenge,
      })
      .then((loginRequest) => {
        console.log("Successfully retrieved login request");
        
        // If hydra was already able to authenticate the user, skip will be true
        if (loginRequest.skip) {
          // You can apply logic here, for example update the number of times the user logged in.
          console.log(`User ${loginRequest.subject} already authenticated, skipping login`);

          // Now it's time to grant the login request
          return hydraAdmin
            .acceptOAuth2LoginRequest({
              loginChallenge: challenge,
              acceptOAuth2LoginRequest: {
                // All we need to do is to confirm that we indeed want to log in the user.
                subject: String(loginRequest.subject),
              },
            })
            .then(({ redirect_to }) => {
              console.log(`Redirecting pre-authenticated user to: ${redirect_to}`);
              // All we need to do now is to redirect the user back to hydra!
              res.redirect(String(redirect_to));
            });
        }

        console.log("User needs to log in, showing login form");
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
        });
      })
      .catch(next);
  };
}