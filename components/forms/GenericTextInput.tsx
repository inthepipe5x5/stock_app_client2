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
import { HStack } from "@/components/ui/hstack";
import { AlertTriangle, CheckCircle } from "lucide-react-native"
import { IInputProps, IInputSlotProps } from "@gluestack-ui/input/lib/types";
import { capitalizeSnakeCaseInputName } from "@/utils/capitalizeSnakeCaseInputName";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnyZodObject } from "zod";

export interface GenericTextInputsProps {
  // method: {
  //   control: any; // from useForm
  //   errors: any; // from useForm
  // } & 
  // Partial<ReturnType<typeof useFormContext>> & Partial<ReturnType<typeof useForm>>, 
  inputProps: {
    required?: boolean;
    inputLabelText: string;
    inputPlaceholder: string;
    inputInputType?: "text" | "password";
    inputDefaultValue?: string | number | boolean | null;
    returnKeyType?: "done" | "next"; //| "go" | "search" | "send";

  };
  //& Partial<IInputProps> & Partial<IInputSlotProps>;
  controlProps: {
    rules: any;
    schema: AnyZodObject;
    controllerInputName: string;
  } & Partial<ControllerProps>;
}


/**
 * HELPER FUNCTION TO CREATE TEXT INPUT PROPS
 */
export const baseInputProps = ({ inputName, placeholder = null, textType = "text", returnKeyType = "next", required = true, schema, customRules = null, defaultValues = "", ...props }: { inputName: string, placeholder?: string | null, textType?: "text" | "password"; returnKeyType?: "done" | "next", required?: boolean, defaultValues: any; schema: AnyZodObject, customRules?: any } & Partial<GenericTextInputsProps>) => {
  return {
    inputProps: {
      required: true,
      inputLabelText: inputName,
      inputPlaceholder: placeholder ?? `Enter ${inputName} Here`,
      inputInputType: textType === "text" ? "text" : "password",
      inputDefaultValue: defaultValues?.[inputName] ?? "",
      returnKeyType: returnKeyType === "done" ? returnKeyType : "next",
    },

    controlProps: customRules ?? {
      schema: schema,
      controllerInputName: inputName,
      rules: {
        required: required ? `${inputName} is required` : undefined,
        validate: async (value: any) => {
          try {
            await schema.parseAsync({
              [inputName]: value,
            });
            return true;
          } catch (error: any) {
            return error.message;
          }
        }
      }
    },
  }
}

/**
 * Text Input Field for GenericHookForm component.
 */
export function GenericTextInput({
  // method,
  inputProps,
  controlProps,
}: // {
  // control,
  // errors,
  // ...inputProps,
  // }
  GenericTextInputsProps) {
  const formContext = useFormContext();
  const { control, formState: { isValid, errors } } = formContext;

  //merge inputProps with default prop values
  const { rules, ...otherControlProps } = controlProps;
  const inputPropRules = rules ?? {
    controllerInputName: controlProps.controllerInputName,
    rules: {
      required: inputProps.required ? `${controlProps.controllerInputName} is required` : undefined,
      validate: async (value: any) => {
        try {
          await controlProps.schema.parseAsync({
            [controlProps.controllerInputName]: value,
          });
          return true;
        } catch (error: any) {
          return error.message;
        }
      }
    }
  }
  return (
    <>
      {/* Email Field */}
      <FormControl isInvalid={!!errors[controlProps.controllerInputName]}>
        <FormControlLabel>
          <HStack space="sm">
            {isValid && <CheckCircle className="bg-green-700" />}
            <FormControlLabelText className="text-sm mb-2">
              {inputProps.inputLabelText ?? "Input Field"}
            </FormControlLabelText>
          </HStack>
        </FormControlLabel>
        <Controller
          control={control}
          name={controlProps.controllerInputName}
          defaultValue={inputProps.inputDefaultValue ?? ""}
          rules={inputPropRules}
          {...otherControlProps}

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
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorIcon size="sm" as={AlertTriangle} />
          <FormControlErrorText>
            {errors[controlProps.controllerInputName]?.message && typeof errors[controlProps.controllerInputName]?.message === 'string'}
          </FormControlErrorText>
        </FormControlError>
      </FormControl >
    </>
  );
}

// export const createMSFTextInput = ({ inputName, refs, schema, inputRules, returnKeyType, }: any) => {
//   const parentFormContext = useFormContext()

//   const { formState: { isValid, errors, isDirty }, control, register } = parentFormContext
//   return (
//     <Controller>

//       <FormControl isInvalid={!!errors[inputName]} ref={refs}>
//         <FormControlLabel className="text-sm mb-2">
//           <FormControlLabelText>
//             {capitalizeSnakeCaseInputName(inputName)}
//           </FormControlLabelText>
//         </FormControlLabel>
//         control={control}
//         rules={required: "This field is required", ...inputRules}{
//           validate: async (value: string) => {
//             try {
//           await schema.partial.parseAsync({
//             [inputName]: value,
//           });
//         return true;
//             } catch (error: any) {
//               return error.message;
//             }
//           },
//         }}
//         render={({ field: { onChange, value } }: { field: { onChange: (value: string) => void, value: string } }) => (
//           <Input>
//             <HStack space="sm">
//               {isValid ?? <CheckCircle2Icon />}
//               <InputField
//                 placeholder={inputName}
//                 defaultValue={defaultValue[inputName] ?? ""}
//                 type="text"
//                 value={value}
//                 onFocus={() => handleFocus(inputName)}
//                 onChangeText={onChange}
//                 onSubmitEditing={() => handleKeyPress(inputName)}
//                 returnKeyType={returnKeyType ?? "next"}
//               />
//             </HStack>
//           </Input>
//         )}
//         <FormControlError>
//           <FormControlErrorIcon as={AlertCircleIcon} size="md" />
//           <FormControlErrorText>
//             {errors?.[inputName]?.message}
//           </FormControlErrorText>
//         </FormControlError>
//       </FormControl>
//     </Controller>

//   );


// };
