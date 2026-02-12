"use client";

import { useForm } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
} from "./ui/field";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { type BaseError, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { eco2ContractConfig } from "@/contracts";
import { useEffect } from "react";
import { toast } from "sonner";

export default function NewProjectForm({onSuccess}: {onSuccess?: () => void}) {

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({hash});

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const form = useForm({
    defaultValues: {
      name: "",
    },
    onSubmit: (values) => {
      console.log("Form submitted with values:", values);
      if (!values.value.name) {
        console.error("Project name is required");
        return;
      }
      writeContract({
        ...eco2ContractConfig,
        functionName: "registerProject",
        args: [values.value.name],
      });
    },
  });

  useEffect(() => {
    if (error) {
      toast.error((error as BaseError).shortMessage);
    }
  }, [error])

  return (
    <Card className="w-full sm:max-w-md mt-10 p-6">
      <CardHeader>
        <CardTitle>Register new project</CardTitle>
        <CardDescription>Fill in the project details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="new-project-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Project Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter project name"
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
          <Button type="submit" form="new-project-form" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
            { isPending ? "Creating..." : "Create Project" }
          </Button>
        </Field>
        {isLoading && <div>Waiting for confirmation...</div>}
        {isSuccess && <div>Transaction confirmed.</div>}
      </CardFooter>
    </Card>
  );
}
