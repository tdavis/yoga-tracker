# Yoga Tracker

A simple app for tracking daily practices.

## Backend

The backend lives under `server/` and is written in Go using the [Echo](https://echo.labstack.com/) library. It uses PostgreSQL to store check-ins and Redis to cache daily totals across users.

Run the backend with `docker compose up` (requires Docker Desktop or standalone Docker Compose). Configuration is stored in `.env` which can be used to override the PostgreSQL and Redis connection details. Supported practices are stored in `practices.json` and respected by the client.

Run tests with `go test ./internal/...`

- `models.go` - data model used internally and in responses
- `checkin.go` - `CheckinStore` repository holds business logic for persistent data
- `handlers.go` - Echo integration
- `init.sql` - runs when the Docker Compose PostgreSQL container is first created; would need to be done through other means in a production deployment.
- `queries.restclient` - example queries to test the API using [Emacs restclient](https://github.com/pashky/restclient.el) 

### Improvements

- [x] Add unit tests for `CheckinStore`
- [x] Add unit tests for handlers
- [ ] Add integration tests with [Testcontainers](https://golang.testcontainers.org/)
- [x] Use modules instead of a single `main` package

## Application

The app lives under `react-native-app` and is an Expo application tested using `web` and `android` targets.

Install dependencies with `npm install` then run the app with `npm run web` or `npm run android`. 

Run/watch tests with `npm run test`

- `app/` - layouts and route stack
- `components/` - internal and `gluestack-ui` components used in layouts
- `hooks/` - [Hookstate](https://hookstate.js.org) hooks used in layouts and components

### Improvements

- [x] Make API host/protocol configurable (currently only works with localhost web/android)
- [x] Add tests for authentication logic
- [ ] Add tests for components
