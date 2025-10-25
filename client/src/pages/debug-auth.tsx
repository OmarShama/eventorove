import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { config } from "@/lib/config";

export default function DebugAuth() {
    const { user, isAuthenticated, isLoading, isGuest } = useAuth();
    const [token, setToken] = useState<string | null>(null);
    const [apiTest, setApiTest] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            setToken(localStorage.getItem('token'));
        }
    }, []);

    const testApi = async () => {
        try {
            const response = await fetch(`${config.apiUrl}/auth/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            const data = await response.json();
            setApiTest({ status: response.status, data });
        } catch (error) {
            setApiTest({ error: error instanceof Error ? error.message : String(error) });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Auth Hook State</h2>
                        <div className="space-y-2">
                            <p><strong>isLoading:</strong> {isLoading.toString()}</p>
                            <p><strong>isAuthenticated:</strong> {isAuthenticated.toString()}</p>
                            <p><strong>isGuest:</strong> {isGuest.toString()}</p>
                            <p><strong>User:</strong></p>
                            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Token & API Test</h2>
                        <div className="space-y-4">
                            <div>
                                <p><strong>Token in localStorage:</strong></p>
                                <pre className="bg-gray-100 p-2 rounded text-sm break-all">
                                    {token || 'No token found'}
                                </pre>
                            </div>

                            <button
                                onClick={testApi}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                disabled={!token}
                            >
                                Test API Call
                            </button>

                            {apiTest && (
                                <div>
                                    <p><strong>API Response:</strong></p>
                                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                                        {JSON.stringify(apiTest, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
                    <div className="space-y-2">
                        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
                        <p><strong>API_BASE_URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}</p>
                        <p><strong>Window available:</strong> {isClient ? (typeof window !== 'undefined' ? 'Yes' : 'No') : 'Loading...'}</p>
                        <p><strong>localStorage available:</strong> {isClient ? (typeof window !== 'undefined' && window.localStorage ? 'Yes' : 'No') : 'Loading...'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
