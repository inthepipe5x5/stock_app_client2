import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import type { AlertButton } from 'react-native'
import { Alert, Appearance, AppState, Linking, Platform, StyleSheet, View } from 'react-native'
import type { Code, CodeScannerFrame, CodeType, Frame } from 'react-native-vision-camera'
import { useCameraDevice, useCodeScanner } from 'react-native-vision-camera'
import { Camera } from 'react-native-vision-camera'
import { CONTENT_GAP, MAX_BUTTON_SIZE, SAFE_PADDING_VAL } from '@/constants/dimensions'
import { StatusBarBlurBackground } from '@/components/navigation/BlurBgStatusBar'
import { Pressable } from '@/components/ui/pressable'
import { router } from 'expo-router'
import { useIsFocused } from '@react-navigation/core'
import { ChevronLeft, FlashlightIcon, FlashlightOffIcon } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { defaultCodeTypes } from '@/lib/camera/utils'

const showCodeAlert = (value: string, onDismissed: () => void): void => {
    const buttons: AlertButton[] = [
        {
            text: 'Close',
            style: 'cancel',
            onPress: onDismissed,
        },
    ]
    if (value.startsWith('http')) {
        buttons.push({
            text: 'Open URL',
            onPress: () => {
                Linking.openURL(value)
                onDismissed()
            },
        })
    }
    Alert.alert('Scanned Code', value, buttons)
}

export function TestCodeScannerPage({
    customOnCodeScannedHandler,
    customCodeTypes = defaultCodeTypes,
}: {
    customCodeTypes?: CodeType[]
    customOnCodeScannedHandler?: (codes: Code[], frame: CodeScannerFrame) => void
}): React.ReactElement {

    // 1. Use a simple default back camera
    const device = useCameraDevice('back')

    // 2. Only activate Camera when the app is focused and this screen is currently opened
    const isFocused = useIsFocused()
    const isForeground = AppState.currentState === 'active'
    const isActive = isFocused && isForeground

    // 3. (Optional) enable a torch setting
    const [torch, setTorch] = useState(false)

    // 4. On code scanned, we show an alert to the user
    const isShowingAlert = useRef(false)

    const onCodeScanned = useCallback((codes: Code[], frame: CodeScannerFrame) => {
        if (!!customOnCodeScannedHandler) {
            return customOnCodeScannedHandler(codes, frame as CodeScannerFrame)

        }
        console.log(`Scanned ${codes.length} codes:`, codes, { frame })
        const value = codes[0]?.value
        if (value == null) return
        if (isShowingAlert.current) return
        showCodeAlert(value, () => {
            isShowingAlert.current = false
        })
        isShowingAlert.current = true
    }, [])

    // 5. Initialize the Code Scanner to scan QR codes and Barcodes
    const codeScanner = useCodeScanner({
        codeTypes: customCodeTypes ?? ['qr', 'ean-13'],
        onCodeScanned: onCodeScanned,
    })

    return (
        <GestureHandlerRootView style={styles.container}>
            {device != null && (
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={isActive}
                    codeScanner={codeScanner}
                    torch={torch ? 'on' : 'off'}
                    enableZoomGesture={true}
                />
            )}

            <StatusBarBlurBackground />

            <View style={styles.rightButtonRow}>
                <Pressable
                    style={[styles.button, {
                        opacity: torch ? 1 : 0.4,
                    }]}
                    onPress={() => setTorch(!torch)}
                    // disabledOpacity={0.4}
                    disabled={!torch}
                    android_ripple={{ color: 'white' }}

                >
                    <Icon as={torch ? FlashlightIcon : FlashlightOffIcon} color="white" size={'sm'} />
                </Pressable>
            </View>

            {/* Back Button */}
            <Pressable style={styles.backButton}
                onPress={() => router.canGoBack() ? router.back() : router.dismissTo('/')}
                android_ripple={{ color: 'white' }}
                hitSlop={10}
            >
                <ChevronLeft color="white" size={35} />
            </Pressable>

        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    button: {
        marginBottom: CONTENT_GAP,
        width: MAX_BUTTON_SIZE,
        height: MAX_BUTTON_SIZE,
        borderRadius: MAX_BUTTON_SIZE / 2,
        backgroundColor: 'rgba(140, 140, 140, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightButtonRow: {
        position: 'absolute',
        right: SAFE_PADDING_VAL.paddingRight,
        top: SAFE_PADDING_VAL.paddingTop,
    },
    backButton: {
        position: 'absolute',
        left: SAFE_PADDING_VAL.paddingLeft,
        top: SAFE_PADDING_VAL.paddingTop,
    },
})