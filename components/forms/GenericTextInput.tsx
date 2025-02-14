// GenericTextInputs.tsx
import React from "react";
import { Controller } from "react-hook-form";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react-native";

interface GenericTextInputsProps {
  control: any; // from useForm
  errors: any; // from useForm
  formProps: {
    formName: string;
    formLabelText: string;
    formPlaceholder: string;
    formInputType?: "text" | "password";
    formDefaultValue?: string | number | boolean | null;
    returnKeyType?: "done" | "next"; //| "go" | "search" | "send";
  };
}

/**
 * Text Input Field for GenericHookForm component.
 */
export function GenericTextInput({
  control,
  errors,
  formProps,
}: GenericTextInputsProps) {
  return (
    <>
      {/* Email Field */}
      <FormControl isInvalid={!!errors[formProps.formName]}>
        <FormControlLabel>
          <FormControlLabelText>
            {formProps.formLabelText ?? "Input Field"}
          </FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name={formProps.formName}
          defaultValue={formProps.formDefaultValue ?? ""}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder={formProps.formPlaceholder ?? "Enter text here"}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                type={formProps.formInputType ?? "text"}
                returnKeyType={formProps.returnKeyType ?? "next"}
                onSubmitEditing={() => onBlur()}
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorIcon size="sm" as={AlertTriangle} />
          <FormControlErrorText>
            {errors[formProps.formName].message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
    </>
  );
}
