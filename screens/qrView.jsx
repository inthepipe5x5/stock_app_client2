import React, { useState } from "react";
import { ActivityIndicator } from "react-native";
import { Text, Button, Center, VStack } from "@gluestack-ui/themed";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Camera } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";

export default function QRView({ props }) {
  const [qrValue, setQRValue] = useState(props.qrValue ?? "");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Generates a QR code when called.
   * This function sets the loading state and activates the QR code generation process.
   * It should be called when the user requests a QR code for a product.
   *
   * @function
   * @name generateQRCode
   * @returns {void}
   */
  const generateQRCode = () => {
    if (!qrValue) return;

    setIsLoading(true);
    setIsActive(true);
    setIsLoading(false);
  };

  const handleInputChange = (text) => {
    setQRValue(text);

    if (!text) {
      setIsActive(false);
    }
  };

  return (
    <Center className="flex-1 bg-gray-200">
      <VStack className="max-w-xs bg-white rounded-lg p-5 shadow-lg">
        <Text className="text-xl font-medium mb-2">QR Code Generator</Text>
        <Text className="text-gray-600 text-base mb-5">
          Paste a URL or enter text to create a QR code
        </Text>
        <InputField>
          <Input
            type="text"
            className="text-lg p-4 border border-gray-400 rounded mb-5"
            placeholder="Enter text or URL"
            value={qrValue}
            onChangeText={handleInputChange}
          />
        </InputField>
        <Button
          className="bg-blue-500 rounded p-4 flex-row items-center justify-center"
          onPress={generateQRCode}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Camera color="#fff" size={20} />
              <Text className="text-white text-lg ml-2">Generate QR Code</Text>
            </>
          )}
        </Button>
        {isActive && (
          <Center className="mt-5">
            <QRCode
              value={qrValue}
              size={200}
              color="black"
              backgroundColor="white"
            />
          </Center>
        )}
      </VStack>
    </Center>
  );
}
