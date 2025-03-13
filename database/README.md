# Docker Deployment
The package.json already has all the necessary commands set up for managing migrations and seeds.

## Run migrations
```bash
npm run migration:generate -- AddNewFeature
npm run migration:generate -- AddBlogEntity
npm run migration:generate -- AddUserEntity
```

## And to run migrations:
```bash
npm run migration:run
```

## Or via Docker:

```bash
# Quick run
docker-compose down -v && docker-compose up -d blog-postgres database redis

# Show logs
docker-compose logs database
```

## Rebuild and restart docker
```bash
docker-compose down -v && docker-compose up --build
```

```bash
docker-compose exec database npm run migration:run
```

## Start PostgreSQL container and the database service:
```bash
docker-compose up -d database
```

## Run migrations
```bash
docker-compose exec database npm run migration:run
```

## Seed the database:
```bash
docker-compose exec database npm run seed
```

## To access PostgreSQL CLI:
```bash
docker-compose exec database psql -U postgres -d blog_db

# Connect to DB
docker exec -it authenticate-blog-postgres-1 psql -U blog_user -d blog_db
```

## For a complete reset (useful during development):
```bash
docker-compose exec database npm run reset
```

## To run the database setup:

## Start the containers:
```bash 
docker-compose up -d blog-postgres database
```

## Check if migrations completed successfully:
```bash 
docker-compose logs -f database
```

## run migrations or seeds manually:
```bash
docker-compose exec database npm run migration:run
docker-compose exec database npm run seed
```

