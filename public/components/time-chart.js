'use strict'

class TimeChart extends HTMLElement {
  constructor() {
    super()

    this.chart = null
    this.canvas = null
    this.interactionDebounceDuration = 2000
    this._updateForVisibleBoundsDebounced = null // populated on .create()
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'closed' })

    const style = document.createElement('style');
    style.textContent = `
      .chart-container {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 95vh;
        width: 95vw;
        margin: auto;
        z-index: 0;
      }
    `

    const scripts = [
      'https://cdn.jsdelivr.net/npm/chart.js',
      'https://cdn.jsdelivr.net/npm/moment@^2',
      'https://cdn.jsdelivr.net/npm/chartjs-adapter-moment@^1',
      'https://cdn.jsdelivr.net/npm/hammerjs@2.0.8',
      'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1',
      'https://cdn.jsdelivr.net/npm/throttle-debounce@5.0.0/umd/index.min.js'
    ].map(src => {
      const script = document.createElement('script')

      script.src = src

      return script
    })

    const container = document.createElement('div')
    container.classList.add('chart-container')

    this.canvas = document.createElement('canvas')

    container.append(this.canvas)

    shadow.appendChild(style)
    shadow.appendChild(container)

    ;(async () => {
      for (const script of scripts) {
        await new Promise(resolve => {
          shadow.appendChild(script)
          script.addEventListener('load', resolve)
        })
      }
    })()
  }

  init() {
    const start = new Date()

    start.setHours(start.getHours() - 12)

    this.update({ start, end: new Date() })

    return this
  }

  create() {
    this._updateForVisibleBoundsDebounced =
      this._updateForVisibleBoundsDebounced ||
        throttleDebounce.debounce(this.interactionDebounceDuration, () =>
          this.updateForVisibleBounds())

    this.chart = new Chart(this.canvas.getContext('2d'), {
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
              onPanComplete: () => this._updateForVisibleBoundsDebounced()
            },

            zoom: {
              wheel: {
                enabled: true,
                speed: 0.075
              },
              mode: 'x',
              onZoomComplete: () => this._updateForVisibleBoundsDebounced()
            }
          }
        },

        onClick: e => {
          this.chart.getElementsAtEventForMode(e, 'nearest', {
            intersect: true
          }, true).forEach(p => {
            const item = this.chart.data.datasets[p.datasetIndex].data[p.index]

            this.dispatchEvent(new CustomEvent('point-clicked', {
              detail: { item }
            }))
          })
        }
      }
    })

    return this
  }

  updateForVisibleBounds() {
    const ticks = this.chart.scales.x.ticks

    if (!ticks.length)
      return

    const first = ticks[0].value
    const last = ticks[ticks.length - 1].value

    return this.update({
      start: new Date(first),
      end: new Date(last)
    })
  }

  async update({ start, end }) {
    try {
      this.dispatchEvent(new CustomEvent('xhr-started'))

      this.chart.data.datasets = await fetch(
        '/datasets?' + new URLSearchParams({
          start: start.getTime(),
          end: end.getTime()
        }), {
        headers: { 'Accept': 'application/json' }
      })
      .then(r => r.ok ? r.json() : r.text().then(text => { throw text }))

      this.chart.update(0)

      this.dispatchEvent(new CustomEvent('chart-updated', {
        detail: {
          start: start.toLocaleDateString(),
          end: end.toLocaleDateString()
        }
      }))
    } catch (err) {
      this.dispatchEvent(new CustomEvent('xhr-error', { detail: { err } }))

      console.error(err)
    } finally {
      this.dispatchEvent(new CustomEvent('xhr-ended'))
    }
  }

  reset() {
    this.chart.resetZoom()

    return this.init()
  }
}

customElements.define('time-chart', TimeChart)
