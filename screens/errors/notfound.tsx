import { RelativePathString, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import { Image } from '@/components/ui/image';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, HomeIcon } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import Colors from '@/constants/Colors';

export default function NotFoundScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const title = params?.title?.[0] ?? 'Page Not Found';
  const message = params?.message?.[0] ?? 'The page you are looking for does not exist or has been moved.';
  const nextURL = params?.nextURL?.[0] ?? '/(auth)';
  const linkText = params?.linkText?.[0] ?? 'Go back';
  const colors = Colors[useColorScheme() ?? 'light'];
  const oppositeColors = Colors[useColorScheme() === 'dark' ? 'light' : 'dark'];

  const handleRedirect = ({
    pathname,
    params,
  }:
    {
      pathname?: string | undefined;
      params?: { [key: string]: any } | undefined;
    } = {
      pathname: nextURL,
      params: {
        message: [...(message ?? 'Page not found')],
        dismissToURL: nextURL,
        nextURL: nextURL,
      }
    }) => {

    return !!!pathname && router.canGoBack() ?
      router.back() :
      router.replace({
        pathname: pathname as RelativePathString ?? "/(auth)",
        params: {
          dismissToURL: nextURL,
          nextURL,
          ...params,
        },
      });
  };

  return (
    <SafeAreaView style={

      {
        ...styles.centered,
        ...styles.container,
        height: '100%',
        // backgroundColor: oppositeColors.navigation.selected,


      }}>
      {
        Platform.OS === "android" ? (
          <StatusBar style="light" />
        ) : (
          <StatusBar style="auto" />
        )
      }
      <Stack.Screen
        options={{
          headerShown: true,
          title: Array.isArray(params?.title) ? params?.title?.[0] : params?.title ?? "Page Not Found",
          // headerStyle: {
          //   backgroundColor: colors.primary.main,
          // },
          // headerTintColor: colors.accent,
          // headerLeft: () => (
          //   <Pressable
          //     className="align-center justify-center flex-row"
          //     onPress={() => handleRedirect({
          //       pathname: nextURL as RelativePathString,
          //       params: {
          //         message: [...(message ?? 'Page not found')],
          //         nextURL: nextURL,
          //       }
          //     })}
          //   >
          //     <ChevronLeft color={colors.accent} />
          //   </Pressable>
          // ),
          // presentation: Platform.OS === 'web' ? 'card' : 'containedTransparentModal',
          // headerShadowVisible: true,
          // animation: "slide_from_left",
          // animationDuration: 1000,
          // animationMatchesGesture: Platform.OS === 'ios',
          // animationTypeForReplace: Platform.OS === 'web' ? "pop" : "push",
          // freezeOnBlur: ['ios', 'android'].includes(Platform.OS.toLowerCase()),
          // contentStyle: {
          //   flex: 1,
          //   alignItems: 'center',
          //   justifyContent: 'center',
          //   paddingHorizontal: 'auto',
          //   paddingVertical: 'auto',
          //   margin: 'auto'
          // },
        }}
      />
      <ThemedView style={[
        styles.container,
        {
          height: '80%',
          alignItems: 'flex-start',
          justifyContent: 'space-evenly',
          paddingHorizontal: 20,
          backgroundColor: colors.background,
          borderRadius: 50,
          overflow: 'hidden',
          width: '100%',
          paddingTop: 5,
          marginTop: 5,
          shadowColor: '#808080',
          shadowOffset: {
            width: 5,
            height: 50,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          elevation: 5,
        },
      ]}>
        <ThemedText
          type="title"
          className="text-center text-3xl font-bold mb-4 mx-auto"
        >
          {title}
        </ThemedText>

        <Image
          source={require('@/assets/auth/forget.png')}
          alt="Not Found"
          resizeMethod="auto"
          className="mb-6 h-[240px] w-full rounded-md aspect-[263/240] mx-auto"
        />

        {message ? <ThemedText type="default">{message}</ThemedText> : null}
        <Pressable
          onPress={() => handleRedirect({
            pathname: nextURL as RelativePathString, params: {
              message: [...(message ?? 'Page not found')],
              nextURL: nextURL,
            }
          })}
          style={[styles.link, {
            borderRadius: 30,
            backgroundColor: colors.navigation.default,
            alignItems: 'center',
            justifyContent: 'center',
          }]}>
          <HStack
            style={[
              styles.link,
              {
                alignItems: 'center',
                justifyContent: 'space-around'
              }]}>
            <ChevronLeft />
            <ThemedText type="link" style={{ color: colors.accent }}>{linkText}</ThemedText>
          </HStack>
        </Pressable>
      </ThemedView >
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  container: {
    overflow: 'hidden',
    justifyContent: 'center',

  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
