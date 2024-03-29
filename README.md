# Log Plotter

Visualise the frequency & timing of `console.logs` or exceptions
that happen across separate, distributed services logging using [Papertrail][pt]

- Doesn't use a database or a deployment.  
- It just scours PT logs for specific events/logs and plots their frequency
  on a navigable time plot.

Use it to debug pesky issues with no clear cause.

![Image of app showing a suspected cause of high-frequency disconnections](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTU1NjR4czUwaTY4ZWllNjA1YmRxM2w2andwdWF5eWM5bXNjZ2Z2cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kbpkqUhZyjDptIYfAc/source.gif)

> In the above image we traced mass WebSocket disconnections,
seen next to the cyan point, to a simple infrastructure platform rule that moves
the process to another server.

> This movement required more than 60 seconds which was more than our
`ping-timeouts`, hence the disconnections.

> The cyan circle was zeroed-in as the culprit of the mass disconnections, as it
was repeatedly & reliable seen happening immediately before them.


## Install

Run:

```bash
$ git clone
$ npm install
```

## Declare log/events in config.json

Edit `config.json` to add the log message keywords you wish to visualise.   

Assuming you:

- `console.log('redis-reconnect-error', err)` & `console.log('redis-error')`
   in a Papertrail app called `billing-service`.
- `console.log('GET-invoice-timeout', err)` in another Papertrail app called
  `invoicing-service`.

Just declare those 3 events and their apps in your `config.json`, like so:

```json
{
  "apps": [
    {
      "name": "billing-service",
      "token": "<papertrail-billing-service-api-token>",
      "events": [
        { "name": "redis-reconnect-error", "size": 10 },
        { "name": "redis-error", "size": 6, "color": "red" }
      ]
    },
    {
      "name": "invoicing-service",
      "token": "<papertrail-invoicing-service-api-token>",
      "events": [{ "name": "GET-invoice-timeout", "size": 3, "color": "cyan" }]
    }
  ]
}
```

Where:

| Event | Type | Required? | Description |
|---|---|---|---|
| `app.name` | String | Required | Name of the Papertrail app that logs this log/event. |
| `event.name` | String | Required | A subset of the string you `console.log()`.    If you log `console.log(redis-socket-error)`,  you can just declare `"socket-error" here and it will still be picked up. |
| `event.color` | String:Hex color | Optional.  Defaults to random. | Use this color when painting the time plot point. |
| `event.size` | Number | Required | Use this radius for the time plot point. |

### Run the visualiser


```bash
$ npm run start-dev
```  

and visit `localhost:3000`.

You should see those events plotted and you can navigate the graph.

## Authors

- [@nicholaswmin](https://github.com/nicholaswmin)

[pt]: https://www.papertrail.com/
