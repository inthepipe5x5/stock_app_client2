import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { AuthLayout } from "./(auth)/_layout";
const GenericIndexPage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {Platform.OS === "android" ? (
        <StatusBar style="light" />
      ) : (
        <StatusBar style="auto" />
      )}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {Constants.expoConfig.name ?? "My App"}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Welcome to My App</Text>
        <Text style={styles.paragraph}>
          This is a generic index page for your React Native application. You
          can customize it to fit your needs.
        </Text>

        <TouchableOpacity
          onPress={() => {
            router.push("/(tabs)/auth");
          }}
          style={{ backgroundColor: "orange", ...styles.button }}
        >
          <Text style={styles.buttonText}>Go to Auth</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push("/(scan)/");
          }}
          style={{ backgroundColor: "blue", ...styles.button }}
        >
          <Text style={styles.buttonText}>GO TO SCAN VIEW</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push("/countries");
          }}
          style={{ backgroundColor: "red", ...styles.button }}
        >
          <Text style={styles.buttonText}>Countries</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 My App. All rights reserved.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#3498db",
    padding: 20,
    alignItems: "center",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    // backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    backgroundColor: "#34495e",
    padding: 10,
    alignItems: "center",
  },
  footerText: {
    color: "#ffffff",
    fontSize: 12,
  },
});

export default () => (
  // <AuthLayout>
  <GenericIndexPage />
  // </AuthLayout>
);
