import React from 'react'
import { BlurView, BlurViewProps } from 'expo-blur'
import { Platform, StyleSheet } from 'react-native'
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets'


const StatusBarBlurBackgroundImpl = ({ style, ...props }: BlurViewProps): React.ReactElement | null => {
    if (Platform.OS !== 'ios') return null

    return (
        <BlurView
            style={[styles.statusBarBackground, style]}
            tint="light"
            intensity={25}
            blurReductionFactor={0.5}

            // blurAmount={25}
            // blurType="light"
            // reducedTransparencyFallbackColor={FALLBACK_COLOR}
            {...props}
        />
    )
}

export const StatusBarBlurBackground = React.memo(StatusBarBlurBackgroundImpl)

const styles = StyleSheet.create({
    statusBarBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: StaticSafeAreaInsets.safeAreaInsetsTop,
    },
})