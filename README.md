# Edu Directory

A small CRUD app for school districts, schools, students, and teachers, set up as a
TypeScript monorepo with Turborepo.

```
apps/
  api/        Express 5 REST API (Node 24)
  web/        React 19 + Vite + React Router + TanStack Query
packages/
  common/     Shared types, zod validation schemas, and formatting helpers (used by api + web)
  db/         Prisma 7 schema, migrations, seed, and client factory (Postgres via @prisma/adapter-pg)
```

## Run everything in Docker

```bash
docker compose up --build
```

| Service   | What it does                                                   | Host URL                     |
| --------- | -------------------------------------------------------------- | ---------------------------- |
| `db`      | Postgres 18                                                    | `localhost:5433`             |
| `migrate` | One-shot: `prisma migrate deploy`, then seed if the DB is empty | —                            |
| `api`     | Express API                                                    | http://localhost:4000/api    |
| `web`     | nginx serving the built SPA and proxying `/api` to `api`       | http://localhost:8080        |

Postgres is published on **5433** so it never collides with a locally installed Postgres
on 5432. Data lives in the `edu_pgdata` volume; `docker compose down -v` wipes it.

## Local development (apps on the host, DB in Docker)

```bash
cp .env.example .env
npm install
npm run db:up        # start only the Postgres container
npm run db:migrate   # apply migrations (prisma migrate dev)
npm run db:seed      # sample data (skipped if the DB already has districts)
npm run dev          # tsc --watch for packages, tsx watch for the API, Vite for the web app
```

Vite proxies `/api` to `http://localhost:4000`. If the Docker `api` container is running it
already holds port 4000, so stop it first (`docker compose stop api web`).

Other scripts: `npm run build`, `npm run typecheck`, `npm run test`, `npm run db:studio`.

### Changing the schema

Edit `packages/db/prisma/schema.prisma`, then run `npm run db:migrate -- --name <change>`.
That creates a migration under `packages/db/prisma/migrations/` and regenerates the client.

## Notes

- **Prisma 7**: the datasource URL is configured in `packages/db/prisma.config.ts` (not the
  schema), the client is generated as TypeScript into `packages/db/src/generated` (git-ignored,
  compiled with the package), and queries go through the `pg` driver adapter.
- **Validation** uses the same zod schemas from `@edu/common` on the client (form errors) and
  the server (400 responses with per-field `details`).
- **Deletes are restricted**: a district with schools, or a school with students/teachers,
  returns `409` with an explanation instead of cascading.
- **npm install scripts**: npm 11 requires approving dependency install scripts; the approved
  ones (Prisma, esbuild) are pinned under `allowScripts` in the root `package.json`. After
  upgrading those packages, run `npm install-scripts approve prisma @prisma/engines esbuild`.
- No authentication yet.

## API

| Method                | Path                             | Notes                                      |
| --------------------- | -------------------------------- | ------------------------------------------ |
| GET                   | `/api/health`                    | Checks DB connectivity                     |
| GET, POST             | `/api/districts`                 | List includes `schoolCount`                |
| GET, PUT, DELETE      | `/api/districts/:id`             | GET includes schools with counts           |
| GET, POST             | `/api/schools?districtId=`       | List includes district + counts            |
| GET, PUT, DELETE      | `/api/schools/:id`               | GET includes district, students, teachers  |
| GET, POST             | `/api/students?schoolId=`        | Includes school + district                 |
| GET, PUT, DELETE      | `/api/students/:id`              |                                            |
| GET, POST             | `/api/teachers?schoolId=`        | Includes school + district                 |
| GET, PUT, DELETE      | `/api/teachers/:id`              | `emailAddress` is unique (409 on conflict) |

Grades are integers: `0` = Kindergarten, `1`–`12` = grade number. District `usState` is a
two-letter USPS code.
