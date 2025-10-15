import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { ApiResponse, User } from "@/types/api";
import Link from "next/link";

export default function Register() {
    const router = useRouter();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
    });

    const registerMutation = useMutation<ApiResponse<User>>({
        mutationFn: () => authApi.register({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
        }),
        onSuccess: (response) => {
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Account created successfully! Please log in.",
                });

                // Redirect to login page
                router.push("/login");
            }
        },
        onError: (error: any) => {
            toast({
                title: "Registration Failed",
                description: error.message || "Failed to create account",
                variant: "destructive",
            });
        },
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters long",
                variant: "destructive",
            });
            return;
        }

        registerMutation.mutate();
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        required
                                        className="mt-1"
                                        placeholder="First name"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        required
                                        className="mt-1"
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                                    value={formData.password}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                    required
                                    className="mt-1"
                                    placeholder="Create a password"
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    required
                                    className="mt-1"
                                    placeholder="Confirm your password"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={registerMutation.isPending}
                            >
                                {registerMutation.isPending ? "Creating account..." : "Create account"}
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

                            <div className="mt-6">
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
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
