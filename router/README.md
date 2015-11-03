# router

A Clojure service for load balancing and routing requests with HAProxy.

## Dependencies

* [Leiningen](https://github.com/technomancy/leiningen)
* [HAProxy](http://www.haproxy.org/)

If on OS X, both can be installed with Homebrew:

```
brew install leiningen
brew install haproxy
```

## Usage

Start the service:

```
lein ring server-headless
```

Register a service:

```
curl \
  -X POST \
  http://localhost:3000/register \
  --data '{"name": "omg", "in-port": 8000, "out-port": 8001}' \
  --header "Content-type:application/json"
```

Register another instance of the same service:

```
curl \
  -X POST \
  http://localhost:3000/register \
  --data '{"name": "omg", "in-port": 8000, "out-port": 8002}' \
  --header "Content-type:application/json"
```

Start HAProxy. This will generate an HAProxy config file from the services that
were registered and start an HAProxy instance with that config.

```
curl \
  -X POST \
  http://localhost:3000/start
```

HAProxy will now load balance service "omg" on localhost:8000 between
localhost:8001 and localhost:8002 using round-robin.

## Dockerize

TODO: Document how to build image, run.

## License

Copyright © 2015 Johan Mena

Distributed under the Eclipse Public License either version 1.0 or (at
your option) any later version.
