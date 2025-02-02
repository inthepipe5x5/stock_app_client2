import React from 'react';
import { Center } from '@gluestack-ui/themed';
import { VStack } from '@gluestack-ui/vstack';
import { Heading, Button, ButtonText, Text } from '@gluestack-ui/themed';
import { useRouter, Slot } from "expo-router";
const ErrorLayout = ({ error }) => {
const router = useRouter();

  return (
    <Center flex={1} px={4} bg="background"> {/* Default theme-based background */}
      <VStack space="md" alignItems="center">
        <Heading size="xl" color="primary">
          404 - Page Not Found
        </Heading>
        <Text color="muted" textAlign="center">
          The page you are looking for does not exist or has been moved.
        </Text>
        <Button onPress={() => router.push("/")} variant="solid">
          <ButtonText>Go Back Home</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'red',
    },
    messageText: {
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default ErrorLayout;