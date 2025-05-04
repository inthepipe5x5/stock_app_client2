
import { Appearance, Platform, useColorScheme } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    View,
    StyleSheet
} from "react-native";
import { usePathname, Redirect, RelativePathString, router } from "expo-router";
import Colors from "@/constants/Colors";
// import { cn } from "@gluestack-ui/nativewind-utils/cn";
// import Colors from "@/constants/Colors";
// // import { getOFFSessionToken, hash } from "@/lib/OFF/OFFcredentials";
// import BottomSheetStepper, { BottomSheetStepperRef, StepComponentProps } from "bottom-sheet-stepper"

// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function index(): React.JSX.Element {
    const pathname = usePathname();
    // const [showDrawer, setShowDrawer] = React.useState(false);
    // const [testData, setTestData] = React.useState<any[] | null>(null);
    // const [fetchedOFFData, setFetchedOFFData] = React.useState<any[] | null | any>(null);
    // //effect to test supabase queries

    useEffect(() => {
        console.log({ pathname }, 'mounted')
        console.log("index screen mounted");
        //     const getCreds = async (id: string | undefined = process.env.EXPO_PUBLIC_TEST_USER_ID) => {
        //         if (!!!id) throw new TypeError("id is required");
        //         if (typeof id !== "string") throw new TypeError("id must be a string");
        //         return {
        //             app_name: appInfo.name,
        //             app_version: appInfo.version,
        //             app_uuid: await hash(id)
        //         }
    }, [])
    return (
        <SafeAreaView
            className="my-safe-or-3.5 pb-safe-offset-2 border-2 h-full w-screen"
            style={{
                flex: 1,
                backgroundColor: Colors[useColorScheme() ?? 'light']?.background ?? 'bg-background-900',
                paddingTop: Platform.OS === "android" ? 0 : 0,
                paddingBottom: Platform.OS === "android" ? 0 : 0,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text>Index</Text>
            <Button
                action="positive"
                onPress={() => {
                    router.push('session/rehydrate' as RelativePathString);
                }}
            >
                <ButtonText>Go to Rehydrate Screen</ButtonText>
            </Button>
        </SafeAreaView>
    )
    // return <Redirect href={{ pathname: '(auth)' as RelativePathString }} />
    // return <Redirect href={{ pathname: '/session/rehydrate' as RelativePathString }} />
    // const stepperRef = React.useRef<BottomSheetStepperRef>(null);

    // const Step1 = ({ onNextPress }: StepComponentProps) => (
    //     <View>
    //         <Text>Step 1</Text>
    //         <Button
    //             variant="solid"
    //             onPress={onNextPress}>
    //             <ButtonText>Back</ButtonText>
    //         </Button>
    //     </View>
    // );

    // const Step2 = ({ onBackPress, onEnd }: StepComponentProps) => (
    //     <View>
    //         <Text>Step 2</Text>
    //         <Button
    //             variant="outline"
    //             action="secondary"
    //             onPress={onBackPress}>
    //             <ButtonText>Back</ButtonText>
    //         </Button>
    //         <Button
    //             variant="solid"
    //             action="positive"
    //             onPress={onEnd}>
    //             <ButtonText>Submit</ButtonText>
    //         </Button>
    //     </View>
    // );

    // return (
    //     <SafeAreaView
    //         className={cn("my-safe-or-3.5 pb-safe-offset-2 border-2 h-full w-screen",
    //             Appearance.getColorScheme() === "dark" ? "bg-background-100" : "bg-background-50")}
    //         style={{
    //             flex: 1,
    //             backgroundColor: Colors[useColorScheme() ?? 'light']?.background ?? 'bg-background-900',
    //             paddingTop: Platform.OS === "android" ? 0 : 0,
    //             paddingBottom: Platform.OS === "android" ? 0 : 0,
    //             justifyContent: 'center',
    //             alignItems: 'center',
    //         }}
    //     >

    //         <GestureHandlerRootView>
    //             <BottomSheetModalProvider
    //             >
    //                 <BottomSheetStepper
    //                     ref={stepperRef}
    //                     steps={[
    //                         Step1,
    //                         Step2
    //                     ]}
    //                 />
    //             </BottomSheetModalProvider>
    //         </GestureHandlerRootView>
    //     </SafeAreaView >
    // )

}

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
