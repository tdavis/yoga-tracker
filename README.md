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

### Libraries

- `Echo` web framework
- `godotenv` for reading `.env`
- `pq` postgres driver
- `go-redis` redis driver
-  `miniredis` and `go-sqlmock` test mocks
- `testify` assertions

### Improvements

- [x] Add unit tests for `CheckinStore`
- [x] Add unit tests for handlers
- [ ] Add integration tests with [Testcontainers](https://golang.testcontainers.org/)
- [x] Use modules instead of a single `main` package
- [x] Accept completion date from app
- [ ] Date validation 

## Application

The app lives under `react-native-app` and is an Expo application tested using `web` and `android` targets.

Install dependencies with `npm install` then run the app with `npm run web` or `npm run android`. 

Run/watch tests with `npm run test`

- `app/` - layouts and route stack
- `components/` - internal and `gluestack-ui` components used in layouts
- `hooks/` - [Hookstate](https://hookstate.js.org) hooks used in layouts and components

### Libraries

- `Expo` layouts and router
- `gluestack-ui` UI components
- `Hookstate` state management
- `async-storage` caching
- `expo-secure-store` session storage
- `testing-library` Expo tests
- `jest` test runner
- `eslint` and `prettier` for linting/formatting

### Improvements

- [x] Make API host/protocol configurable (currently only works with localhost web/android)
- [x] Add tests for authentication logic
- [ ] Add tests for components

### API Reference

#### Get Practices

Practice names and respective duration in minutes is stored in `practices.json` and exposed to the app through an endpoint.

##### Request
``` http
GET /practices
```

##### Response

``` json
[
  {
    "name": "Surya Kriya",
    "minutes": 21
  },
  {
    "name": "Shambhavi Mahamudra Kriya",
    "minutes": 21
  },
  {
    "name": "Yogasanas",
    "minutes": 90
  },
  // ...
]
```


#### Mark Complete

Users mark meditations as complete. 

##### Request
``` http
PUT /complete
Content-Type: application/json

{
  "user_name": "tom",
  "meditation": "Shoonya",
  "timestamp": "2024-08-09T11:03:04.126389Z"
}
```

##### Response

Includes the data written and the total completed today across all users as `completed_today`.

``` json
{
  "id": 192,
  "user_name": "test",
  "meditation": "Shoonya",
  "completed_at": "2024-08-09T11:03:04.126389Z",
  "completed_today": 2
}
```

#### Get Checkins

Get all the checkins (completed meditations) for a given user and day; used to populate the main screen and calculate values on the stats screen.

##### Request
``` http
GET /checkins/tom/2024-08-03
```

##### Response

Includes the user's checkins and the total completed today across all users as `completed_today`.

``` json
[
  {
    "id": 117,
    "user_name": "test",
    "meditation": "Samyama Sadhana",
    "completed_at": "2024-08-03T07:51:29.049075Z",
    "completed_today": 6
  },
  {
    "id": 115,
    "user_name": "test",
    "meditation": "Shakti Chalana Kriya",
    "completed_at": "2024-08-03T07:51:28.074071Z",
    "completed_today": 5
  },
  // ...
]
```

#### Get Users

Gets the total count of users practiced for a given date; used to populate stats screen.

##### Request
``` http
GET /users/2024-08-03
```

##### Response

``` json
4
```

#### User Yearly Stats

Get a mapping of meditation to number of checkins for a given year for a user; used to populate stats screen.

##### Request
``` http
GET /stats/tom/2024
```

##### Response

``` json
{
  "Samyama Sadhana": 1,
  "Shakti Chalana Kriya": 17,
  "Shambhavi Mahamudra Kriya": 2,
  "Shoonya": 5,
  "Surya Kriya": 9,
  "Yogasanas": 8
}
```

#### Get Users

Gets the total count of users practiced for a given date; used to populate stats screen.

##### Request
``` http
GET /users/2024-08-03
```

##### Response

``` json
4
```
