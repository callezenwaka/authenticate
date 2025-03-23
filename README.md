# Hydra Authentication System

This project implements a complete OAuth 2.0 and OpenID Connect authentication system using Ory Hydra, TypeScript, and Express.js.

## Project folder structure
```bash
hydra-auth-system/
├── .gitignore                # Git ignore file
├── README.md                 # Project documentation
├── package.json              # Root package.json for workspaces
├── docker-compose.yml        # Docker compose for local development
├── provider/                 # Identity Provider package 
├── frontend/                 # Front Application package 
├── client/                   # Client Application package 
├── backend/                  # Server package 
└── scripts/                  # Utility scripts for the project
```

## Components

The system consists of three main components:

1. **Identity Provider**: Handles user authentication and consent
2. **Client Application**: A sample application that uses the authentication system
3. **Resource Server**: A protected API that validates access tokens

## Architecture

```
┌─────────────┐      ┌───────────────┐      ┌──────────────┐
│             │      │               │      │              │
│    Client   │─────▶│ Hydra Server  │─────▶│  Identity    │
│ Application │◀─────│  (OAuth2)     │◀─────│  Provider    │
│             │      │               │      │              │
└─────────────┘      └───────────────┘      └──────────────┘
                            │  ▲
                            ▼  │
                     ┌─────────────────┐
                     │                 │
                     │    Resource     │
                     │     Server      │
                     │                 │
                     └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js (v14+)
- Docker and Docker Compose
- npm or yarn

### Setup and clone the repository:
```bash
git clone https://github.com/callezenwaka/authticate.git
cd authticate
```

### Environment Variables

Each package has its own `.env` file for configuration. Example environment variables can be found in `.env.example` files in each package directory.

### Development

Spin in hybrid
```bash
# Start docker components
docker-compose down -v && docker-compose up -d

# Comfirm database is running
docker exec -it authenticate-app-postgres-1 psql -U app_user -d app_db

# Confirm hydra logs
docker logs --tail 20 authenticate-hydra-1

# Start backend server
npm run dev # npm run start:dev - for initialization

# Start provider server
npm run dev # npm run start:dev - for initialization

# Start client server
npm run dev
```

Each component is in its own package under the root directory:

- `provider`: The authentication service
- `frontend`: A sample client application
- `backend`: A sample protected API

You can run each package individually:

```bash
# Identity Provider
cd packages/provider
npm i
npm run dev

# Client Application
cd packages/frontend
npm i
npm run dev

# Resource Server
cd packages/backend
npm i
npm run dev
```

## Docker Deployment

The project includes Docker Compose for easy deployment:

```bash
docker-compose up -d

# Run the seed command in the postgresql-database container
docker-compose exec database npm run seed

# For a specific environment
docker-compose exec database NODE_ENV=production npm run seed
```

This will start:
- Ory Hydra server on http://localhost:4444 (public) and http://localhost:4445 (admin)
- Identity Provider on http://localhost:3000
- Client Application on http://localhost:5555
- Resource Server on http://localhost:8000

## Authentication Flow

1. User visits the client application and clicks "Login"
2. Client redirects to Hydra with an authorization request
3. Hydra redirects to the identity provider's login page
4. User enters credentials
5. Upon successful login, the identity provider tells Hydra the login was successful
6. Hydra redirects to the identity provider's consent page
7. User grants or denies consent for the requested scopes
8. Upon consent, the identity provider tells Hydra the consent was granted
9. Hydra redirects back to the client with an authorization code
10. Client exchanges the code for tokens
11. Client can now use the access token to call the resource server

## License

This project is licensed under the MIT License - see the LICENSE file for details.