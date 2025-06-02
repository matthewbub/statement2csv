"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Mail, Trash2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller } from "react-hook-form";
import { config } from "@/app_config";
import { useAuthStore } from "@/stores/auth";
import { Authorized } from "@/components/Authorized";
import { fetchWithAuth } from "@/utils/auth-helpers";
import { useToast } from "@/hooks/use-toast";
import { PublicLayout } from "@/components/PublicLayout";

interface FormData {
  questions: { question: string; answer: string }[];
}

export const Route = createFileRoute("/me")({
  component: () => (
    <Authorized>
      <AccountSettings />
    </Authorized>
  ),
});

function AccountSettings() {
  const sectionRefs = {
    profile: useRef<HTMLDivElement>(null),
    security: useRef<HTMLDivElement>(null),
    preferences: useRef<HTMLDivElement>(null),
    dataManagement: useRef<HTMLDivElement>(null),
    passwordReset: useRef<HTMLDivElement>(null),
  };

  const handleDeleteAccount = async () => {
    const response = await fetch("/api/v1/account/delete", {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Account deleted");

      useAuthStore.getState().useLogout();
      window.location.href = "/";
    } else {
      console.error("Failed to delete account");
    }
  };

  const scrollToSection = (sectionName: keyof typeof sectionRefs) => {
    sectionRefs[sectionName].current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PublicLayout>
      <div className="mx-auto p-4 flex gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <Heading>Account Settings</Heading>
          <div>
            <nav className="space-y-2 mt-4 border-l ml-2">
              <button
                onClick={() => scrollToSection("profile")}
                className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
              >
                Profile
              </button>
              <button
                onClick={() => scrollToSection("passwordReset")}
                className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
              >
                Password Reset
              </button>
              <button
                onClick={() => scrollToSection("security")}
                className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
              >
                Security Questions
              </button>
              {/* <button
                onClick={() => scrollToSection("preferences")}
                className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
              >
                Preferences
              </button> */}
              <button
                onClick={() => scrollToSection("dataManagement")}
                className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
              >
                Data Management
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-grow space-y-8">
          <section ref={sectionRefs.profile}>
            <UpdateProfileInformation />
          </section>
          <section ref={sectionRefs.passwordReset}>
            <AuthenticatedResetPasswordForm />
          </section>
          <section ref={sectionRefs.security}>
            <SecurityQuestionsForm />
          </section>

          {/* <section ref={sectionRefs.preferences}>...</section> */}

          <section ref={sectionRefs.dataManagement}>
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Manage your account data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 md:space-y-8">
                {/* TODO: Add stats on data usage */}
                {/* Total pages processed this billing cycle */}
                {/* Total pages processed */}

                <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4 gap-2">
                  <div className="col-span-1 flex items-center">
                    <Label htmlFor="delete-account">Delete Account</Label>
                  </div>
                  <div className="col-span-3 flex md:justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-fit" color="red">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            color="red"
                          >
                            Yes, delete my account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </PublicLayout>
  );
}

function AuthenticatedResetPasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const [message, setMessage] = useState({ type: "", content: "" });

  const onSubmit = async (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setMessage({ type: "", content: "" });

    try {
      const response = await fetch("/api/v1/account/in/reset-password", {
        method: "POST",
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await response.json();
      if (!json.ok) {
        throw new Error("Failed to reset password.");
      }

      setMessage({
        type: "success",
        content: "Password has been reset successfullyly.",
      });
      reset();
    } catch (error) {
      setMessage({
        type: "error",
        content: "An error occurred. Please try again later.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your current password and a new password to reset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4 gap-2">
            <div className="col-span-1 flex items-center">
              <Label htmlFor="oldPassword">Current Password</Label>
            </div>
            <div className="col-span-3">
              <Input
                id="oldPassword"
                type="password"
                {...register("oldPassword", {
                  required: "Current password is required",
                })}
                placeholder="Enter your current password"
              />
              {errors.oldPassword && (
                <Text className="text-red-500">
                  {errors.oldPassword.message}
                </Text>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4 gap-2">
            <div className="col-span-1 flex items-center">
              <Label htmlFor="newPassword">New Password</Label>
            </div>
            <div className="col-span-3">
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                  maxLength: {
                    value: config.__PRIVATE__.MAX_PASSWORD_LENGTH,
                    message: `Password must be less than ${config.__PRIVATE__.MAX_PASSWORD_LENGTH} characters`,
                  },
                })}
                placeholder="Enter your new password"
              />
              {errors.newPassword && (
                <Text className="text-red-500">
                  {errors.newPassword.message}
                </Text>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4 gap-2">
            <div className="col-span-1 flex items-center">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
            </div>
            <div className="col-span-3">
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("newPassword") || "Passwords do not match",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                  maxLength: {
                    value: config.__PRIVATE__.MAX_PASSWORD_LENGTH,
                    message: `Password must be less than ${config.__PRIVATE__.MAX_PASSWORD_LENGTH} characters`,
                  },
                })}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <Text className="text-red-500">
                  {errors.confirmPassword.message}
                </Text>
              )}
            </div>
          </div>
          {message.content && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
            >
              <AlertDescription>{message.content}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-fit" color="teal">
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const questionOptions = [
  { value: "pet", label: "What was the name of your first pet?" },
  { value: "school", label: "What elementary school did you attend?" },
  { value: "city", label: "In what city were you born?" },
  { value: "mother", label: "What is your mother's maiden name?" },
  { value: "car", label: "What was the make of your first car?" },
  { value: "street", label: "What street did you grow up on?" },
  { value: "book", label: "What was the first book you remember reading?" },
  { value: "job", label: "What was your first job?" },
  { value: "teacher", label: "Who was your favorite teacher?" },
];

function SecurityQuestionsForm() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      questions: Array(3).fill({ question: "", answer: "" }),
    },
  });

  const useSecurityQuestions = useAuthStore(
    (state) => state.useSecurityQuestions
  );

  const onSubmit = async (data: FormData) => {
    await useSecurityQuestions(data.questions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Questions</CardTitle>
        <CardDescription>
          If you forget your password, you can reset it using your security
          questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 md:gap-4 gap-2"
            >
              <div className="col-span-1 flex items-center">
                <Label htmlFor={`questions[${index}].question`}>
                  Question {index + 1}
                </Label>
              </div>
              <div className="col-span-3 space-y-2">
                <Controller
                  name={`questions.${index}.question`}
                  control={control}
                  rules={{ required: "Please select a question" }}
                  render={({ field }) => (
                    <Select {...field} onChange={field.onChange}>
                      {questionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                {errors.questions?.[index]?.question && (
                  <p className="text-sm text-red-500">
                    {errors.questions[index].question?.message}
                  </p>
                )}
                <Controller
                  name={`questions.${index}.answer`}
                  control={control}
                  rules={{
                    required: "Please provide an answer",
                    maxLength: {
                      value: config.__PRIVATE__.MAX_SECRET_QUESTION_LENGTH,
                      message: `Answer must be less than ${config.__PRIVATE__.MAX_SECRET_QUESTION_LENGTH} characters`,
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Your answer"
                      required
                      maxLength={config.__PRIVATE__.MAX_SECRET_QUESTION_LENGTH}
                    />
                  )}
                />
                {errors.questions?.[index]?.answer && (
                  <Text className="text-red-500">
                    {errors.questions[index].answer?.message}
                  </Text>
                )}
              </div>
            </div>
          ))}
          <Button type="submit" className="w-fit" color="teal">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function UpdateProfileInformation() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const defaultValues = {
    email: user?.email || "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);

    const response = await fetchWithAuth("/api/v1/account/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!json.ok) {
      toast({
        title: "Failed to update email.",
        description: json.message,
      });
      throw new Error("Failed to update email.");
    }

    toast({
      title: "Email updated successfully.",
      description: "Your email has been updated.",
    });
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4 gap-2">
            <div className="col-span-1 flex items-center">
              <Label htmlFor="email">Email</Label>
            </div>
            <div className="col-span-3">
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                  maxLength: {
                    value: config.__PRIVATE__.MAX_EMAIL_LENGTH,
                    message: `Email must be less than ${config.__PRIVATE__.MAX_EMAIL_LENGTH} characters`,
                  },
                })}
                placeholder="Enter your new email"
              />
              <div className="space-y-2 gap-2 flex flex-col">
                {errors.email && (
                  <Text className="text-red-500">{errors.email.message}</Text>
                )}
              </div>
            </div>
          </div>
          <Button type="submit" color="teal">
            <Mail className="mr-2 h-4 w-4" />{" "}
            {isLoading ? "Updating..." : "Update Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
const Text = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm text-gray-500">{children}</p>;
};
const Heading = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-2xl font-bold">{children}</h1>;
};
