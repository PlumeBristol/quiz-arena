import { Component, ReactNode } from 'react'

type Props = { children: ReactNode; label?: string }
type State = { error: Error | null; info: string }

/**
 * Catches React render errors anywhere in its subtree and surfaces them on
 * screen instead of silently bailing to an empty render. Dev-mode visibility.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: '' }

  static getDerivedStateFromError(error: Error): State {
    return { error, info: error.message }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    // eslint-disable-next-line no-console
    console.error(`[ErrorBoundary${this.props.label ? ` ${this.props.label}` : ''}]`, error, info.componentStack)
    this.setState({ error, info: (info.componentStack ?? '').slice(0, 600) })
  }

  reset = () => this.setState({ error: null, info: '' })

  render() {
    if (this.state.error) {
      return (
        <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center p-8 bg-ink/95 text-white font-mono text-xs overflow-auto">
          <div className="max-w-3xl w-full">
            <div className="text-coral text-2xl font-display font-bold mb-2">
              {this.props.label ?? 'Render error'}
            </div>
            <div className="text-lemon font-display font-bold text-base mb-4">{this.state.error.message}</div>
            <pre className="bg-black/60 border border-white/10 rounded p-3 whitespace-pre-wrap leading-relaxed">
              {this.state.error.stack}
            </pre>
            {this.state.info && (
              <pre className="mt-3 bg-black/60 border border-white/10 rounded p-3 whitespace-pre-wrap leading-relaxed text-white/70">
                {this.state.info}
              </pre>
            )}
            <button
              onClick={this.reset}
              className="mt-4 px-4 py-2 rounded bg-lemon text-ink font-display font-bold"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
