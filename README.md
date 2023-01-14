# GEO-LOCATIONS-DISTANCE-AND-TIME
Welcome to the geo locations project :rocket:

This project exposes an API that return the distance and the time difference between two different geo locations.

## Use

### Requirements
* NodeJS (v14)
* ExpressJS
* Redis
* GMaps APIs

### Start a redis instance

```sh
docker run --name redis -p 6379:6379 -d redis
```

### Start a local instance of this API
```sh
yarn start
```