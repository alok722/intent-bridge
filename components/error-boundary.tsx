"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-sm text-zinc-600">
            {this.props.fallbackLabel ?? "This section encountered an error."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false })}
            className="border-zinc-300 text-zinc-800"
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
