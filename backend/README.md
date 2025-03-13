# @authenticate/database

This package contains the shared database functionality for the Authenticate application.

## Overview

The `@authenticate/database` package provides a unified database interface for all services in the Authenticate application. It handles connections, migrations, and provides a consistent API for database operations.

## Installation

This package is designed to be consumed by other services within the Authenticate monorepo. It is not published to npm, but instead is referenced locally.

To use this package in another service:

```json
{
  "dependencies": {
    "@authenticate/database": "file:../database"
  }
}
```

## How It Works

This package uses the "prepare" script to automatically build TypeScript code when the package is installed. This ensures that any service using this package will have access to the compiled JavaScript and TypeScript declarations without needing to build it manually.

### Build Process

The package is automatically built when:
- The package is installed via npm
- Any service that depends on it runs `npm install`

The build process compiles TypeScript source files to JavaScript in the `dist` directory.

## Usage

```typescript
import { getDataSource, closeDatabase } from '@authenticate/database';

// Example: Connect to the database
async function connectToDatabase() {
  const dataSource = await getDataSource();
  
  // Use the dataSource for database operations
  
  // When done, close the connection
  await closeDatabase();
}
```

## Available Functions

- `getDataSource()`: Returns a TypeORM DataSource instance
- `closeDatabase()`: Closes the database connection

## Development

### Running Migrations

```bash
# Run all pending migrations
npm run migration:run

# Generate a new migration based on entity changes
npm run migration:generate -- MigrationName

# Create a new empty migration
npm run migration:create
```

### Seeding Data

```bash
# Run seed scripts
npm run seed

# Reset database (run migrations and seeds)
npm run reset
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Architecture

This package uses:
- TypeORM for database ORM
- PostgreSQL as the primary database
- Redis for caching (if applicable)

## Troubleshooting

If you encounter issues importing from this package, ensure:

1. The package has been built (`dist` directory exists)
2. The service using this package has the correct reference in package.json
3. TypeScript paths are correctly configured in the consuming service

## Notes for Maintainers

When making changes to this package:

1. Ensure backward compatibility when possible
2. Create migrations for any schema changes
3. Update tests to reflect changes
4. Increment version number according to semver