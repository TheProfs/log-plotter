'use strict'

toastr.options.timeOut = 1000
const throttleDuration = 2 * 1000
const throttle = throttleDebounce.throttle

const charter = {
  chart: null,

  init: function() {
    const start_from = new Date()
    const end_at = new Date()

    start_from.setHours(start_from.getHours() - 12)
    end_at.setHours(end_at.getHours() + 12)

    this.update({ start_from, end_at })

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
              onPanComplete: async ({ chart }) => {
                const ticks = this.chart.scales.x.ticks

                if (!ticks.length) return

                const first = ticks[0].value
                const last = ticks[ticks.length - 1].value

                if (!last) return

                this.update({
                  start_from: new Date(first),
                  end_at: new Date(last)
                })
              }
            },

            zoom: {
              wheel: {
                enabled: true,
                speed: 0.075
              },
              mode: 'x',
              onZoomComplete: async ({ chart }) => {
                const ticks = this.chart.scales.x.ticks

                if (!ticks.length) return

                const first = ticks[0].value
                const last = ticks[ticks.length - 1].value

                if (!last) return

                this.update({
                  start_from: new Date(first),
                  end_at: new Date(last)
                })

                $('#reset-zoom-btn').show()
              }
            }
          }
        },

        onClick: e => {
          this.chart.getElementsAtEventForMode(e, 'nearest', {
            intersect: true
          }, true).forEach(point => {
            const item = this.chart.data.datasets[point.datasetIndex]
              .data[point.index]

            console.log(item.event)

            toastr.success('Log event has been logged in console')
          })
        }
      }
    })

    return this
  },

  update: throttle(throttleDuration,
    async function({ start_from, end_at }) {
      try {
        $('#loading').show()

        const params = new URLSearchParams({
          start_from: start_from.getTime(),
          end_at: end_at.getTime()
        })

        this.chart.data.datasets = await fetch('/datasets?' + params, {
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(res => {
          if (res.status !== 200)
            throw res.statusText

          return res
        })
        .then(res => res.json())

        this.chart.update(0)

        $('#period').show()
        $('#start-lbl').text(start_from.toLocaleDateString())
        $('#end-lbl').text(start_from.toLocaleDateString())

      } catch (err) {
        toastr.error(err)
        console.error(err)
      } finally {
        $('#loading').hide()
      }

  }, { atBegin: true }),

  reset: function() {
    this.chart.resetZoom()

    return this.init()
  }
}
