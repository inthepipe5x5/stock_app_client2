// GenericTextInputs.tsx
import React from "react";
import { Controller, ControllerProps, useForm, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react-native"
import { IInputProps, IInputSlotProps } from "@gluestack-ui/input/lib/types";

export interface GenericTextInputsProps {
  method: {
    control: any; // from useForm
    errors: any; // from useForm
  } & Partial<ReturnType<typeof useFormContext>> & Partial<ReturnType<typeof useForm>>;
  inputProps: {
    inputLabelText: string;
    inputPlaceholder: string;
    inputInputType?: "text" | "password";
    inputDefaultValue?: string | number | boolean | null;
    returnKeyType?: "done" | "next"; //| "go" | "search" | "send";

  } & Partial<IInputProps> & Partial<IInputSlotProps>;
  controlProps: {
    rules: any;
    controllerInputName: string;
  } & Partial<ControllerProps>;
}

/**
 * Text Input Field for GenericHookForm component.
 */
export function GenericTextInput({
  method,
  inputProps,
  controlProps,
}: // {
  // control,
  // errors,
  // ...inputProps,
  // }
  GenericTextInputsProps) {
  const formContext = useFormContext();
  const { control, errors } = method;
  return (
    <>
      {/* Email Field */}
      <FormControl isInvalid={!!errors[controlProps.controllerInputName]}>
        <FormControlLabel>
          <FormControlLabelText className="text-sm mb-2">
            {inputProps.inputLabelText ?? "Input Field"}
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name={controlProps.controllerInputName}
          defaultValue={inputProps.inputDefaultValue ?? ""}
          {...controlProps}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder={inputProps.inputPlaceholder ?? "Enter text here"}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                type={inputProps.inputInputType ?? "text"}
                returnKeyType={inputProps.returnKeyType ?? "next"}
                onSubmitEditing={() => onBlur()}
                {...inputProps}
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorIcon size="sm" as={AlertTriangle} />
          <FormControlErrorText>
            {errors[controlProps.controllerInputName].message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
    </>
  );
}
