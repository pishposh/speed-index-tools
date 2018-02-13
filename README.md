```sh
# `npm install -g http-server`, then:
cd test && http-server

# in another tab:
mkdir -p trace

./speed-index.js http://localhost:8080/jiggle-short --filename=traces/jiggle-short.json
./speed-index.js http://localhost:8080/jiggle-long --filename=traces/jiggle-long.json
./speed-index.js http://localhost:8080/jiggle-long --filename=traces/jiggle-long-scrolled.json --scroll-y=667

./speed-index.js http://localhost:8080/unscramble-short --filename=traces/unscramble-short.json
./speed-index.js http://localhost:8080/unscramble-long --filename=traces/unscramble-long.json
./speed-index.js http://localhost:8080/unscramble-long --filename=traces/unscramble-long-scrolled.json --scroll-y=667

./speed-index.js https://www.nytimes.com/2016/11/08/nyregion/chopped-cheese-sandwich-harlem.html --filename=traces/chopped-cheese.json
./speed-index.js https://www.nytimes.com/2016/11/08/nyregion/chopped-cheese-sandwich-harlem.html --filename=traces/chopped-cheese-scrolled.json --scroll-y=667
```
