import React, { useState } from "react";
import { ActivityIndicator, Appearance, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Camera } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";

//simple qr code generator
const createQRCode = (value: string) => {
  return (
    <QRCode
      value={value}
      size={50}
      backgroundColor={Appearance.getColorScheme() === 'light' ? '#b3b3b3' : '#fbfbfb'} //Colors[Appearance.getColorScheme() ?? "light"].background,
      color={Appearance.getColorScheme() !== 'light' ? 'black' : 'white'} //Colors[Appearance.getColorScheme() ?? "light"].background,
    />
  )
}

export const InviteShareComponent = (props: {
  onInvite: (args: any) => void;
  onShare: (args: any) => void;
  onQR: (args: any) => void;
  qrCode?: string;
  currentPath: string;
  ResourceQR?: JSX.Element | null | undefined;
}) => {

  return (
    <HStack
      className="py-5  px-6 justify-between items-center rounded-2xl"
      space="2xl"
      style={{
        backgroundColor: Appearance.getColorScheme() === 'light' ? '#b3b3b3' : '#fbfbfb' //Colors[Appearance.getColorScheme() ?? "light"].background,
        ,
        backgroundSize: "cover",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 4.65,
        elevation: Platform.OS === 'android' ? 6 : 0, // For Android
      }}
    >
      <HStack space="2xl" className="items-center">
        <Box className="md:h-50 md:w-50 h-10 w-10">
          <Center>

            {//show QR code if it exists
              props.ResourceQR ?? createQRCode(props?.qrCode ?? props.currentPath)
            }
          </Center>
          {/* {

                      (<Image
                          source={require(props?.PromoImageURI ?? "@/assets/profile-screens/profile/image1.png")}
                          className="h-full w-full object-cover rounded-full"
                          alt="Promo Image"
                      />)} */}
        </Box>
        <VStack>
          <Text className="text-typography-900 text-lg" size="lg">
            Share this with someone
          </Text>
          <Text className="font-roboto text-sm md:text-[16px]">
            {props?.qrCode ?? `QR code ${props.currentPath}`}
          </Text>
        </VStack>
      </HStack>
      <Button
        onPress={props.onInvite}
        className="p-0 md:py-2 md:px-4 bg-background-0 active:bg-background-0 md:bg-background-900 ">
        <ButtonText className="md:text-typography-0 text-typography-800 text-sm">
          Invite
        </ButtonText>
      </Button>
    </HStack>
  )
}


export default function QRView(props: {
  qrValue?: string;
  onGenerate?: (args: any) => void;
  onShare?: (args: any) => void;
  onQR?: (args: any) => void;
  qrCode?: string;
  currentPath: string;
  ResourceQR?: JSX.Element | null | undefined;
}) {
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

  const handleInputChange = (text: string) => {
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
