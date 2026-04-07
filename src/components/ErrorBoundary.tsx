import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorMessage from "./ui/ErrorMessage";
import styles from "./ErrorBoundary.module.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className={styles.wrapper}>
          <ErrorMessage
            message={this.state.error?.message ?? "Произошла ошибка при отображении"}
            onRetry={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
