import * as jest from 'jest';
import { CalculateWithinOverlay, SquareOverlayArea } from "@/components/ui/camera/SquareOverlay";
import { useWindowDimensions } from "react-native";
import { Platform } from "react-native";

const overlaySize = 200;
// Mock react-native before importing the component under test
jest.mock("react-native", () => {
    const ActualReactNative = jest.requireActual("react-native");
    return {
        ...ActualReactNative,
        useWindowDimensions: jest.fn(),
        Platform: { OS: "ios" },
    };
});

describe('SquareOverlayArea', () => {
    jest.mock.("react-native", () => ({
        ...jest.requireActual("react-native"),
        useWindowDimensions: JestMock.fn(),
        Platform: { OS: "ios" },
    }));

    describe("SquareOverlayArea", () => {
        const mockUseWindowDimensions = useWindowDimensions as jest.Mock;

        afterEach(() => {
            JestMock.clearAllMocks();
        });

        it("calculates overlay area correctly for iOS", () => {
            mockUseWindowDimensions.mockReturnValue({ width: 400, height: 800 });
            Platform.OS = "ios";

            const result = SquareOverlayArea(200);

            expect(result).toEqual({
                x: 100, // (400 - 200) / 2
                y: 300, // (800 - 200) / 2
                width: 200,
                height: 200,
            });
        });

        it("calculates overlay area correctly for Android", () => {
            mockUseWindowDimensions.mockReturnValue({ width: 400, height: 800 });
            Platform.OS = "android";

            const result = SquareOverlayArea(200);

            expect(result).toEqual({
                x: 0,
                y: 300, // (800 - 200) / 2
                width: 400,
                height: 200,
            });
        });

        it("handles custom square size", () => {
            mockUseWindowDimensions.mockReturnValue({ width: 500, height: 1000 });
            Platform.OS = "ios";

            const result = SquareOverlayArea(300);

            expect(result).toEqual({
                x: 100, // (500 - 300) / 2
                y: 350, // (1000 - 300) / 2
                width: 300,
                height: 300,
            });
        });

        it("handles edge case with square size larger than screen dimensions", () => {
            mockUseWindowDimensions.mockReturnValue({ width: 200, height: 300 });
            Platform.OS = "ios";

            const result = SquareOverlayArea(400);

            expect(result).toEqual({
                x: -100, // (200 - 400) / 2
                y: -50, // (300 - 400) / 2
                width: 400,
                height: 400,
            });
        });

        it("uses default square size when none is provided", () => {
            mockUseWindowDimensions.mockReturnValue({ width: 600, height: 1200 });
            Platform.OS = "ios";

            const result = SquareOverlayArea();

            expect(result).toEqual({
                x: 200, // (600 - 200) / 2
                y: 500, // (1200 - 200) / 2
                width: 200,
                height: 200,
            });
        });
    });

})

describe('CalculateWithinOverlay', () => {
    const mockArea = SquareOverlayArea(overlaySize);

    // Valid code within overlay
    it('returns true for codes fully inside overlay', () => {
        const code = { frame: { x: 100, y: 100, width: 50, height: 50 } };
        expect(CalculateWithinOverlay({ code, overlaySize })).toBe(true);
    });

    // Code partially outside overlay (right edge)
    it('returns false for codes exceeding overlay width', () => {
        const code = { frame: { x: 200, y: 100, width: 100, height: 50 } };
        expect(CalculateWithinOverlay({ code, overlaySize })).toBe(false);
    });

    // Code at top-left edge of overlay
    it('handles codes at overlay boundary', () => {
        const code = { frame: { x: 50, y: 50, width: 50, height: 50 } };
        expect(CalculateWithinOverlay({ code, overlaySize })).toBe(true);
    });

    // Invalid code object
    it('returns false for invalid code objects', () => {
        expect(CalculateWithinOverlay({ code: null })).toBe(false);
        expect(CalculateWithinOverlay({ code: {} })).toBe(false);
    });

    // Test different boundary keys (e.g., Vision Camera vs. Expo)
    it('works with "bounds" and "cornerPoints"', () => {
        const visionCameraCode = { bounds: { x: 100, y: 100, width: 50, height: 50 } };
        const expoCameraCode = { cornerPoints: { x: 100, y: 100, width: 50, height: 50 } };
        expect(CalculateWithinOverlay({ code: visionCameraCode })).toBe(true);
        expect(CalculateWithinOverlay({ code: expoCameraCode })).toBe(true);
    });
});
