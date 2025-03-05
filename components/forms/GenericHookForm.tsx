// GenericHookForm.tsx
import React, { useRef } from "react";
import { useForm, FormProvider, UseFormProps } from "react-hook-form";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { FormProviderProps } from "react-hook-form";
import { ArrowRightCircleIcon, CheckCircle } from "lucide-react-native";
import { HStack } from "../ui/hstack";
import { zodResolver } from "@hookform/resolvers/zod";

export type genericFormProps = {
  resolver: any;
  defaultValues?: any;
  delayError?: number;
  resetOptions?: any;
} & Partial<UseFormProps<any>>;
// | Partial<FormProviderProps<any>>;

export interface GenericHookFormProps {
  schema: any;
  formProps: genericFormProps;
  PrimaryButtonProps: {
    onPress: () => void;
    childInputElements: () => React.ReactNode;
    buttonText: string;
  };
  onFinalSubmit: (values: any) => void;
  setFormData?: React.Dispatch<
    React.SetStateAction<GenericHookFormProps["schema"]>
  >;
  currentStep?: number;
  finalStep?: number;
  setStep?: React.Dispatch<React.SetStateAction<number>>;
  childInputElements: (methods: ReturnType<typeof useForm>) => React.ReactNode;
}

/**
 * A generic form that sets up React Hook Form context,
 * then renders child fields with the same "control".
 */
export function GenericHookForm({
  schema,
  formProps,
  onFinalSubmit,
  PrimaryButtonProps,
  setFormData,
  currentStep,
  setStep,
  finalStep,
  childInputElements,
}: GenericHookFormProps) {
  //generate refs for each input from the schema
  const inputRefs = useRef<{ [key: string]: any }>(
    Object.fromEntries(Object.keys(schema).map((key) => [key, null]))
  ); // Stores refs for each
  const submitRef = useRef<any>(null);
  const methods = useForm<typeof schema>({ ...formProps, resolver: zodResolver(schema) });

  const handleFocus = (name: string) => {
    inputRefs.current[name]?.scrollIntoView({ behavior: "smooth" });
    inputRefs.current[name]?.focus();
  };

  const {
    handleSubmit,
    control,
    formState: { errors: formErrors },
    getValues,
  } = methods;

  const handleNext = () => {
    setFormData?.((prevData: any) => ({
      ...prevData,
      ...getValues(),
    }));
    setStep?.((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep?.((prev) => prev - 1);
  };

  const handleButtonSubmitPress = (values: any) => {
    // if current step is > finalStep, go to the next step
    if ((currentStep ?? 0) > (finalStep ?? 0)) {
      handleSubmit(handleNext)();
      // else, submit the form
    } else {
      onFinalSubmit(values ?? getValues());
    }
  };

  return (
    <FormProvider {...methods}>
      {/* {
        // render child input elements
        childInputElements({ control, handleFocus, inputRefs })
      } */}
      <Button
        className="mt-4"
        action={finalStep === currentStep ? "primary" : "positive"}
        {...PrimaryButtonProps}
        onPress={() => {
          handleButtonSubmitPress(getValues());
        }}
        ref={submitRef}
      >
        <HStack space="sm" className="items-center">
          <ButtonIcon
            as={finalStep === currentStep ? CheckCircle : ArrowRightCircleIcon}
          />
          <ButtonText className="font-medium text-color-100">
            {PrimaryButtonProps?.buttonText ??
              (finalStep === currentStep ? "Submit" : "Next")}
          </ButtonText>
        </HStack>
      </Button>
    </FormProvider>
  );
}
