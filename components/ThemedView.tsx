import { Appearance, View, type ViewProps } from "react-native";
import Colors from "@/constants/Colors";
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const colorTheme = Appearance.getColorScheme() ?? "light";
  const backgroundColor = Colors[colorTheme].background //"light" 

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
