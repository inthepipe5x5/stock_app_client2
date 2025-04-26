import { Dimensions, Platform } from 'react-native';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets'

export const CONTENT_GAP = 15

export const SAFE_BOTTOM_OFFSET_VAL =
    Platform.select({
        ios: StaticSafeAreaInsets.safeAreaInsetsBottom,
    }) ?? 0
export const SAFE_PADDING_VAL = {
    paddingLeft: StaticSafeAreaInsets.safeAreaInsetsLeft + CONTENT_GAP,
    paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop + CONTENT_GAP,
    paddingRight: StaticSafeAreaInsets.safeAreaInsetsRight + CONTENT_GAP,
    paddingBottom: SAFE_BOTTOM_OFFSET_VAL + CONTENT_GAP,
}

export const MAX_CAMERA_ZOOM = 10
export const CURRENT_SCREEN_WIDTH = Dimensions.get('window').width
export const CURRENT_SCREEN_HEIGHT = Platform.select<number>({
    android: Dimensions.get('screen').height - StaticSafeAreaInsets.safeAreaInsetsBottom,
    ios: Dimensions.get('window').height,
}) as number

export const MAX_BUTTON_SIZE = 78;
export const MIN_BUTTON_SIZE = 40;

const viewPort = {
    width: 1024,
    height: 768,
    header: { // height of top bar
        height: 250
    },
    footer: { // height of bottom tab bar
        height: 100
    },
    sidebar: { // width of sidebar
        width: 200
    },
    content: { // content area dimensions
        padding: 20,
        margin: 15
    },
    button: { // common button dimensions
        width: 150,
        height: 50
    },
    input: { // common input field dimensions
        width: 300,
        height: 40
    }
    , devices: {
        mobile: {
            width: 375,
            height: 667
        },
        tablet: {
            width: 768,
            height: 1024
        },
        desktop: {
            width: 1440,
            height: 900
        }
    },
    breakpoints: {
        Y: {
            mobile: 375,
            tablet: 768,
            desktop: 1024
        },
        X: {
            mobile: 667,
            tablet: 1024,
            desktop: 1440
        },
        'sm': 640,
        'md': 768,
        'lg': 1024,
        'xl': 1280,
        '2xl': 1536,
    }
}



export { viewPort };