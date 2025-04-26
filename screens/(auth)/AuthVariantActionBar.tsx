import React from 'react';
import { Pressable } from "@/components/ui/pressable"
import { ScrollView } from 'react-native-gesture-handler';
import { Appearance } from 'react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/components/contexts/authContext';
import type { variant } from '@/components/contexts/authContext';

const AuthVariantActionBar = () => {
    const { authVariant, authVariantValues, setAuthVariant, authVariantTitles } = useAuth()

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false} contentContainerStyle={{
                flexDirection: 'row',
                paddingVertical: 5,
                paddingHorizontal: 5,
                backgroundColor: Colors[Appearance.getColorScheme() ?? "light"].primary.main
            }}
            
            >
            {
                authVariantValues.map((currentVariant: variant, idx: number) => {
                    return (
                        <Pressable
                            style={[{
                                flex: 1,
                                gap: 1,
                                paddingHorizontal: 5,
                                margin: 5,
                                borderRadius: 30
                            },
                            authVariantValues[authVariant] === currentVariant ?
                                {
                                    backgroundColor: Colors[Appearance.getColorScheme() ?? "light"].accent
                                } : {
                                    backgroundColor: Colors[Appearance.getColorScheme() ?? "light"].primary.main
                                }]
                            }
                            android_ripple={{ color: "#000010" }}
                            onPress={() => {
                                setAuthVariant(idx)
                                console.log({ currentVariant }, 'set')
                            }}
                        >
                            {authVariantTitles[idx]}
                        </Pressable>
                    )
                })
            }
        </ScrollView >)
}

export default AuthVariantActionBar