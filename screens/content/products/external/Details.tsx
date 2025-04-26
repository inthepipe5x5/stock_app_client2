import { StyleSheet, useColorScheme, View, ScrollView, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { ExtraInformation, ProductInfo } from './Product';
import { Carrot, Orange, Flask, ShieldWarning, Package, Factory, Tag } from 'phosphor-react-native';
import BackgroundImage from '@/components/ui/BackgroundImage';
import { capitalizeAll, removeDashes } from '@/lib/text';
import { Fonts } from '@/constants/Fonts';
import OFFProductHeader from './OFFProductHeader';
// import AdditiveItem from './AdditiveItem';
// import NutrientItem from './NutrientItem';

interface ProductDetailsScreen {
    productInfo: ProductInfo;
    extraInfo: ExtraInformation;
}

interface NutrientEval {
    [key: string]: {
        evaluation?: string;
        information?: string;
    };
}

const ProductDetailScreen: React.FC<ProductDetailsScreen> = ({ productInfo, extraInfo }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const nutrients = extraInfo.health.nutrients
    const nutrientsEval: NutrientEval = {};
    const nutrientList: any = [];

    for (const nutrient in nutrients) {
        const item = nutrients[nutrient]

        nutrientsEval[item.id] = {
            evaluation: item.evaluation,
            information: item.information,
        }
        nutrientList.push({
            name: item.id,
            value: (productInfo.nutriments[item.id as keyof typeof productInfo.nutriments] || 0) + " g",
            evaluation: item.evaluation,
            information: item.information,
        })
    }

    // Add energyKj and energyKcal if they exist
    if (productInfo.nutriments.energyKj) {
        nutrientList.push({
            name: "energy (kJ)",
            value: (productInfo.nutriments.energyKj || 0) + " kJ",
        })
    }

    if (productInfo.nutriments.energyKcal) {
        nutrientList.push({
            name: "energy (kcal)",
            value: (productInfo.nutriments.energyKcal || 0) + " kcal",
        })
    }

    // Add carbohydrates if they exist
    if (productInfo.nutriments.carbohydrates) {
        nutrientList.push({
            name: "carbohydrates",
            value: (productInfo.nutriments.carbohydrates || 0) + " g",
        })
    }

    // Add proteins if they exist
    if (productInfo.nutriments.proteins) {
        nutrientList.push({
            name: "proteins",
            value: (productInfo.nutriments.proteins || 0) + " g",
        })
    }

    // Add fiber if they exist
    if (productInfo.nutriments.fiber) {
        nutrientList.push({
            name: "fiber",
            value: (productInfo.nutriments.fiber || 0) + " g",
        })
    }

    // Add sodium if they exist
    if (productInfo.nutriments.sodium) {
        nutrientList.push({
            name: "sodium",
            value: (productInfo.nutriments.sodium || 0) + " g",
        })
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: 16,
        },
        section: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderRadius: 20,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? 'light'].text,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
            marginBottom: 16,
        },
        sectionTitleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
            fontFamily: Fonts.sansSerif,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginLeft: 8,
            color: Colors[colorScheme ?? 'light'].text,
            textTransform: 'capitalize',
            fontFamily: Fonts.sansSerif,
        },
        ingredientItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme ?? 'light'].text + '10',
            paddingVertical: 8,
        },
        veganTag: {
            borderRadius: 10,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginLeft: 8,
            fontFamily: Fonts.sansSerif,
            fontSize: 12,
            color: colors.vegan,
            backgroundColor: colors.vegan + '1F',
        },
        vegetarianTag: {
            borderRadius: 10,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginLeft: 8,
            fontFamily: Fonts.sansSerif,
            fontSize: 12,
            color: colors.vegetarian,
            backgroundColor: colors.vegetarian + '2F',
        },
        listItem: {
            marginBottom: 4,
            color: Colors[colorScheme ?? 'light'].text,
            textTransform: 'capitalize',
            fontFamily: Fonts.sansSerif,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme ?? 'light'].text + '10',
            paddingVertical: 8,
        },
        genericName: {
            fontSize: 16,
            fontStyle: 'italic',
            marginBottom: 16,
            color: Colors[colorScheme ?? 'light'].text,
            textTransform: 'capitalize',
            fontFamily: Fonts.sansSerif,
        },
        text: {
            fontFamily: Fonts.sansSerif,
            color: Colors[colorScheme ?? 'light'].text,
        },
        noBorderNoPadding: {
            borderBottomWidth: 0,
            paddingBottom: 0,
        },
        information: {
            fontSize: 12,
            color: colors.text,
            opacity: 0.75,
            marginTop: 4,
            lineHeight: 16,
        },

    });

    return (
        <BackgroundImage>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View entering={FadeInUp.duration(500)}>
                        <OFFProductHeader
                            imageUrl={productInfo.image}
                            productName={productInfo.productName}
                            brandName={productInfo.brand}
                            nutriScore={productInfo.nutriscore}
                            ecoScore={productInfo.ecoscore}
                            genericName={productInfo.genericName}
                        />
                    </Animated.View>
                    <Animated.View style={styles.section} entering={FadeInUp.duration(500).delay(100)}>
                        <View style={styles.sectionTitleContainer}>
                            <Carrot size={24} color={Colors[colorScheme ?? 'light'].text} />
                            <Text style={styles.sectionTitle}>Ingredients</Text>
                        </View>
                        {productInfo.ingredients.length > 0 ? (
                            productInfo.ingredients.map((ing, index) => (
                                <View key={index} style={[styles.ingredientItem, index === productInfo.ingredients.length - 1 && { borderBottomWidth: 0, paddingBottom: 4 }]}>
                                    <Text style={styles.text}>{capitalizeAll(ing.text)}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        {ing.vegan === 'yes' && <Text style={styles.veganTag}>Vegan</Text>}
                                        {ing.vegetarian === 'yes' && <Text style={styles.vegetarianTag}>Vegetarian</Text>}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={[styles.listItem, styles.noBorderNoPadding]}>No ingredients listed</Text>
                        )}
                    </Animated.View>
                    <Animated.View style={styles.section} entering={FadeInUp.duration(500).delay(200)}>
                        <View style={styles.sectionTitleContainer}>
                            <Orange size={24} color={Colors[colorScheme ?? 'light'].text} />
                            <Text style={styles.sectionTitle}>Nutritional Information (per 100g)</Text>
                        </View>
                        <View>
                            {nutrientList.map((nutrient: any, index: number) => (
                                <NutrientItem key={index} nutrient={nutrient} isLast={index === nutrientList.length - 1} />
                            ))}
                        </View>

                        {productInfo.servingSize && (
                            <>
                                <View style={{ marginBottom: 8, height: 8, borderTopWidth: 1, borderTopColor: Colors[colorScheme ?? 'light'].text + '10' }} />
                                <Text style={styles.text}>
                                    Serving Size: {productInfo.servingSize || "0"}
                                </Text>
                            </>
                        )}
                        {productInfo.quantity && (
                            <>
                                <View style={{ height: 8 }} />
                                <Text style={styles.text}>
                                    Quantity: {productInfo.quantity || "0"}
                                </Text>
                                <View style={{ height: 8 }} />
                            </>
                        )}
                    </Animated.View>
                    <Animated.View style={styles.section} entering={FadeInUp.duration(500).delay(300)}>
                        <View style={styles.sectionTitleContainer}>
                            <Flask size={24} color={Colors[colorScheme ?? 'light'].text} />
                            <Text style={styles.sectionTitle}>Additives</Text>
                        </View>
                        {/* {extraInfo.health.additives.length > 0 ? (
                            extraInfo.health.additives.map((additive, index) => (
                                <AdditiveItem key={index} additive={additive} isLast={index === extraInfo.health.additives.length - 1} />
                            ))
                        ) : (
                            <Text style={[styles.listItem, styles.noBorderNoPadding]}>No additives listed</Text>
                        )} */}
                    </Animated.View>
                    <Animated.View style={styles.section} entering={FadeInUp.duration(500).delay(400)}>
                        <View style={styles.sectionTitleContainer}>
                            <ShieldWarning size={24} color={Colors[colorScheme ?? 'light'].text} />
                            <Text style={styles.sectionTitle}>Allergens</Text>
                        </View>
                        {productInfo.allergens.length > 0 ? (
                            productInfo.allergens.map((allergen, index) => (
                                <Text key={index} style={[styles.listItem, index === productInfo.allergens.length - 1 && styles.noBorderNoPadding]}>{removeDashes(allergen)}</Text>
                            ))
                        ) : (
                            <Text style={[styles.listItem, styles.noBorderNoPadding]}>No allergens listed</Text>
                        )}
                    </Animated.View>
                    <Animated.View style={styles.section} entering={FadeInUp.duration(500).delay(500)}>
                        <View style={styles.sectionTitleContainer}>
                            <Package size={24} color={Colors[colorScheme ?? 'light'].text} />
                            <Text style={styles.sectionTitle}>Packaging</Text>
                        </View>
                        {productInfo.packaging.length > 0 ? (
                            productInfo.packaging.map((pack, index) => (
                                <Text key={index} style={[styles.listItem, index === productInfo.packaging.length - 1 && styles.noBorderNoPadding]}>{pack}</Text>
                            ))
                        ) : (
                            <Text style={[styles.listItem, styles.noBorderNoPadding]}>No packaging information</Text>
                        )}
                    </Animated.View>
                    <Animated.View style={styles.section} entering={FadeInUp.duration(500).delay(600)}>
                        <View style={styles.sectionTitleContainer}>
                            <Factory size={24} color={Colors[colorScheme ?? 'light'].text} />
                            <Text style={styles.sectionTitle}>Manufacturing Places</Text>
                        </View>
                        {productInfo.manufacturingPlaces.length > 0 ? (
                            productInfo.manufacturingPlaces.map((place, index) => (
                                <Text key={index} style={[styles.listItem, index === productInfo.manufacturingPlaces.length - 1 && styles.noBorderNoPadding]}>{place}</Text>
                            ))
                        ) : (
                            <Text style={[styles.listItem, styles.noBorderNoPadding]}>No manufacturing places listed</Text>
                        )}
                    </Animated.View>
                    <Animated.View style={styles.section} entering={FadeInUp.duration(500).delay(700)}>
                        <View style={styles.sectionTitleContainer}>
                            <Tag size={24} color={Colors[colorScheme ?? 'light'].text} />
                            <Text style={styles.sectionTitle}>Categories</Text>
                        </View>
                        {productInfo.categories.length > 0 ? (
                            productInfo.categories.map((category, index) => (
                                <Text key={index} style={[styles.listItem, index === productInfo.categories.length - 1 && styles.noBorderNoPadding]}>{removeDashes(category)}</Text>
                            ))
                        ) : (
                            <Text style={[styles.listItem, styles.noBorderNoPadding]}>No categories listed</Text>
                        )}
                    </Animated.View>
                </ScrollView>
            </View>
        </BackgroundImage>
    );
};

export default ProductDetailScreen;