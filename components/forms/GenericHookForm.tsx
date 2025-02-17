// GenericHookForm.tsx
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button, ButtonText } from "@/components/ui/button";

interface GenericHookFormProps {
  formProps: {
    zodResolver: any;
    defaultValues?: any;
    delayError?: number;
    resetOptions?: any;
  };
  PrimaryButtonProps: {
    onPress: () => void;
    childInputElements: () => React.ReactNode;
    buttonText: string;
  };
  onSubmit: (values: any) => void;
  childInputElements: (methods: ReturnType<typeof useForm>) => React.ReactNode;
}

/**
 * A generic form that sets up React Hook Form context,
 * then renders child fields with the same "control".
 */
export function GenericHookForm({
  formProps,
  onSubmit,
  PrimaryButtonProps,
  childInputElements,
}: GenericHookFormProps) {
  const methods = useForm(formProps);

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      {
        // render child input elements
        childInputElements(methods)
      }

      <Button
        className="mt-4"
        {...PrimaryButtonProps}
        onPress={handleSubmit(onSubmit)}
      >
        <ButtonText>{PrimaryButtonProps?.buttonText ?? "Submit"}</ButtonText>
      </Button>
    </FormProvider>
  );
}
