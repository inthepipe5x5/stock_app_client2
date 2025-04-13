import { useEffect, useState } from 'react';
import { RelativePathString, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { HStack } from '@/components/ui/hstack';
import Colors from '@/constants/Colors';
// import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';
import * as ExpoLocation from 'expo-location';
import { VStack } from '@/components/ui/vstack';
import { Image } from '@/components/ui/image';
import { RotateInUpRight } from 'react-native-reanimated';

type PermissionStatus = 'granted' | 'denied' | 'restricted' | 'undetermined' | 'limited' | 'blocked' | 'unavailable';
type PermissionTypes = 'camera' | 'gallery' | 'location' | 'default';

export default function requestPermissionsFnView() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const title = params?.title?.[0] ?? 'Permissions Required';
    const message = params?.message?.[0] ?? 'Please grant the following permissions to proceed.';
    const nextURL = params?.nextURL?.[0];
    const [permission, requestPermission] = useCameraPermissions();
    const permissions = Array.isArray(params?.permissions)
        ? Array.from(new Set(params?.permissions))
        : Array.from(new Set(params?.permissions?.split(',') ?? ['default']));
    const colors = Colors[useColorScheme() ?? 'light'];

    const [permissionStatuses, setPermissionStatuses] = useState<Record<"camera" | "gallery" | "location", PermissionStatus>>({
        camera: permission?.status ?? 'undetermined',
        gallery: permission?.status ?? 'undetermined',
        location: 'undetermined',
    });



    const requestPermissionsFn = async (type: PermissionTypes) => {
        try {
            const permissionType: PermissionTypes = type || 'default';
            if (!permissionType) {
                throw new Error('Permission type is required');
            }
            // Check if all permissions are granted
            if (Object.entries(permissionStatuses).every(([key, value]) => value === 'granted' && (key as PermissionTypes))) {
                return;
            }
            let response: { status: PermissionStatus } | undefined;
            if (permissionType === 'default') await requestAllPermissions();
            else if (['gallery', 'camera'].includes(permissionType)) {
                response = await requestPermission();
                setPermissionStatuses((prev) => ({
                    ...prev,
                    [permissionType]: response?.status ?? 'unavailable',
                }));
            }
            else if (permissionType === 'location') {
                response = await ExpoLocation.requestForegroundPermissionsAsync();
                setPermissionStatuses((prev) => ({
                    ...prev,
                    [permissionType]: response?.status ?? 'unavailable',
                }));
            }
        } catch (error) {
            console.error(`Error requesting ${type} permission:`, error);
        }
    };

    const requestAllPermissions = async () => {
        //make a copy of the initial permissions
        const initialPermissions = { ...permissionStatuses }

        //request camera permission
        const cameraResponse = await requestPermission();
        initialPermissions.camera = cameraResponse?.status ?? 'unavailable';
        //request location permission
        const locationResponse = await ExpoLocation.requestForegroundPermissionsAsync();
        initialPermissions.location = locationResponse?.status ?? 'unavailable';

        //set the permission statuses
        setPermissionStatuses(initialPermissions);

        console.log('Permissions updated:', { permissionStatuses });
    }

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
            router.canDismiss() ?
                router.dismiss() :
                router.replace({
                    pathname: (pathname ?? "/+notfound") as RelativePathString,
                    params: {
                        dismissToURL: nextURL,
                        nextURL,
                        ...params,
                    },
                });
    };

    useEffect(() => {

        console.log('Requesting permissions:', permissions, { params });

        permissions.forEach((permission) => {
            if (['camera', 'gallery', 'default', 'location'].includes(permission)) {
                requestPermissionsFn(permission as PermissionTypes);
            } else {
                console.warn(`Invalid permission type: ${permission}`);
            }
        });
    }, [permissions]);

    const handleDismiss = () => {
        router.replace(nextURL as RelativePathString);
    };

    return (
        <SafeAreaView style={[styles.centered, styles.container]}>
            {Platform.OS === 'android' ? <StatusBar style="light" /> : <StatusBar style="auto" />}
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: title,
                    headerStyle: { backgroundColor: colors.primary.main },
                    headerTintColor: colors.accent,
                }}
            />
            <ThemedView style={[
                styles.container,
                styles?.centered,
                {
                    height: '80%',
                    // alignItems: 'flex-start',
                    // justifyContent: 'space-evenly',
                    paddingHorizontal: 20,
                    backgroundColor: colors.background,
                    borderRadius: 50,
                    overflow: 'hidden',
                    width: '100%',
                    // paddingVertical: 2,
                    marginVertical: 20,
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
                <VStack>

                    <ThemedText
                        type="title"
                        style={{ textAlign: 'center' }}
                        className="text-3xl font-bold py-6 my-6"
                    >
                        {title}
                    </ThemedText>
                    <Image
                        className="rounded-full my-6 py-5 h-1/2 w-1/2 aspect-[263/240]"
                        source={require("@/assets/images/splash-icon.png")}
                        resizeMethod="auto"
                        alt="Auth Landing Image"
                    />
                    <ThemedText type="default" className="text-center py-6 my-6">
                        {message}
                    </ThemedText>
                </VStack>
                <VStack space="md" className="flex-col items-center justify-center mb-6 px-5 mx-5">
                    {permissions.map((permission) => {
                        return ['camera', 'gallery', 'default', 'location'].includes(permission) ? (
                            <Pressable
                                key={permission}
                                onPress={() => requestPermissionsFn(permission as PermissionTypes)}
                                className="bg-success-700"
                                style={[
                                    styles.button,
                                    {
                                        flexDirection: 'row',
                                        paddingVertical: 15,
                                        marginBottom: 30,
                                        borderRadius: 5,
                                        paddingHorizontal: 20,
                                        width: '100%', // Ensure the button takes up full width
                                    },
                                ]}
                            >
                                <HStack
                                    style={[
                                        styles.buttonContent,
                                        {
                                            flex: 1, // Make the HStack take up full width
                                            justifyContent: 'center', // Center the content horizontally
                                        },
                                    ]}
                                >
                                    <ThemedText type="link" style={{ color: colors.navigation.default }}>
                                        Set {permission.charAt(0).toUpperCase() + permission.slice(1)} Permission
                                    </ThemedText>
                                </HStack>
                            </Pressable>
                        ) : null
                    })
                    }
                </VStack>
                <Pressable
                    onPress={handleDismiss}
                    style={{
                        backgroundColor: colors.accent,
                        flexDirection: 'row',
                        paddingVertical: 15,
                        marginBottom: 30,
                        borderRadius: 5,
                        paddingHorizontal: 20,
                    }}
                >
                    <HStack style={styles.buttonContent}>
                        <ThemedText type="link" style={{ color: colors.navigation.default }}>
                            Dismiss
                        </ThemedText>
                    </HStack>
                </Pressable>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 32,
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        marginTop: 15,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
    },
    buttonContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
