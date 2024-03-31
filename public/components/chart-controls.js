'use strict'

class ChartControls extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.shadow = this.attachShadow({ mode: 'closed' })

    const style = document.createElement('style');
    style.textContent = `
      .controls {
        padding: 6px 18px;
        background: rgba(0,0,0,0.7);
        cursor: move;
        z-index: 2;
        border-radius: 6px;

        ul, p {
          display: block;
          padding: 6px 8px;
          color: #fefefe;
          font-size: 0.75em;
        }

        ul li { margin-bottom: 12px; }

        ul li span {
          margin-right: 8px;
          padding: 2px 6px;
          border: 1px solid #999;
          border-radius: 4px;
        }
      }
    `

    this.shadow.innerHTML = `
      <div class="controls" title="Drag to reposition">
        <ul>
          <li> <span> Click + Drag </span> to time travel </li>
          <li> <span> Mouse scroll up/down </span> to zoom in</li>
          <li> <span> Click Point </span> to view event </li>
          <li> <span> Click Legend Items</span> to hide them </li>
        </ul>
        <button
          id="reset-btn"
          title="Reset to initial state"
          type="button">
            Reset
        </button>
        <p id="period" class="hidden">
          Viewing dates:
          <strong id="start-lbl"></strong>
            -
          <strong id="end-lbl"></strong>
        </p>
        <span>
    </div>
    `

    const scripts = [
      'https://code.jquery.com/jquery-3.7.1.min.js',
      'https://code.jquery.com/ui/1.13.2/jquery-ui.js'
    ].map(src => {
      const script = document.createElement('script')

      script.src = src

      return script
    })

    this.shadow.appendChild(style)

    ;(async () => {
      for (const script of scripts) {
        await new Promise(resolve => {
          this.shadow.appendChild(script)
          script.addEventListener('load', resolve)
        })
      }

      $(this).draggable({ containment: 'document' })
    })()

    this.shadow.querySelector('#reset-btn')
      .addEventListener('click', e =>
        this.dispatchEvent(new CustomEvent('request-reset')))
  }

  updateRangeLabels({ start, end }) {
    this.shadow.querySelector('#period').classList.remove('hidden')
    this.shadow.querySelector('#start-lbl').innerText = start
    this.shadow.querySelector('#end-lbl').innerText = end
  }
}

customElements.define('chart-controls', ChartControls)
