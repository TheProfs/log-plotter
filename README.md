# Log Plotter

Visualise the frequency & timing of `console.logs` or exceptions
that happen across separate, distributed services logging using [Papertrail][pt]

It essentially attempts to answer the following question:

> Which statistically significant (high-frequency) event in some Service, ***precedes*** another, problematic event in another Service?

It attempts to do so by simply plotting each event on a graph.

- Doesn't need a database or a deployment.  
- It just scours Papertrail logs for specific events/logs and plots their
  frequency on a navigable time plot.

<p align="center">
  <img
  alt="Running time plot showing a suspected cause of high-frequency disconnections" src="images/demo.gif"
  style="box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);">
</p>

### A real-life example

> In the above image we traced mass WebSocket disconnections,
seen next to the cyan point, to a simple infrastructure platform rule that moves
the process to another server.

> This movement required more than 60 seconds which was more than our
`ping-timeouts`, hence the disconnections.

> The cyan point (representing a console.log of a server cycling message)
was zeroed-in as the culprit of the mass disconnections, as it was repeatedly &
reliably seen happening immediately before them.

We process half a million events each day; even filtering on errors produces
a mile long paper trail of logs which makes it impossible to get even the
most basic overview of a situation, hence this app.

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

## Todo

- [ ] Count objects in view
- [ ] Server tests
- [ ] UI tests
- [ ] [K-means cluster][kmeans] the events, infer associations automatically


## Authors

- [@nicholaswmin](https://github.com/nicholaswmin)

[pt]: https://www.papertrail.com/
[kmeans]: https://en.wikipedia.org/wiki/K-means_clustering
