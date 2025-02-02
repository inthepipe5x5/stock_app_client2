import React from "react";
import { Text } from "@gluestack-ui/themed";
import { VStack, HStack } from "@gluestack-ui/themed";
import { useColorScheme } from "@/hooks/useColorScheme";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { FeatureList } from "@/constants/featureList"; // Assume this is your feature list array
import { Icon } from "@/components/ui/icon"; // Gluestack UI Icon component

export default function FeaturesScreen() {
  const colorScheme = useColorScheme();
  const headerBackgroundColor = {
    dark: "#333333", //gluestack-ui primary-500 token
    light: "#fdfdfd", //gluestack-ui secondary-0 token
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={headerBackgroundColor}
      headerTitle="App Features"
    >
      <VStack space="md">
        {FeatureList.map((feature, index) => (
          <HStack
            key={index}
            space="sm"
            alignItems="center"
            className="p-4 border border-border-50 rounded-md bg-background-100"
          >
            <Icon as={feature.icon} size="lg" className="text-primary-500" />
            <VStack space="xs" flex={1}>
              <Text className="font-bold text-lg">{feature.title}</Text>
              <Text className="text-sm text-muted">{feature.description}</Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </ParallaxScrollView>
  );
}
