import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center px-8">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-7xl text-error/30 block mb-6">error</span>
            <h1 className="font-headline text-4xl font-black tracking-tighter mb-4">
              Algo salió <span className="text-error italic">mal.</span>
            </h1>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              Ocurrió un error inesperado. Intenta recargar la página o vuelve al inicio.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary-container text-on-primary-container rounded-md font-bold text-sm hover:bg-primary hover:text-on-primary transition-all"
              >
                Recargar
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-surface-container text-on-surface rounded-md font-bold text-sm border border-outline/20 hover:border-primary/40 transition-colors no-underline"
              >
                Ir al Inicio
              </a>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left bg-surface-container rounded-xl p-4 border border-outline/10">
                <summary className="text-xs font-mono text-on-surface-variant cursor-pointer">Stack trace (dev)</summary>
                <pre className="text-[10px] text-error/70 mt-2 overflow-auto whitespace-pre-wrap">{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
