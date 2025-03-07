import React, { useState, useRef } from "react";
import { FormControl } from "@/components/ui/form-control";
import { FormControlContext } from "@gluestack-ui/form-control/lib/useFormControl";
import { FormProvider, useForm } from "react-hook-form";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { ZodObject } from "zod";
import isTruthy from "@/utils/isTruthy";
import { zodResolver } from "@hookform/resolvers/zod";
import ReusableTitleCard, { ReusableTitleParams } from "../ReusableTitleCard";
import { HStack } from "../ui/hstack";
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react-native";


type MultiStepFormProps = {
  // zodSchemaArray: ZodAny[]; // The form input names
  zodSchema: ZodObject<any>; // The form input names
  children: React.ReactNode[];
  onFinalSubmit: (values: any) => void;
  formProps?: any;
  initialFormData?: Object | null | undefined;
  titleProps?: Array<Partial<ReusableTitleParams>>;
}

export const MultiStepFormController = ({ zodSchema, children, initialFormData, titleProps, onFinalSubmit }: MultiStepFormProps) => {
  const [currentFormStep, setCurrentFormStep] = useState<number>(1);

  // const combinedMethods = zodSchemaArray.map((schema) => useForm({ resolver: zodResolver(schema), defaultValues: initialFormData || {} }));
  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: initialFormData || {}
  });

  const inputRefs = useRef<{ [key: string]: any }>({});

  const handleNext = async () => {
    //validate current fields
    const isValid = await methods.trigger();
    //do nothing if the form is invalid
    if (!isTruthy(isValid)) return;
    setCurrentFormStep((prev) => (prev === (titleProps?.length ?? 0) ? prev : prev + 1));
  };

  const handlePrev = async () => {
    //validate current fields
    const isValid = await methods.trigger();
    //do nothing if the form is invalid
    if (!isTruthy(isValid)) return;
    setCurrentFormStep((prev) => prev >= 1 ? 1 : prev - 1);
  };

  const handleFocus = (name: string) => {
    inputRefs.current[name]?.scrollIntoView({ behavior: "smooth" });
    inputRefs.current[name]?.focus();
  };

  const handleSectionSubmit = async (methods: { trigger: () => any; handleSubmit: (arg: any) => (e?: React.BaseSyntheticEvent) => Promise<void>; }) => {
    //validate current fields
    const sectionValidated = await methods.trigger()
    if (sectionValidated) {
      return (currentFormStep === (titleProps?.length ?? 0) - 1) ?
        methods.handleSubmit(onFinalSubmit)() : handleNext();
    }
  };

  return (
    <FormProvider {...methods}>
      <FormControlContext.Provider value={{
        handleFocus: handleFocus,
        handleNext: handleNext,
        handlePrev: handlePrev,
        handleSectionSubmit: handleSectionSubmit,
        currentFormStep: currentFormStep,
        setCurrentFormStep: setCurrentFormStep,
        inputRefs: inputRefs,
        schema: zodSchema
      }}>
        <Animated.View
          entering={FadeInLeft}
          exiting={FadeInRight}
        >

          {
            /*
            ----------------------------------------
            render dynamic title card based on the titleProps
            ----------------------------------------
            */
            titleProps && currentFormStep <= titleProps.length && (
              <ReusableTitleCard {...{ ...titleProps[currentFormStep - 1], titleText: titleProps[currentFormStep - 1]?.titleText || 'Confirm', subtitleText: `Step ${currentFormStep} of ${titleProps.length} - ${titleProps[currentFormStep - 1]?.subtitleText ?? ""}` }} />
            )}


          <FormControl>
            {
              /*
              ----------------------------------------
              render nested children input fields
              ----------------------------------------
              */
              children && children.map((child, index) => {
                return index + 1 === currentFormStep ? child : null;
              })
            }

            {/*
              ---------------------------------------
              Form section control buttons:
              - Next/Submit
              - Previous
              ---------------------------------------
              */}
            <HStack>
              <Button
                variant="outline"
                action="negative"
                onPress={handlePrev}
                disabled={currentFormStep === 1 || methods.formState.isValidating}>
                {
                  (methods.formState.isSubmitting || methods.formState.isValidating) ? (
                    //handle loading state
                    <ButtonSpinner size="small" />
                  ) :

                    ( //non=loading state
                      <ButtonIcon>
                        <ArrowLeft className="w-2" />
                      </ButtonIcon>
                    )
                }

              </Button>
              <Button
                variant="solid"
                action="positive"
                onPress={() => handleSectionSubmit(methods)}
                disabled={methods.formState.isSubmitting || methods.formState.isValidating || isTruthy(methods.formState.errors)}
              >
                {
                  (methods.formState.isSubmitting || methods.formState.isValidating) ? (
                    //handle loading state
                    <HStack space="sm">
                      <ButtonText className="text-ellipsis">
                        Submitting...
                      </ButtonText>
                      <ButtonSpinner size="small" />
                    </HStack>
                  ) :

                    ( //non=loading state
                      <HStack space="sm">
                        <ButtonText className="text-start">
                          { // if the current form step is the last step, change the button text to "Submit"  
                            currentFormStep === (titleProps?.length ?? 0) - 1 ? "Submit" : "Next"}
                        </ButtonText>
                        <ButtonIcon>
                          <ArrowRight className="w-2" />
                        </ButtonIcon>
                      </HStack>
                    )
                }
              </Button>
            </HStack>
          </FormControl>
        </Animated.View>
      </FormControlContext.Provider>
    </FormProvider>
  );
}
