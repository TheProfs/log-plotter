# Log Plotter

Plots the logs that happen across separate, distributed services logging using [Papertrail][pt]

<p align="center">
  <img
  alt="Running time plot showing a suspected cause of high-frequency disconnections" src="images/demo.gif"
  style="box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);">
</p>

## Test

```sh
$ npm test
```

## Install

Run:

```bash
$ git clone
$ npm install
```

## Declare log/events in config.yaml

//@Todo

### Run the visualiser

Add a Papertrail API Token in root `.env.local` file:

`.env.local`:

```sh
PAPERTRAIL_TOKEN=xxx # Replace xxx with Papertrail Token
```

then:

```bash
# Download all the logs for today:
$ npm run download-logs
```

```bash
$ npm run start-dev
```  

and visit `localhost:3000`.

You should see those events plotted and you can navigate the graph.

## Authors

- [@nicholaswmin](https://github.com/nicholaswmin)

[pt]: https://www.papertrail.com/
[kmeans]: https://en.wikipedia.org/wiki/K-means_clustering
