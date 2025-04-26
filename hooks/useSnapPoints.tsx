import { useEffect, useMemo, useCallback } from "react";

/** Hook to manage snap points in a @Gorhom/BottomSheet component.
 *   @param {Object} ref - The ref to the BottomSheet component.
 *   @param {number[]} snapPoints - An array of custom snap points.
 * * @param initialSnapPoint @type {number} - The initial snap point index. Default is 0.
 * * @param onChange @type {function} - A callback function that is called when the snap point changes.
 * @returns 
 */
export default function useSnapPoints({
    ref,
    customSnapPoints = [],
    initialIndex = 0,
    onChange,
    replaceWithCustomSnapPoints = false
}: {
    ref: React.RefObject<any>;
    customSnapPoints?: number[],
    initialIndex?: number;
    onChange?: (index: number) => void;
    replaceWithCustomSnapPoints?: boolean;
}) {
    const defaultSnapPoints = useMemo(() => {
        return ['25%', '50%', '90%'];
    }, []);

    /* This code snippet is using the `useMemo` hook in React to memoize the calculation of the `snapPoint`
    value. */
    const snapPoints = useMemo(() => {
        if (!!!customSnapPoints) return defaultSnapPoints;
        const points = (replaceWithCustomSnapPoints
            ? [...(defaultSnapPoints.map((point: string) => Number(point.replace('%', '')))), ...customSnapPoints]
            : [...customSnapPoints])
            .sort((a, b) => a - b)
            .map((point: number) => `${point}%`);

        //remove duplicates and check if there are any points
        //if there are no points, return the default snap points
        return Array.from(new Set(points)).length > 0 ? points : defaultSnapPoints;
    }, [customSnapPoints]);

    const handleSnapPointChange = useCallback(
        (index: number) => {
            //do not call if ref is not set or index is out of bounds
            if (!!!ref.current || index < 0 || index >= snapPoints.length) {
                return;
            }
            //set the snap point to the index
            ref.current?.snapToIndex(index);
            console.log(`snapPoint changed to ${index} - ${snapPoints[index]}`);
            //call the onChange callback if it is set
            if (onChange) {
                onChange(index);
            }
        },
        [onChange]
    );


    return {
        snapPoints,
        defaultSnapPoints,
        handleSnapPointChange,
        initialIndex
    };
}