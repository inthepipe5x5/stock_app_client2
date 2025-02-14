// GenericAuthForm.tsx
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button, ButtonText } from "@/components/ui/button";

interface GenericAuthFormProps {
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
export function GenericAuthForm({
  formProps,
  onSubmit,
  PrimaryButtonProps,
  childInputElements,
}: GenericAuthFormProps) {
  const methods = useForm(formProps);

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      {childInputElements(methods)}

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
