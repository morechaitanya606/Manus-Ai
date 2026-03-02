'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[50vh] flex items-center justify-center bg-void p-6">
                    <div className="max-w-md w-full border border-red-500/40 bg-panel/80 p-8 text-center">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500 relative">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500"></div>
                        </div>
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-mono font-bold text-text-main mb-2 uppercase tracking-widest">
                            System Error
                        </h2>
                        <p className="text-text-dim font-mono text-xs mb-2">
                            Something went wrong while rendering this section.
                        </p>
                        {this.state.error && (
                            <p className="text-red-400/70 font-mono text-[10px] mb-6 break-all border border-red-500/20 bg-red-500/5 p-2">
                                {this.state.error.message}
                            </p>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-6 py-2 border border-cyan text-cyan font-mono text-xs hover:bg-cyan hover:text-void transition-colors uppercase font-bold tracking-widest"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Retry
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
