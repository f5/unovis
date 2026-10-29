import React, { ReactNode } from 'react'

// Styles
import s from './styles.module.css'

type ChartErrorBoundaryProps = {
  children: ReactNode;
}

type ChartErrorBoundaryState = {
  error?: Error;
}

/* Keeps a single failing library from breaking the whole comparison */
export class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  state: ChartErrorBoundaryState = {}

  static getDerivedStateFromError (error: Error): ChartErrorBoundaryState {
    return { error }
  }

  render (): ReactNode {
    if (this.state.error) return <div className={s.placeholder}>Couldn&apos;t render the chart: {this.state.error.message}</div>
    return this.props.children
  }
}
