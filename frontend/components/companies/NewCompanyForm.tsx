"use client";

import { useForm } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
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
        console.error("Company name is required");
        return;
      }
      writeContract({
        address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        abi: eco2ContractConfig.abi,
        functionName: "registerCompany",
        args: [],
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
        <CardTitle>Register new company</CardTitle>
        <CardDescription>Fill in the company details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="new-company-form"
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
                    <FieldLabel htmlFor={field.name}>Company Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter company name"
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
          <Button type="submit" form="new-company-form" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
            { isPending ? "Creating..." : "Create Company" }
          </Button>
        </Field>
        {isLoading && <div>Waiting for confirmation...</div>}
        {isSuccess && <div>Transaction confirmed.</div>}
      </CardFooter>
    </Card>
  );
}
