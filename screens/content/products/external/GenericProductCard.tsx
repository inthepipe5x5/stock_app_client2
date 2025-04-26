import { ChevronDownCircle, ArrowRight, AlertTriangle } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Text, StyleSheet, useColorScheme, TouchableOpacity, View, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, interpolate, withSpring, FadeIn, SlideInDown, FadeOut } from "react-native-reanimated";
import Colors from "@/constants/Colors";
import { useFonts } from "expo-font";
import { Divider } from "@/components/ui/divider";
import { Button, ButtonText } from "@/components/ui/button";
import { RelativePathString, router } from "expo-router";

const getScoreColor = (score: string | number) => {
    switch (score) {
        case 1:
        case ('A'):
        case ('a'):
            return 'bg-success-900';
        case 2:
        case ('B'):
        case ('b'):
            return 'bg-success-400';
        case 3:
        case ('C'):
        case ('c'):
            return 'bg-warning-400';
        case 4:
        case ('D'):
        case ('d'):
            return 'bg-warning-900';
        case 5:
        case ('E'):
        case ('e'):
            return 'bg-error-900';
        default:
            return ratingColors.default;

    }
};

const ratingColors = useMemo(() => {
    const theme = useColorScheme() ?? "light";
    return {
        a: Colors[theme].input.success,
        b: Colors[theme].input.primary,
        c: Colors[theme].input.neutral,
        d: Colors[theme].input.tertiary,
        e: Colors[theme].input.false,
        default: theme === 'dark' ? Colors.dark.accent : Colors.light.accent,
    }
}, []);

export const NutriScoreBadge: React.FC<{ label: string; score: string | number }> = ({
    label,
    score,
}) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    const styles = StyleSheet.create({
        scoreBadge: {
            padding: 4,
            borderRadius: 6,
            alignItems: 'center',
            minWidth: 40,
        },
        scoreBadgeLabel: {
            fontSize: 10,
            color: '#fff',
            opacity: 0.8,
            // fontFamily: fonts.SpaceMono,
        },
        scoreBadgeValue: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
            // fontFamily: fonts.SpaceMono,
        },
    });




    return (
        <View
            style={[
                styles.scoreBadge,
                // { backgroundColor: getScoreColor(score) },
            ]}
            className={getScoreColor(score)}
        >
            <Text style={styles.scoreBadgeLabel}>{label}</Text>
            <Text style={styles.scoreBadgeValue}>
                {typeof score === 'string' ? score.toUpperCase() : score}
            </Text>
        </View>
    );
};


export interface OFFProductBasic {
    productId: string;
    imageUrl: string;
    barcode: string;
    productName: string;
    brand: string;
    summary: string;
    nutriScore: string;
    novaGroup: number;
    ecoScore?: string;
    healthConcerns: string;
}

export const ProductCard: React.FC<{ product: OFFProductBasic }> = ({ product }) => {
    const [expanded, setExpanded] = useState(false);
    const rotation = useSharedValue(0);
    const colors = Colors[useColorScheme() ?? 'light'];

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` }],
    }));

    const toggleExpand = () => {
        rotation.value = withSpring(expanded ? 0 : 1);
        setExpanded(!expanded);
    };

    const styles = StyleSheet.create({
        productCard: {
            backgroundColor: colors.background,
            borderRadius: 12,
            elevation: 3,
            overflow: 'hidden',
        },
        productHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
        },
        productName: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            maxWidth: Dimensions.get('window').width - 105,
        },
        brandName: {
            fontSize: 12,
            color: colors.text,
            marginTop: 4,
            opacity: 0.8,
        },
        productDetails: {
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.text + '11',
            overflow: 'hidden',
        },
        scoreContainer: {
            flexDirection: 'row',
            gap: 8,
        },
        summary: {
            fontSize: 14,
            color: colors.text,
            opacity: 0.8,
            lineHeight: 20
        },
        concernsContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            borderWidth: 1,
            borderColor: ratingColors.d + '11',
            backgroundColor: ratingColors.d + '11',
            padding: 12,
            paddingRight: 20,
            borderRadius: 16,
        },
        concernsText: {
            flex: 1,
            fontSize: 14,
            color: ratingColors.d,
            lineHeight: 20,
        },
        recommendationsTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            opacity: 0.9,
            marginBottom: 12,
        },
        recommendationItem: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 8,
        },
        recommendationText: {
            fontSize: 14,
            color: colors.text,
            opacity: 0.8,
            lineHeight: 20,
            paddingRight: 30,
        },
    });

    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.productCard}
        >
            <TouchableOpacity onPress={toggleExpand} style={styles.productHeader}>
                <View>
                    <Text style={styles.productName} numberOfLines={1} >{product.productName}</Text>
                    <Text style={styles.brandName}>{product.brand}</Text>
                </View>
                <Animated.View style={animatedStyle}>
                    <ChevronDownCircle size={18} color={colors.text} />
                </Animated.View>
            </TouchableOpacity>

            {expanded ? (
                <Animated.View
                    entering={SlideInDown.duration(300)}
                    exiting={FadeOut.duration(200)}
                    style={styles.productDetails}
                >
                    <View style={styles.scoreContainer}>
                        {product?.nutriScore ? (<NutriScoreBadge label="Nutri" score={product.nutriScore} />) : null}
                        {product?.novaGroup ? (<NutriScoreBadge label="Nova" score={product.novaGroup} />) : null}
                        {product.ecoScore ? (
                            <NutriScoreBadge label="Eco" score={product.ecoScore} />
                        ) : null}
                    </View>
                    <View style={{ height: 16 }}>
                        <Divider style={{ marginVertical: 5, width: '100%', height: '100%' }} />
                    </View>
                    <Text style={styles.summary}>{product.summary}</Text>

                    <View style={{ height: 16 }}>
                        <Divider style={{ marginVertical: 5, width: '100%', height: '100%' }} />
                    </View>
                    <View style={styles.concernsContainer}>
                        <AlertTriangle size={24} color={colors.secondary.main} />
                        <Text style={styles.concernsText}>{product.healthConcerns}</Text>
                    </View>
                    <View style={{ height: 16 }}>
                        <Divider style={{ marginVertical: 5, width: '100%', height: '100%' }} />
                    </View>
                    <Button
                        action="positive"
                        variant='outline'
                        style={{ marginTop: 8, width: '100%', flex: 1 }}
                        onPress={() => {
                            router.push({
                                pathname: '/(tabs)/(search)/products' as RelativePathString,
                                params: { productName: product.productName }
                            })
                        }}
                    >
                        <ButtonText>
                            See More
                        </ButtonText>
                    </Button>
                </Animated.View>
            ) : null}
        </Animated.View>
    );
};
