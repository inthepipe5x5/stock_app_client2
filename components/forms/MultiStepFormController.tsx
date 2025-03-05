import React, { useState, useRef } from "react";
import { FormControl } from "@/components/ui/form-control";
import { FormControlContext } from "@gluestack-ui/form-control/lib/useFormControl";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { ZodAny } from "zod";
import isTruthy from "@/utils/isTruthy";
import { zodResolver } from "@hookform/resolvers/zod";

type MultiStepFormProps = {
  zodSchemaArray: ZodAny[]; // The form input names
  children: React.ReactNode;
  onFinalSubmit: (values: any) => void;
  formProps?: any;
  initialFormData?: Object | null | undefined;
}

const MultiStepFormController = ({ zodSchemaArray, children, initialFormData, }: MultiStepFormProps) => {
  const [step, setStep] = useState<number>(1);

  const combinedMethods = zodSchemaArray.map((schema) => useForm({ resolver: zodResolver(schema), defaultValues: initialFormData || {} }));



  return (
    <Animated.View
      entering={FadeInLeft}
      exiting={FadeInRight}
    >

      <FormProvider {...combinedMethods}>
      </FormProvider>
    </Animated.View>
  );
}

const MultiStepForm = ({
  zodSchemaArray, // The form input names
  children, // The form steps
  onFinalSubmit, // The final submit function
  formProps, // The form props
  initialFormData, // The initial form data
}: any) => {
  const [step, setStep] = useState<number>(1);
  const inputRefs = useRef<{ [key: string]: any }>({});

  let currentContent = children[step];

  const formContext = useFormContext();
  const { handleSubmit, ...methods } = formContext;

  const handleNext = async () => {
    //validate current fields
    const isValid = await methods.trigger();
    //do nothing if the form is invalid
    if (!isTruthy(isValid)) return;
    setStep((prev) => (prev === zodSchemaArray.length ? prev : prev + 1));
  };

  const handlePrev = async () => {
    //validate current fields
    const isValid = await methods.trigger();
    //do nothing if the form is invalid
    if (!isTruthy(isValid)) return;
    setStep((prev) => prev >= 1 ? 1 : prev - 1);
  };

  const handleFocus = (name: string) => {
    inputRefs.current[name]?.scrollIntoView({ behavior: "smooth" });
    inputRefs.current[name]?.focus();
  };

  const handleSectionSubmit = async (methods: { trigger: () => any; handleSubmit: (arg0: any) => { (): any; new(): any; }; }) => {
    //validate current fields
    const sectionValidated = await methods.trigger()
    if (sectionValidated) {
      return (step === formProps.steps.length - 1) ?
        handleSubmit(onFinalSubmit)() : handleNext();
    }
  };


};
export default MultiStepForm;