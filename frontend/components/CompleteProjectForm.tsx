"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useAccount } from "wagmi";
import { useAuth } from "./auth/AuthProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { BACKEND_URL } from "@/lib/config";

export default function CompleteProjectForm() {
  const { address } = useAccount();
  const { authFetch } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      description: "",
      image: "",
      website: "",
    },
    onSubmit: async (values) => {
      if (!address) {
        toast.error("No wallet connected");
        return;
      }

      try {
        setIsSubmitting(true);
        const response = await authFetch(`${BACKEND_URL}/projects/${address}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: values.value.description,
            image: values.value.image,
            website: values.value.website,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update project information");
        }

        toast.success("Project information updated successfully");
        router.push("/project/dashboard");
      } catch (error) {
        console.error("Error updating project:", error);
        toast.error("Error updating project information");
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  return (
    <Card className="w-full sm:max-w-md mt-10 p-6">
      <CardHeader>
        <CardTitle>Complete Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="complete-project-form" onSubmit={form.handleSubmit}>
          <FieldGroup>
            <form.Field
              name="description"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter project description"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="image"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Project Image</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter image URL"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="website"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Project Website
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter website URL"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button
            type="submit"
            form="complete-project-form"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Complete registration"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
