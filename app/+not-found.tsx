import { Link, RelativePathString, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Pressable } from '@/components/ui/pressable';

export default function NotFoundScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const title = params?.title ?? 'Not Found';
  const message = params?.message ?? 'The page you are looking for does not exist or has been moved.';
  const nextURL = params?.nextURL?.[0] ?? '/(auth)';
  const linkText = params?.linkText?.[0] ?? 'Go back';

  const handleRedirect = (params?: {
    pathname?: string | undefined;
    params?: { [key: string]: any } | undefined;
    query?: { [key: string]: any } | undefined;
  }) => {
    if (!!!params) {
      return router.canGoBack() ? router.back() :
        router.replace({
          pathname: nextURL as RelativePathString ?? "/(auth)",
        });
    }
    else if (params?.pathname && params?.params) {
      router.push({
        pathname: params?.pathname as RelativePathString,
        params: params?.params,
      });
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: nextURL as RelativePathString ?? "/(auth)",
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">{title}</ThemedText>
        {message ? <ThemedText type="default">{message}</ThemedText> : null}
        <Pressable onPress={() => handleRedirect({
          pathname: nextURL as RelativePathString, params: {
            message: [...(message ?? 'Page not found')],
            nextURL: nextURL,
          }})} style={styles.link}>
        <ThemedText type="link">{linkText}</ThemedText>
      </Pressable>
    </ThemedView >
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
