import { useAuthStore } from "@/stores/auth";
import * as React from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { config } from "@/app_config";

interface FormData {
  questions: { question: string; answer: string }[];
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

export const Route = createFileRoute("/security-questions")({
  component: SecurityQuestionsComponent,
});

function SecurityQuestionsComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <main className="flex justify-center items-center h-screen">
      <SecurityQuestionsForm />
    </main>
  );
}

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Security Questions</CardTitle>
        <CardDescription>
          Please answer three security questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`questions[${index}].question`}>
                Question {index + 1}:
              </Label>
              <Controller
                name={`questions.${index}.question`}
                control={control}
                rules={{ required: "Please select a question" }}
                render={({ field }) => (
                  <Select {...field} onValueChange={field.onChange}>
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
                <p className="text-sm text-red-500">
                  {errors.questions[index].answer?.message}
                </p>
              )}
            </div>
          ))}
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
