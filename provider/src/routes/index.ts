// Copyright © 2025 Ory Corp
// SPDX-License-Identifier: Apache-2.0

import express from "express"

const router = express.Router()

router.get("/", (req, res) => {
  res.render("index", {
    pageTitle: "Authenticate | Home Page"
  });
  res.render("index")
})

export default router