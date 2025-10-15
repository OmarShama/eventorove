import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { ApiResponse, LoginResponse } from "@/types/api";
import { refreshAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Login() {
    const router = useRouter();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginMutation = useMutation<ApiResponse<LoginResponse>>({
        mutationFn: () => authApi.login(email, password),
        onSuccess: (response) => {
            if (response.success && response.data?.accessToken) {
                // Save the token to localStorage
                localStorage.setItem('token', response.data.accessToken);

                // Force refresh auth state
                refreshAuth();

                toast({
                    title: "Success",
                    description: "Logged in successfully",
                });

                // Small delay to ensure auth state is updated before redirect
                setTimeout(() => {
                    router.push("/");
                }, 100);
            }
        },
        onError: (error: any) => {
            toast({
                title: "Login Failed",
                description: error.message || "Invalid credentials",
                variant: "destructive",
            });
        },
    });


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }
        loginMutation.mutate();
    };


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center">
                        <i className="fas fa-map-marker-alt text-primary text-3xl mr-2"></i>
                        <span className="text-3xl font-bold text-primary">Eventorove</span>
                    </Link>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                            create a new account
                        </Link>
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <Link href="/register?role=host" className="block">
                                    <Button variant="outline" className="w-full">
                                        Register as Host
                                    </Button>
                                </Link>

                                <Link href="/" className="block">
                                    <Button variant="ghost" className="w-full">
                                        Continue as Guest
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
