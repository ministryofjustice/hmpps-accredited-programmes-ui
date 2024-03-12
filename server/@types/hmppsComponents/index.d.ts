interface Component {
  css: Array<string>
  html: string
  javascript: Array<string>
}

type AvailableComponent = 'footer' | 'header'

export type { AvailableComponent, Component }
