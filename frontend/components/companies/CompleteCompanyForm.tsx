'use client';

import { useForm } from "@tanstack/react-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";

export default function CompleteCompanyForm() {

    const form = useForm({
        defaultValues: {
            description: "",
            image: null,
            proposal: null
        },
        onSubmit: (values) => {
            console.log("Form submitted with values:", values);
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
          </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field>
                    <Button type="submit" form="complete-company-form" className="bg-emerald-600 hover:bg-emerald-700">
                        Complete registration
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}