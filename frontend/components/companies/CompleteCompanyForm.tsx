'use client';

import { useForm } from "@tanstack/react-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useAccount } from "wagmi";
import { useAuth } from "../auth/AuthProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { BACKEND_URL } from "@/lib/config";
import { Textarea } from "../ui/textarea";

export default function CompleteCompanyForm() {
    const { address } = useAccount();
    const { authFetch } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        defaultValues: {
            industry: "",
            description: "",
            website: "",
        },
        onSubmit: async (values) => {
            if (!address) {
                toast.error("No wallet connected");
                return;
            }

            try {
                setIsSubmitting(true);
                const response = await authFetch(`${BACKEND_URL}/companies/${address}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        industry: values.value.industry,
                        website: values.value.website,
                        description: values.value.description,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to update company information");
                }

                toast.success("Company information updated successfully");
                router.push("/companies/dashboard");
            } catch (error) {
                console.error("Error updating company:", error);
                toast.error("Error updating company information");
            } finally {
                setIsSubmitting(false);
            }
        }
    })
    return (
        <Card className="w-full sm:max-w-md mt-10 p-6">
            <CardHeader>
                <CardTitle>Complete Company</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="complete-company-form" onSubmit={form.handleSubmit}>
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
                      placeholder="Enter company description"
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
              name="industry"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Industry</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter company industry"
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
                    <FieldLabel htmlFor={field.name}>Website</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="url"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="https://example.com"
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
                        form="complete-company-form" 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Complete registration"}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}