import React from "react";
import { Controller, Control } from "react-hook-form";
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxLabel,
} from "@gluestack-ui/react";
import { LucideIcon } from "lucide-react-native";

interface GenericCheckboxProps {
  name: string;
  control: Control;
  defaultValue: boolean;
  icon: LucideIcon;
  label: string;
}

const GenericCheckbox: React.FC<GenericCheckboxProps> = ({
  name,
  control,
  defaultValue,
  icon: Icon,
  label,
}) => {
  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      control={control}
      render={({ field: { onChange, value } }) => (
        <Checkbox
          size="sm"
          isChecked={value}
          onChange={onChange}
          aria-label={label}
        >
          <CheckboxIndicator>
            <Icon />
          </CheckboxIndicator>
          <CheckboxLabel>{label}</CheckboxLabel>
        </Checkbox>
      )}
    />
  );
};

export default GenericCheckbox;
