import { Icon, createIcon } from "@/components/ui/icon";
import { Platform } from "react-native";

type ThemeProp = "light" | "dark";

type AppIconProps = {
  theme: ThemeProp;
  width?: string | number;
  height?: string | number;
  viewBox?: string;
};

const defaultAppIconProps: AppIconProps = {
  theme: "light",
  width: 200,
  height: 200,
  viewBox: `0 0 200 200`,
};

// Mapping function for icon sizes
const iconSizeMapper = (size: number) => {
  switch (true) {
    case size <= 50:
      return "sm";
    case size <= 100:
      return "md";
    case size <= 150:
      return "lg";
    default:
      return "xl";
  }
};

// Light and Dark Mode Icons
const LightModeIcon = createIcon({
  viewBox: "0 0 200 200",
  d: `M5 5 H195 V195 H5 Z M35 35 H165 V165 H35 Z M35 100 H165 M60 110 H70 V140 H60 Z 
      M80 110 H88 V140 H80 Z M100 110 H112 V140 H100 Z M120 110 H126 V140 H120 Z 
      M140 110 H148 V140 H140 Z`,
});

const DarkModeIcon = createIcon({
  // Root: Icon, // Use the correct component as the root
  viewBox: "0 0 200 200",
  d: `M5 5 H195 V195 H5 Z M35 35 H165 V165 H35 Z M35 100 H165 M60 110 H70 V140 H60 Z 
      M80 110 H88 V140 H80 Z M100 110 H112 V140 H100 Z M120 110 H126 V140 H120 Z 
      M140 110 H148 V140 H140 Z`,
});

// Main App Icon Component
const AppIcon = (props: AppIconProps) => {
  const {
    theme = "light",
    width = 200,
    height = 200,
  } = {
    ...defaultAppIconProps,
    ...props,
  };

  const size = Math.min(+width, +height); // Ensure size is a number
  const mappedSize = iconSizeMapper(size) || "md";

  if (Platform.OS === "web") {
    // Return the SVG for web platforms
    return theme === "dark" ? (
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="5"
          width="190"
          height="190"
          rx="15"
          fill="#181719"
          stroke="#ffe0c2"
          strokeWidth="5"
        />
        <rect
          x="35"
          y="35"
          width="130"
          height="130"
          fill="none"
          stroke="#f97b06"
          strokeWidth="5"
          strokeDasharray="10,10"
        />
        <line
          x1="35"
          y1="100"
          x2="165"
          y2="100"
          stroke="#f97b06"
          strokeWidth="5"
        />
        <polygon points="100,50 60,90 140,90" fill="#ffe0c2" />
        <rect x="60" y="110" width="10" height="30" fill="#a15712" />
        <rect x="80" y="110" width="8" height="30" fill="#a15712" />
        <rect x="100" y="110" width="12" height="30" fill="#a15712" />
        <rect x="120" y="110" width="6" height="30" fill="#a15712" />
        <rect x="140" y="110" width="8" height="30" fill="#a15712" />
      </svg>
    ) : (
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="5"
          width="190"
          height="190"
          rx="15"
          fill="#FBFBFB"
          stroke="#3d1e00"
          strokeWidth="5"
        />
        <rect
          x="35"
          y="35"
          width="130"
          height="130"
          fill="none"
          stroke="#f97b06"
          strokeWidth="5"
          strokeDasharray="10,10"
        />
        <line
          x1="35"
          y1="100"
          x2="165"
          y2="100"
          stroke="#f97b06"
          strokeWidth="5"
        />
        <polygon points="100,50 60,90 140,90" fill="#3d1e00" />
        <rect x="60" y="110" width="10" height="30" fill="#eda35e" />
        <rect x="80" y="110" width="8" height="30" fill="#eda35e" />
        <rect x="100" y="110" width="12" height="30" fill="#eda35e" />
        <rect x="120" y="110" width="6" height="30" fill="#eda35e" />
        <rect x="140" y="110" width="8" height="30" fill="#eda35e" />
      </svg>
    );
  }

  // Return the mobile icons for mobile platforms
  return theme === "dark" ? (
    <Icon as={DarkModeIcon} size={mappedSize} />
  ) : (
    <Icon as={LightModeIcon} size={mappedSize} />
  );
};

export default AppIcon;
export { AppIconProps };
