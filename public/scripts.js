'use strict'

const plotter = {
  chart: null,
  interactionDebounceDuration: 1250, // for pan/zoom
  nextFetchDelay: 1000, // i.e: 1000 = only 1 fetch per second allowed

  init: function() {
    const start_from = new Date()
    const end_at = new Date()

    start_from.setHours(start_from.getHours() - 12)
    end_at.setHours(end_at.getHours() + 12)

    this.fetchDatasetForRange({ start_from, end_at })

    return this
  },

  create: function() {
    const ctx = document.getElementById('chart').getContext('2d')

    this.chart = new Chart(ctx, {
      type: 'line',

      data: { datasets: [] },

      options: {
        responsive: true,
        resizeDelay: 500,
        maintainAspectRatio: false,
        animations: false,
        spanGaps: true,

        elements: { point: { borderWidth: 0 } },

        scales: {
          x: {
            type: 'time',
            time: { unit: 'minute' }
          },
          y: { display: false }
        },

        plugins: {
          legend: { labels: { usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: context => {
                return context.dataset.label
              }
            }
          },

          zoom: {
            pan: {
              mode: 'x',
              enabled: true,
              onPanComplete: ({ chart }) => {
                this.fetchDatasetForXAxisBounds()
              }
            },

            zoom: {
              wheel: {
                enabled: true,
                speed: 0.075
              },
              mode: 'x',
              onZoomComplete: ({ chart }) => {
                this.fetchDatasetForXAxisBounds()

                document.querySelector('#reset-btn')
                  .classList.remove('hidden')
              }
            }
          }
        },

        onClick: e => {
          this.chart.getElementsAtEventForMode(e, 'nearest', {
            intersect: true
          }, true).forEach(p => {

            const item = this.chart.data.datasets[p.datasetIndex].data[p.index]

            console.log(item.event)

            toastr.success('Log event has been logged in console')
          })
        }
      }
    })

    return this
  },

  fetchDatasetForXAxisBounds: function() {
    this._fetchDatasetForXAxisBounds = this._fetchDatasetForXAxisBounds ||
      throttleDebounce.debounce(
        this.interactionDebounceDuration,
        function() {
          const ticks = this.chart.scales.x.ticks

          if (!ticks.length)
            return

          const first = ticks[0].value
          const last = ticks[ticks.length - 1].value

          return this.fetchDatasetForRange({
            start_from: new Date(first),
            end_at: new Date(last)
          })
      })

      this._fetchDatasetForXAxisBounds()
  },

  fetchDatasetForRange: function({ start_from, end_at }) {
    this._fetchDatasetForRange = this._fetchDatasetForRange ||
      throttleDebounce.throttle(
        this.nextFetchDelay,
        async function({ start_from, end_at }) {
          try {
            document.querySelector('#loading').classList.remove('hidden')

            const params = new URLSearchParams({
              start_from: start_from.getTime(),
              end_at: end_at.getTime()
            })

            this.chart.data.datasets = await fetch('/datasets?' + params, {
              headers: { 'Accept': 'application/json' }
            })
            .then(res => {
              if (res.status !== 200)
                throw res.statusText

              return res.json()
            })

            this.chart.update(0)

            document.querySelector('#period')
              .classList.remove('hidden')
            document.querySelector('#start-lbl')
              .innerText = start_from.toLocaleDateString()
            document.querySelector('#end-lbl')
              .innerText = end_at.toLocaleDateString()

          } catch (err) {
            toastr.error(err)
            console.error(err)

          } finally {
            document.querySelector('#loading').classList.add('hidden')
          }
      }, { atBegin: true })

    this._fetchDatasetForRange({ start_from, end_at })
  },

  reset: function() {
    this.chart.resetZoom()

    return this.init()
  }
}
