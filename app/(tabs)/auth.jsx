import { View, Image, StyleSheet, Platform, Pressable } from "react-native";
import React from "react";
import { router, Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "lucide-react-native";
import { HelloWave } from "@/components/HelloWave";
import { HStack } from "@gs/hstack";
import { VStack } from "@gs/vstack";
import { Text } from "@gs/text";
import { Icon } from "@gs/icon/index";

const AuthScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "orange" }}>
      <Tabs.Screen
        options={{
          headerShown: true,
          headerRight: () => {
            <Pressable
              style={{ backgroundColor: "orange" }}
              onPress={() => {
                router.dismissTo("/");
              }}
            >
              <Icon as={User} />
              <Text>Go home</Text>
            </Pressable>;
          },
        }}
      />
      {/* <ThemedView style={styles.titleContainer}> */}
      <VStack>
        <HStack>
          <HelloWave />
          <Text>AUTH TESTSEKL;J</Text>
        </HStack>
        <Pressable
          onPress={() => router.push("/")}
          style={{
            flexDirection: "row",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "grey",
            color: "white",
          }}
        >
          <Text style={{ flex: 1, color: "white" }}>Go Auth</Text>
        </Pressable>
      </VStack>
      {/* </ThemedView> */}
    </SafeAreaView>
  );
};

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: "absolute",
//   },
// });

export default AuthScreen;
