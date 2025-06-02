import { useAuthStore } from "@/stores/auth";
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
import { Link } from "@tanstack/react-router";
import { config } from "@/app_config";
import { useForm } from "react-hook-form";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/sign-up")({
  component: SignUpComponent,
});

function SignUpComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <PublicLayout noRegister>
      <main className="flex justify-center items-center">
        <SignUpForm />
      </main>
    </PublicLayout>
  );
}

type SignUpFormInputs = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

function SignUpForm() {
  const { useSignup, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormInputs>();

  const password = watch("password");

  const onSubmit = async (data: SignUpFormInputs) => {
    await useSignup(
      data.username,
      data.email,
      data.password,
      data.confirmPassword,
      data.termsAccepted
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto mb-20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
        <CardDescription>Create your account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              {...register("username", {
                required: "Username is required",
                pattern: {
                  value: /^[a-zA-Z0-9._-]{3,30}$/,
                  message:
                    "Username must be 3-30 characters and can only contain letters, numbers, dots, hyphens, and underscores",
                },
                validate: {
                  noConsecutiveSpecials: (value) => {
                    // Prevent consecutive special characters
                    if (/[._-]{2,}/.test(value)) {
                      return "Special characters (. _ -) cannot be consecutive";
                    }
                    return true;
                  },
                  noSpecialsAtEnds: (value) => {
                    // Prevent special characters at start/end
                    if (/^[._-]|[._-]$/.test(value)) {
                      return "Username cannot start or end with special characters";
                    }
                    return true;
                  },
                },
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters long",
                },
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
                maxLength: {
                  value: config.__PRIVATE__.MAX_PASSWORD_LENGTH,
                  message: `Password must be less than ${config.__PRIVATE__.MAX_PASSWORD_LENGTH} characters`,
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <div className="flex items-baseline gap-2">
              <input
                type="checkbox"
                id="terms"
                {...register("termsAccepted", {
                  required: "You must accept the terms and conditions",
                })}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link
                  href="/terms-of-service"
                  className="text-blue-600 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.termsAccepted && (
              <p className="text-sm text-red-500">
                {errors.termsAccepted.message}
              </p>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            color="teal"
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Already have an account? Log in
        </Link>
      </CardFooter>
    </Card>
  );
}
