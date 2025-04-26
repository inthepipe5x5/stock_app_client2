import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, Stack, router } from 'expo-router';
// import ProductDetailScreen from '@/features/products/ProductDetailScreen';
// import { extractExtraInformation, extractProductInfo, CustomOFFProductExtraInfoType, CustomOFFProductInfoType } from '@/features/products/Product';
import Colors from '@/constants/Colors';
import ResourceBackgroundMedia from '@/screens/content/ResourceBackgroundMedia';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ThemedView } from '@/components/ThemedView';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from '@/components/ui/button';
import { CustomOFFProductInfoType, CustomOFFProductExtraInfoType, OFFProductHelper } from '@/lib/supabase/ResourceHelper';
import useOFFClient from '@/hooks/useOFFClient';
import { useUserSession } from '@/components/contexts/UserSessionProvider';
import defaultSession from '@/constants/defaultSession';



export default function OFFDetailScreen() {
    const { barcode } = useLocalSearchParams<{ barcode: string }>();
    const [product, setProduct] = useState<CustomOFFProductInfoType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [extraInformation, setExtraInformation] = useState<CustomOFFProductExtraInfoType | null>(null);
    const [notFound, setNotFound] = useState<boolean>(false);
    const state = useUserSession() || defaultSession;
    const { client } = useOFFClient({ state });
    const helper = new OFFProductHelper();

    const getInfo = (data: any) => {
        const productInfo = helper.getOFFProductInfo(data);
        const extraInfo = helper.getExtraOFFProductInfo(data);
        if (!!productInfo && !!extraInfo) {
            setProduct(productInfo);
            setExtraInformation(extraInfo);
            return { productInfo, extraInfo };
        } else return { productInfo: null, extraInfo: null };
    }
    const qc = useQueryClient();
    const prefetchedData = qc.getQueryData(['product', barcode]) as CustomOFFProductInfoType | undefined;

    const productData = useQuery<CustomOFFProductInfoType, Error>({
        queryKey: ['product', barcode],
        queryFn: async () => {
            try {
                const data = await client.getCombinedProductData(barcode);
                if (!data) {
                    setNotFound(true);
                    return;
                }
                const { productInfo, extraInfo, prices } = data;
                // const { extraInfo, productInfo } = getInfo(productData);
                setProduct(productInfo);
                setExtraInformation(extraInfo);

                if (!!productInfo && !!extraInfo) {
                    const product: CustomOFFProductInfoType = {
                        code: data.code,
                        // ecoScore: data.product.ecoscore_grade,
                        // nutriScore: data.product.nutriscore_grade,
                        imageUrl: data.product.image_front_url,
                        brandName: data.product.brands,
                        productName: data.product.product_name,
                        category: data.product.categories_tags ? data.product.categories_tags.map((category: string) => category.replace('en:', '')) : [],
                        productType: data.product.product_type,
                        createdDate: new Date().toISOString(),
                        productInfo: productInfo,
                        extraInfo: extraInfo
                    };
                    qc.setQueryData(['product', barcode], product);
                    return product;
                }
            } catch (err) {
                console.error(err)
                setError('Failed to fetch product');
            }
        },
        initialData: prefetchedData,
        initialDataUpdatedAt: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchInterval: 1000 * 60 * 15, // 15 minutes
        enabled: !!barcode && !!!prefetchedData,
    })

    if (notFound) {
        return <>
            <Stack.Screen options={{
                title: 'Product Not Found',
                headerBackTitle: "Go Back"
            }} />
            <NoProductView />
        </>
    }

    if (error) {
        return <>
            <Stack.Screen options={{
                title: 'Error',
                headerBackTitle: "Go Back"
            }} />
            <View>
                <Text>{error}</Text>
            </View>
        </>
    }

    if (!product || !extraInformation) {
        return <>
            <Stack.Screen options={{
                title: 'Loading...',
                headerBackTitle: "Go Back"
            }} />
            <LoadingView />
        </>
    }

    if (!product) {
        return
        <>
            <Stack.Screen options={{
                title: 'Product Not Found',
                headerBackTitle: "Go Back"
            }} />
            <VStack className="flex-1 justify-center items-center">
                <Text>Product not found</Text>
                <Button onPress={() => router.back()} className="mt-4" variant="primary">
                    <ButtonText>
                        Go Back
                    </ButtonText>

                </Button>
            </VStack>
        </>
    }

    return (
        <>
            <Stack.Screen options={{ title: product.productName ?? "Unkown Product", headerBackTitle }} />
            <ProductDetailScreen productInfo={product} extraInfo={extraInformation}></ProductDetailScreen>
        </>
    );
}

function LoadingView() {
    const colors = Colors[useColorScheme() ?? 'light'];
    return (
        <ResourceBackgroundMedia>
            <ThemedView className="flex-1 paddingTop-80 paddingHorizontal-32 rounded-md">
                <ProgressBar duration={500} color={colors.accent} trackColor={colors.background} />
            </ThemedView>
        </ResourceBackgroundMedia>
    );
}
