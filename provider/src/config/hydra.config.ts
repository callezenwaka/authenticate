// src/config/index.ts

import { Configuration, OAuth2Api } from "@ory/hydra-client-fetch"

const baseOptions: any = {
  timeout: 15000, // 15 seconds should be plenty
}
// Use localhost to connect to the Hydra admin API
const HYDRA_ADMIN_URL = process.env.HYDRA_ADMIN_URL || 'http://localhost:4445';

console.log(`Connecting to Hydra Admin API at: ${HYDRA_ADMIN_URL}`);

if (process.env.MOCK_TLS_TERMINATION) {
  baseOptions.headers = { "X-Forwarded-Proto": "https" }
}

// baseOptions: {
//   timeout: 15000, // 15 seconds should be plenty
// }

const hydraConfig = new Configuration({
  basePath: HYDRA_ADMIN_URL,
  accessToken: process.env.ORY_API_KEY || process.env.ORY_PAT,
  headers: baseOptions.headers,
})

// Export the hydra admin client
export const hydraAdmin = new OAuth2Api(hydraConfig);