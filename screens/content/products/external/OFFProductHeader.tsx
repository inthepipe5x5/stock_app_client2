import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme, Dimensions } from 'react-native';
// import NutriAndEcoScore from './NutriAndEcoScore';
import Colors from '@/constants/Colors';

interface ProductHeaderProps {
    imageUrl: string;
    productName: string;
    brandName: string;
    genericName?: string;
    nutriScore: string;
    ecoScore: string;
}

export default function ProductHeader({
    imageUrl,
    productName,
    brandName,
    genericName,
    nutriScore,
    ecoScore
}: ProductHeaderProps) {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];


    const styles = StyleSheet.create({
        container: {
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 16
        },
        image: {
            width: Dimensions.get('screen').width,
            height: Dimensions.get('screen').width,
        },
        textContainer: {
            alignItems: 'center',
            marginBottom: 16
        },
        brand: {
            fontSize: 16,
            textAlign: 'center',
        },
        productName: {
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 8,
            textAlign: 'center',
        },
        genericName: {
            fontSize: 12,
            fontStyle: 'italic',
            marginTop: 8,
            textAlign: 'center',
        },
        imageContainer: {
            width: Dimensions.get('screen').width - 32,
            height: Dimensions.get('screen').width - 32,
            position: 'relative',
            marginBottom: 16,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            borderRadius: 20,
            marginTop: 16,
        },
        blurredImage: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: Dimensions.get('screen').width - 32,
            height: Dimensions.get('screen').width - 32,
        },
        shader: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: Dimensions.get('screen').width - 32,
            height: Dimensions.get('screen').width - 32,
            backgroundColor: colors.background,
            opacity: 0.5,
        },
        foregroundImage: {
            width: Dimensions.get('screen').width - 132,
            height: Dimensions.get('screen').width - 132,
            borderRadius: 20,
            overflow: 'hidden',
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUrl }} style={[styles.image, styles.blurredImage]} resizeMode="cover" blurRadius={20} />
                <View style={[styles.image, styles.shader]} />
                <Image source={{ uri: imageUrl }} style={[styles.image, styles.foregroundImage]} resizeMode="contain" />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.brand, { color: colors.text }]}>{brandName}</Text>
                <Text style={[styles.productName, { color: colors.text }]}>{productName}</Text>
                {genericName ? (
                    <Text style={[styles.genericName, { color: colors.text }]}>{genericName}</Text>
                ) : null}
            </View>
            {/* <NutriAndEcoScore nutriScore={nutriScore} ecoScore={ecoScore} /> */}
        </View>
    );
}
