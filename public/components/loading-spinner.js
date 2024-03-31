'use strict'

class LoadingSpinner extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'closed' })

    const externalStyle = document.createElement('link')
    externalStyle.setAttribute('rel', 'stylesheet')
    externalStyle.setAttribute(
      'href',
      'https://cdn.jsdelivr.net/npm/@chgibb/css-spinners@2.2.1/css/spinners.min.css'
    )

    const style = document.createElement('style');
    style.textContent = `
    .loading-indicator-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.50);
        color: #fafafa;
        pointer-events: none;
        z-index: 1;

        h5,
        .loading-indicator {
          display: flex;
          justify-content: space-between;
        }

        .loading-indicator {
          scale: 0.35;
          background: #333 !important;
        }
      }
    `

    const container = document.createElement('div')
    container.setAttribute('id', 'loading')
    container.classList.add('loading-indicator-container', 'hidden')

    const header = document.createElement('h5')
    header.textContent = 'Fetching data for time period'

    const spinner = document.createElement('div')
    spinner.classList.add('loading-indicator', 'wobblebar-loader')
    spinner.textContent = 'Loading...'

    container.append(header)
    container.append(spinner)

    shadow.appendChild(externalStyle)
    shadow.appendChild(style)
    shadow.appendChild(container)

    this.style.display = 'none'
  }

  show() {
    this.style.display = 'block'
  }

  hide() {
    this.style.display = 'none'
  }
}

customElements.define('loading-spinner', LoadingSpinner)
