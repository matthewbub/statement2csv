import { useAuthStore } from "../stores/auth";
import * as React from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "@tanstack/react-router";
import { config } from "@/app_config";
import { useForm } from "react-hook-form";

type ForgotPasswordInputs = {
  username: string;
};

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordComponent,
});

function ForgotPasswordComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <main className="flex justify-center items-center h-screen">
      <ForgotPasswordForm />
    </main>
  );
}

function ForgotPasswordForm() {
  const [message, setMessage] = React.useState({ type: "", content: "" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>();

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setMessage({ type: "", content: "" });

    try {
      const response = await fetch("/api/v1/account/forgot-password", {
        method: "POST",
        body: JSON.stringify({ username: data.username }),
      });
      const json = await response.json();
      if (!json.ok) {
        throw new Error("Failed to send password reset email");
      }

      setMessage({
        type: "success",
        content:
          "If a matching account was found, we have sent a password reset link to the associated email address.",
      });
      reset(); // Clear the form
    } catch (error) {
      setMessage({
        type: "error",
        content: "An error occurred. Please try again later.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
        <CardDescription>
          Enter your username to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              {...register("username", {
                required: "Please enter your username",
                maxLength: {
                  value: config.__PRIVATE__.MAX_USERNAME_LENGTH,
                  message: `Username must be less than ${config.__PRIVATE__.MAX_USERNAME_LENGTH} characters`,
                },
              })}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
          {message.content && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
            >
              <AlertDescription>{message.content}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href="/login" className="text-sm text-primary hover:underline">
          Back to Login
        </Link>
        <Link href="/signup" className="text-sm text-primary hover:underline">
          Create Account
        </Link>
      </CardFooter>
    </Card>
  );
}
