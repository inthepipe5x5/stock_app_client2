
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { viewPort } from '@/constants/dimensions';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

interface ProgressBarProps {
    duration?: number;
    color?: string;
    trackColor?: string;
    progressBarWidth?: number;
    dependencies: Promise<boolean>[];
}
/**
 * A customizable progress bar component for React Native that supports both
 * time-based progress and dependency-based progress tracking.
 *
 * @component
 * @param {number} [duration=15000] - The duration (in milliseconds) for the progress bar to complete when no dependencies are provided.
 * @param {string} [color='#4CAF50'] - The color of the progress bar's filled track.
 * @param {string} [trackColor='#E0E0E0'] - The background color of the progress bar's track.
 * @param {number} [progressBarWidth=viewPort.width] - The width of the progress bar.
 * @param {Promise<boolean>[]} dependencies - An array of promises. The progress bar updates as each promise resolves.
 *
 * @example
 * // Example usage with time-based progress
 * import ProgressBar from './components/ProgressBar';
 *
 * const App = () => {
 *     return (
 *         <ProgressBar duration={10000} color="#FF5733" trackColor="#CCCCCC" />
 *     );
 * };
 *
 * @example
 * // Example usage with dependency-based progress
 * import ProgressBar from './components/ProgressBar';
 *
 * const App = () => {
 *     const dependencies = [
 *         new Promise((resolve) => setTimeout(() => resolve(true), 2000)),
 *         new Promise((resolve) => setTimeout(() => resolve(true), 4000)),
 *         new Promise((resolve) => setTimeout(() => resolve(true), 6000)),
 *     ];
 *
 *     return (
 *         <ProgressBar dependencies={dependencies} color="#2196F3" />
 *     );
 * };
 */
const ProgressBar = ({
    duration = 15000,
    progressBarWidth = viewPort.width,
    color = '#4CAF50',
    trackColor = '#E0E0E0',
    dependencies
}: ProgressBarProps) => {
    // Set the initial progress value to 0
    const [progressValue, setProgressValue] = useState(0);
    
    //if no duration or dependencies are provided, return null
    // This is to prevent the progress bar from rendering when no progress is needed
    if (!!!dependencies && !!!duration) return null;

    useEffect(() => {
        // If no dependencies are provided, use a timer to simulate progress
        if (!dependencies || dependencies.length === 0) {
            const interval = 100; // Update progress every 100ms
            const step = interval / duration;

            const timer = setInterval(() => {
                setProgressValue((prev) => {
                    const nextValue = prev + step;
                    if (nextValue >= 1) {
                        clearInterval(timer);
                        return 1;
                    }
                    return nextValue;
                });
            }, interval);

            return () => clearInterval(timer);
        }
        // If dependencies are provided, use the dependency length to control the progress bar
        const totalDependencies = dependencies.length;
        let resolvedCount = 0;

        const updateProgress = () => {
            resolvedCount += 1;
            setProgressValue(resolvedCount / totalDependencies);
        };

        dependencies.forEach((promise) => {
            promise.then((result) => {
                if (result) {
                    updateProgress();
                }
            });
        });
    }, [duration]);

    return (
        <View style={[styles.container, { backgroundColor: trackColor }]}>
            <Progress
                value={progressValue * 100}
                className={cn('h-[100%] border-r-8 rounded-md',
                    `m-width-[${progressBarWidth * 0.95}px]`,
                )}
            >
                <ProgressFilledTrack
                    style={{
                        backgroundColor: color,
                        borderRadius: 10,
                    }}
                />
            </Progress>
        </View>
    );
};

export default ProgressBar;

const styles = StyleSheet.create({
    container: {
        height: 20,
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        padding: 4,
    },
});
