import { Component, type ErrorInfo, type ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Dear Her error boundary caught:", error, errorInfo);
  }

  private resetApp = (): void => {
    this.setState({
      hasError: false,
      message: "",
    });

    window.location.assign("/");
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="grid min-h-screen place-items-center bg-[#070A1A] px-5 py-10 text-cream-100">
        <GlassCard className="w-full max-w-2xl border-rose-200/20 bg-rose-200/[0.07] p-7 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Something went soft</p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100">
            Dear Her needs a tiny reset.
          </h1>
          <p className="mt-5 leading-7 text-cream-100/70">
            The sanctuary hit a small error. Your local memories and favorites should still be safe on this browser.
          </p>

          {this.state.message ? (
            <pre className="mt-5 overflow-auto rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-xs leading-6 text-cream-100/55">
              {this.state.message}
            </pre>
          ) : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <SoftButton onClick={this.resetApp}>Return home</SoftButton>
            <SoftButton variant="secondary" onClick={() => window.location.reload()}>
              Refresh app
            </SoftButton>
          </div>
        </GlassCard>
      </main>
    );
  }
}
