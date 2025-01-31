import { createIcon } from "@gluestack-ui/icon";
import { Path, G, Svg } from "react-native-svg";

const FacebookIcon: any = ({ ...props }) => {
  return createIcon({
    Root: Svg,
    viewBox: props?.viewBox ?? "0 0 24 24",
    path: (
      <G>
        <Path
          fill={props?.fill ?? "none"}
          stroke={props?.stroke ?? "currentColor"}
          strokeWidth={props?.strokeWidth ?? "1.5"}
          strokeLinecap={props?.strokeLinecap ?? "round"}
          strokeLinejoin={props?.strokeLinejoin ?? "round"}
          d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
        />
      </G>
    ),
  });
};

export default FacebookIcon;
