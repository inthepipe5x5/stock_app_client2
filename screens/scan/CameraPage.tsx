import * as React from 'react'
import { useRef, useState, useCallback, useMemo } from 'react'
import type { GestureResponderEvent } from 'react-native'
import { AppState, StyleSheet, Text, View } from 'react-native'
import type { PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler'
import { PinchGestureHandler, TapGestureHandler } from 'react-native-gesture-handler'
import { RelativePathString, router } from 'expo-router'
import type { CameraProps, CameraRuntimeError, PhotoFile, VideoFile } from 'react-native-vision-camera'
import {
    Camera,
    useCameraDevice,
    useCameraDevices,
    useCameraFormat,
    useLocationPermission,
    useMicrophonePermission,
} from 'react-native-vision-camera'
import { CONTENT_GAP, MAX_BUTTON_SIZE, MAX_CAMERA_ZOOM, SAFE_PADDING_VAL, CURRENT_SCREEN_HEIGHT, CURRENT_SCREEN_WIDTH } from '@/constants/dimensions'
import Reanimated, { Extrapolate, interpolate, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from 'react-native-reanimated'
import { useEffect } from 'react'
import { StatusBarBlurBackground } from '@/components/navigation/BlurBgStatusBar'
import { CaptureButton } from '@/screens/scan/CameraCaptureButton'
import { Pressable } from '@/components/ui/pressable'
import { useIsFocused } from '@react-navigation/core'
import { Icon } from '@/components/ui/icon'
import { FlashlightIcon, FlashlightOffIcon, LucideSettings2, MoonIcon, ScanQrCode, SunMoonIcon, SwitchCameraIcon } from 'lucide-react-native'

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
Reanimated.addWhitelistedNativeProps({
    zoom: true,
})

const SCALE_FULL_ZOOM = 3

export function CameraPage(): React.ReactElement {
    const camera = useRef<Camera>(null)
    const [isCameraInitialized, setIsCameraInitialized] = useState(false)
    const microphone = useMicrophonePermission()
    const location = useLocationPermission()
    const zoom = useSharedValue(1)
    const isPressingButton = useSharedValue(false)

    // check if camera page is active
    const isFocussed = useIsFocused()
    const isForeground = AppState.currentState === 'active'
    const isActive = isFocussed && isForeground

    const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back')
    const [enableHdr, setEnableHdr] = useState(false)
    const [flash, setFlash] = useState<'off' | 'on'>('off')
    const [enableNightMode, setEnableNightMode] = useState(false)

    // camera device settings
    // const [preferredDevice] = usePreferredCameraDevice()
    const cameraDevices = useCameraDevices();
    const preferredDevice = cameraDevices.find((device) => device.position === cameraPosition)
    let device = useCameraDevice(cameraPosition)
    console.log(`Default camera device: ${device?.name}`)

    if (preferredDevice != null && preferredDevice.position === cameraPosition) {
        // override default device with the one selected by the user in settings
        device = preferredDevice
        console.log(`Using preferred device: ${device.name}`)
    }

    const [targetFps, setTargetFps] = useState(60)

    const screenAspectRatio = CURRENT_SCREEN_HEIGHT / CURRENT_SCREEN_WIDTH
    const format = useCameraFormat(device, [
        { fps: targetFps },
        { videoAspectRatio: screenAspectRatio },
        { videoResolution: 'max' },
        { photoAspectRatio: screenAspectRatio },
        { photoResolution: 'max' },
    ])

    const fps = Math.min(format?.maxFps ?? 1, targetFps)

    const supportsFlash = device?.hasFlash ?? false
    const supportsHdr = format?.supportsPhotoHdr
    const supports60Fps = useMemo(() => device?.formats.some((f) => f.maxFps >= 60), [device?.formats])
    const canToggleNightMode = device?.supportsLowLightBoost ?? false

    //#region Animated Zoom
    const minZoom = device?.minZoom ?? 1
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_CAMERA_ZOOM)

    const cameraAnimatedProps = useAnimatedProps<CameraProps>(() => {
        const z = Math.max(Math.min(zoom.value, maxZoom), minZoom)
        return {
            zoom: z,
        }
    }, [maxZoom, minZoom, zoom])
    //#endregion

    //#region Callbacks
    const setIsPressingButton = useCallback(
        (_isPressingButton: boolean) => {
            isPressingButton.value = _isPressingButton
        },
        [isPressingButton],
    )
    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error)
    }, [])
    const onInitialized = useCallback(() => {
        console.log('Camera initialized!')
        setIsCameraInitialized(true)
    }, [])
    const onMediaCaptured = useCallback(
        (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
            console.log(`Media captured! ${JSON.stringify(media)}`)
            router.push({
                pathname: '/MediaPage' as RelativePathString,
                params: {
                    media: media.path,
                    type: type,
                },
            })
        },
        [isActive],
    )
    const onFlipCameraPressed = useCallback(() => {
        setCameraPosition((p) => (p === 'back' ? 'front' : 'back'))
    }, [])
    const onFlashPressed = useCallback(() => {
        setFlash((f) => (f === 'off' ? 'on' : 'off'))
    }, [])
    //#endregion

    //#region Tap Gesture
    const onFocusTap = useCallback(
        ({ nativeEvent: event }: GestureResponderEvent) => {
            if (!device?.supportsFocus) return
            camera.current?.focus({
                x: event.locationX,
                y: event.locationY,
            })
        },
        [device?.supportsFocus],
    )
    const onDoubleTap = useCallback(() => {
        onFlipCameraPressed()
    }, [onFlipCameraPressed])
    //#endregion

    //#region Effects
    useEffect(() => {
        // Reset zoom to it's default everytime the `device` changes.
        zoom.value = device?.neutralZoom ?? 1
    }, [zoom, device])
    //#endregion

    //#region Pinch to Zoom Gesture
    // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
    // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
    const onPinchGesture = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, { startZoom?: number }>({
        onStart: (_, context) => {
            context.startZoom = zoom.value
        },
        onActive: (event, context) => {
            // we're trying to map the scale gesture to a linear zoom here
            const startZoom = context.startZoom ?? 0
            const scale = interpolate(event.scale, [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM], [-1, 0, 1], Extrapolate.CLAMP)
            zoom.value = interpolate(scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP)
        },
    })
    //#endregion

    useEffect(() => {
        const f =
            format != null
                ? `(${format.photoWidth}x${format.photoHeight} photo / ${format.videoWidth}x${format.videoHeight}@${format.maxFps} video @ ${fps}fps)`
                : undefined
        console.log(`Camera: ${device?.name} | Format: ${f}`)
    }, [device?.name, format, fps])

    useEffect(() => {
        location.requestPermission()
    }, [location])

    // const frameProcessor = useFrameProcessor((frame) => {
    //     'worklet'

    //     runAtTargetFps(10, () => {
    //         'worklet'
    //         console.log(`${frame.timestamp}: ${frame.width}x${frame.height} ${frame.pixelFormat} Frame (${frame.orientation})`)
    //         // examplePlugin(frame)
    //         // exampleKotlinSwiftPlugin(frame)
    //     })
    // }, [])

    const videoHdr = format?.supportsVideoHdr && enableHdr
    const photoHdr = format?.supportsPhotoHdr && enableHdr && !videoHdr

    return (
        <View style={styles.container}>
            {device != null ? (
                <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
                    <Reanimated.View onTouchEnd={onFocusTap} style={StyleSheet.absoluteFill}>
                        <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
                            <ReanimatedCamera
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={isActive}
                                ref={camera}
                                onInitialized={onInitialized}
                                onError={onError}
                                onStarted={() => console.log('Camera started!')}
                                onStopped={() => console.log('Camera stopped!')}
                                onPreviewStarted={() => console.log('Preview started!')}
                                onPreviewStopped={() => console.log('Preview stopped!')}
                                onOutputOrientationChanged={(o) => console.log(`Output orientation changed to ${o}!`)}
                                onPreviewOrientationChanged={(o) => console.log(`Preview orientation changed to ${o}!`)}
                                onUIRotationChanged={(degrees) => console.log(`UI Rotation changed: ${degrees}°`)}
                                format={format}
                                fps={fps}
                                photoHdr={photoHdr}
                                videoHdr={videoHdr}
                                photoQualityBalance="quality"
                                lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                                enableZoomGesture={false}
                                animatedProps={cameraAnimatedProps}
                                exposure={0}
                                enableFpsGraph={true}
                                outputOrientation="device"
                                photo={true}
                                video={true}
                                audio={microphone.hasPermission}
                                enableLocation={location.hasPermission}
                            // frameProcessor={frameProcessor}
                            />
                        </TapGestureHandler>
                    </Reanimated.View>
                </PinchGestureHandler>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.text}>Your phone does not have a Camera.</Text>
                </View>
            )}

            <CaptureButton
                style={styles.captureButton}
                camera={camera}
                onMediaCaptured={onMediaCaptured}
                cameraZoom={zoom}
                minZoom={minZoom}
                maxZoom={maxZoom}
                flash={supportsFlash ? flash : 'off'}
                enabled={isCameraInitialized && isActive}
                setIsPressingButton={setIsPressingButton}
            />

            <StatusBarBlurBackground />

            <View style={styles.rightButtonRow}>
                <Pressable
                    style={[styles.button, { opacity: cameraPosition === 'front' ? 0.4 : 1 }]}
                    onPress={onFlipCameraPressed}
                    android_ripple={{ color: 'white' }}
                // disabledOpacity={0.4}
                >
                    <Icon as={SwitchCameraIcon} color={cameraPosition ? 'white' : "green"} size='md' />
                </Pressable>
                {supportsFlash && (
                    <Pressable
                        style={[styles.button, { opacity: flash === 'off' ? 0.4 : 1 }]}
                        onPress={onFlashPressed}
                        // disabledOpacity={0.4}
                        android_ripple={{ color: 'white' }}
                        disabled={!supportsFlash}
                    >
                        <Icon as={flash === 'off' ? FlashlightOffIcon : FlashlightIcon} color="white" size={'sm'} />
                    </Pressable>
                )}
                {supports60Fps ? (
                    <Pressable style={styles.button}

                        onPress={() => setTargetFps((t) => (t === 30 ? 60 : 30))}>
                        <Text style={styles.text}>{`${targetFps}\nFPS`}</Text>
                    </Pressable>
                ) : null}
                {supportsHdr && (
                    <Pressable style={styles.button} onPress={() => setEnableHdr((h) => !h)}>
                        <Text style={[styles.text, { color: enableHdr ? 'white' : 'green' }]}>{enableHdr ? 'HDR\nON' : 'HDR\nOFF'}</Text>
                    </Pressable>
                )}
                {canToggleNightMode ? (
                    <Pressable style={styles.button}
                        onPress={() => setEnableNightMode(!enableNightMode)}
                    // disabledOpacity={0.4}
                    >
                        <Icon as={enableNightMode ? MoonIcon : SunMoonIcon} color="white" size={'sm'} />
                    </Pressable>
                ) : null}
                {/* <Pressable style={styles.button} onPress={() => router.push('Devices')}>
                    <Icon as={LucideSettings2} color="white" size={"md"} />
                </Pressable> */}
                <Pressable
                    style={styles.button}
                    onPress={() => router.push('/ScanQrCode')}>
                    <Icon as={ScanQrCode} color="white" size={'md'} />
                </Pressable>
            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    captureButton: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: SAFE_PADDING_VAL.paddingBottom,
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
    text: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})