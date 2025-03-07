import React from "react";
import { Controller, Control, useFormContext } from "react-hook-form";
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { LucideIcon } from "lucide-react-native";

interface GenericCheckboxProps {
  name: string;
  // control: Control;
  defaultValue: boolean;
  icon: LucideIcon;
  label: string;
}

const GenericCheckbox: React.FC<GenericCheckboxProps> = ({
  name,
  defaultValue,
  icon: Icon,
  label,
}) => {
  const { control } = useFormContext();

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
          value={value}
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
