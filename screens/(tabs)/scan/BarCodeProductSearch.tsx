import React, { useRef } from 'react'
import { Alert, AppState, Appearance } from 'react-native'
import { Pressable } from '@/components/ui/pressable'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet, { BottomSheetSectionList, BottomSheetView } from '@gorhom/bottom-sheet'
import { TestCodeScannerPage } from '@/screens/scan/BarCodeScannerRoute'
import useSnapPoints from '@/hooks/useSnapPoints'
import Colors from '@/constants/Colors'
import { defaultCodeTypes } from '@/lib/camera/utils'
import { Icon } from '@/components/ui/icon'
import { CONTENT_GAP } from '@/constants/dimensions'
import { Text } from '@/components/ui/text'
import { LucideXCircle } from 'lucide-react-native'
import { useUserSession } from '@/components/contexts/UserSessionProvider'

export default function BarCodeProductSearchView() {
    const colors = Colors[Appearance.getColorScheme() ?? 'light']
    const { storage, state } = useUserSession()
    //bottom sheet ref
    const bottomSheetRef = useRef<BottomSheet>(null)
    //snap points
    const { snapPoints, handleSnapPointChange, initialIndex } = useSnapPoints({
        ref: bottomSheetRef,
        customSnapPoints: [0, 50, 90],
        initialIndex: 0,
    })

    const renderListItem = ({ item }: any) => (
        <Pressable
            style={{
                padding: CONTENT_GAP,
                backgroundColor: colors.background,
                borderBottomWidth: 1,
                borderBottomColor: colors.accent,
            }}
            onPress={() => {
                console.log(`Pressed item ${item}`)
            }}
        >
            <BottomSheetView style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* <Icon name="check" color={colors.primary} size={20} /> */}
                <Text style={{ color: colors.text }}>{`Item ${item}`}</Text>
            </BottomSheetView>
        </Pressable>
    )


    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
            <TestCodeScannerPage
                customOnCodeScannedHandler={(codes, frame) => {
                    console.log('Scanned codes:', codes)
                    Alert.alert('Scanned Codes', JSON.stringify(codes), [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ])
                }}
                customCodeTypes={defaultCodeTypes}
            />
            <BottomSheet
                ref={bottomSheetRef}
                index={initialIndex}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                onChange={handleSnapPointChange}
                backgroundStyle={{ backgroundColor: colors.background }}
                handleIndicatorStyle={{ backgroundColor: colors.accent }}
                handleStyle={{ backgroundColor: colors.background }}
                keyboardBehavior="fillParent">
                <BottomSheetView style={{ flex: 1, padding: CONTENT_GAP }}>
                    <Pressable
                        onPress={() => {
                            bottomSheetRef.current?.close()
                        }}
                        style={{
                            position: 'absolute',
                            top: CONTENT_GAP,
                            right: CONTENT_GAP,
                            zIndex: 1,
                        }}
                    >
                        <Icon as={LucideXCircle} color={colors.text} size={'md'} />
                        <Text style={{ color: colors.text, fontSize: 12 }}>Close</Text>
                    </Pressable>

                </BottomSheetView>
            </ BottomSheet>
        </GestureHandlerRootView >

    )
}