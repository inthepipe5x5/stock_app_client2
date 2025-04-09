import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { viewPort } from '@/constants/dimensions';

interface ProgressBarProps {
    duration?: number;
    color?: string;
    trackColor?: string;
    progressBarWidth?: number;
}

const ProgressBar = ({
    duration = 15000,
    progressBarWidth = viewPort.width,
    color = '#4CAF50',
    trackColor = '#E0E0E0' }:
    ProgressBarProps) => {
    const progress = useRef(new Animated.Value(0)).current;
    const finalOutputWidth = (progressBarWidth ?? Dimensions.get('window').width) * 0.95; // 95% of the screen width
    useEffect(() => {
        Animated.timing(progress,
            {
                toValue: 1,
                duration: duration,
                useNativeDriver: true,
            }).start();
    }, []);

    const widthInterpolation = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.05, 1], // Use numeric values for percentages
    });

    return (
        <View style={[styles.container, {
            backgroundColor: trackColor
        }]}>
            <Animated.View style={
                [styles.progressBar,
                {
                    width: widthInterpolation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, finalOutputWidth], // Convert to pixel values
                    }),
                    backgroundColor: color,
                    paddingHorizontal: 5,
                }]} />
        </View>
    );
};

export default ProgressBar;

const styles = StyleSheet.create({
    backgroundImage: {
        height: '100%',
        // width: '100%'
    },
    centered: {
        flex: 1,
        paddingTop: 80,
        paddingHorizontal: 32,
    },
    container: {
        height: 20,
        borderRadius: 10,
        overflow: 'hidden',
        // width: '100%',
        justifyContent: 'center',
        padding: 4

    },
    progressBar: {
        height: '100%',
        borderRadius: 10,
    }
});
