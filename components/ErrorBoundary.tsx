import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);

    // Detectar errores de carga de chunks (versiones viejas)
    if (error.message.includes('Failed to fetch dynamically imported module') || 
        error.message.includes('Importing a module script failed')) {
      console.log('Detectado error de versión antigua. Recargando página...');
      window.location.reload();
    }
  }

  public render() {
    if (this.state.hasError) {
      // Puedes renderizar un fallback UI o simplemente null mientras recarga
      return this.props.children; 
    }

    return this.props.children;
  }
}
