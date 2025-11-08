import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const ConnectionStatus: React.FC = () => {
    const connection = useAppStore((state) => state.connection);
    const isLoading = useAppStore((state) => state.isLoadingConnection);
    
    if (isLoading) {
        return (
            <div className="card">
                <h2>🔗 Connection Status</h2>
                <div className="info-box">
                    <div className="loading">Checking connection...</div>
                </div>
            </div>
        );
    }

    if (!connection) {
        return (
            <div className="card">
                <h2>🔗 Connection Status</h2>
                <div className="info-box warning">
                    <p>
                        <strong>⚠️ No active connection</strong>
                        <br />
                        Please connect to a Dataverse environment to use this tool.
                    </p>
                </div>
            </div>
        );
    }

    const envClass = connection.environment.toLowerCase();

    return (
        <div className="card">
            <h2>🔗 Connection Status</h2>
            <div className="info-box success">
                <div className="connection-details">
                    <div className="connection-item">
                        <strong>Name:</strong>
                        <span>{connection.name}</span>
                    </div>
                    <div className="connection-item">
                        <strong>URL:</strong>
                        <span>{connection.url}</span>
                    </div>
                    <div className="connection-item">
                        <strong>Environment:</strong>
                        <span className={`env-badge ${envClass}`}>{connection.environment}</span>
                    </div>
                    <div className="connection-item">
                        <strong>ID:</strong>
                        <span>{connection.id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
