// Copyright © 2025 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import express from "express"
import url from "url"
import csrf from "csurf"
import { hydraAdmin } from "../config"

// Sets up csrf protection
const csrfProtection = csrf({ cookie: true })
const router = express.Router()

router.get("/verify", csrfProtection, (req, res, next) => {
  // Parses the URL query
  const query = url.parse(req.url, true).query

  // The challenge is used to fetch information about the login request from ORY Hydra.
  const challenge = String(query.device_challenge)
  if (!challenge) {
    next(new Error("Expected a device challenge to be set but received none."))
    return
  }

  res.render("device/verify", {
    csrfToken: req.csrfToken(),
    challenge,
    userCode: String(query.user_code),
    pageTitle: "Authenticate | Verify Page",
  })
})

router.post("/verify", csrfProtection, (req, res, next) => {
  // The code is a input field, so let's take it from the request body
  const { code: userCode, challenge } = req.body
  // All we need to do now is to redirect the user back to hydra!
  hydraAdmin
    .acceptUserCodeRequest({
      deviceChallenge: challenge,
      acceptDeviceUserCodeRequest: {
        user_code: userCode,
      },
    })
    .then(({ redirect_to }) => {
      // All we need to do now is to redirect the user back to hydra!
      res.redirect(String(redirect_to))
    })
    .catch(next)
})

router.get("/success", csrfProtection, (req, res, next) => {
  res.render("device/success", {
    csrfToken: req.csrfToken(),
    pageTitle: "Authenticate | Success Page",
  })
})

export default router