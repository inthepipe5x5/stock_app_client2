import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCountries,
  simpleCountries,
  CountryFilters,
} from "@/utils/countries";
import {
  ScrollView,
  FlatList,
  useWindowDimensions,
  Platform,
} from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import {
  Button,
  ButtonGroup,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Stack, router } from "expo-router";
// import restCountries from "@/utils/rest_countries.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { CameraIcon, ChevronLeft } from "lucide-react-native";
import { Image } from "@/components/ui/image";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Grid, GridItem } from "@/components/ui/grid";
import DashboardLayout from "@/screens/_layout";
import { StatusBar } from "expo-status-bar";

// const COUNTRIES_API =
//   process.env.EXPO_COUNTRIES_API || "https://restcountries.com/v3.1/all";

// const fetchCountries = async () => {
//   const res = await fetch(COUNTRIES_API);
//   console.log("fetching countries from", COUNTRIES_API);
//   if (!res.ok) throw new Error("Failed to fetch countries");
//   console.log("res", res);
//   return await res.json();
// };

const CountriesScreen = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const { data, error, isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
  });

  if (isLoading) {
    let columns, rows;
    if (isLandscape) {
      // Landscape mode
      if (width > 800) {
        // Tablet or larger screen
        columns = 4;
        rows = 12;
      } else {
        // Phone or smaller screen
        columns = 3;
        rows = 3;
      }
    } else {
      // Portrait mode
      if (height > 800) {
        // Tablet or larger screen
        columns = 2;
        rows = 4;
      } else {
        // Phone or smaller screen
        columns = 3;
        rows = 3;
      }
    }

    return (
      <Box className="w-full gap-4 p-3 rounded-md bg-background-100">
        <Grid _extra={{ className: `repeat(${columns}, 1fr)` }} gap={1}>
          {Array(rows * columns)
            .fill(null)
            .map((_, index) => (
              <GridItem key={index} _extra={{ className: "" }}>
                <Skeleton variant="sharp" className="h-[150px]" />
                <SkeletonText _lines={3} className="h-3" />
                <HStack className="gap-2 align-middle">
                  <Skeleton
                    variant="circular"
                    className="h-[24px] w-[24px] mr-2"
                  />
                  <SkeletonText _lines={2} gap={1} className="h-2 w-2/5" />
                </HStack>
              </GridItem>
            ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Center>
        <Box className="w-full gap-4 p-3 rounded-md bg-background-100">
          <Text>
            Error:{" "}
            {error.message ??
              "Uh oh. Something went wrong while loading this page."}
          </Text>
          <Button
            action="primary"
            variant="solid"
            onPress={() => router.canGoBack()}
          >
            {" "}
            Retry
          </Button>
        </Box>
      </Center>
    );
  }

  return (
    <VStack className="w-full gap-4 p-3 rounded-md bg-background-100">
      <Stack.Screen options={{ headerShown: false }} />
      <HStack space="md" style={{ padding: 10 }}>
        <ButtonGroup>
          <Button variant="outline" size="md" onPress={() => router.push("/")}>
            <ButtonIcon as={ChevronLeft} size="md" />
            <ButtonText>Back</ButtonText>
          </Button>
          <Button
            size="sm"
            variant="solid"
            action="primary"
            onPress={() => router.push({ pathname: "/(scan)" })}
          >
            <ButtonIcon as={CameraIcon} size="md" />
            <ButtonText size="md">Scan</ButtonText>
            {/* <ButtonSpinner /> */}
          </Button>
        </ButtonGroup>
      </HStack>

      <ScrollView>
        <Box>
          {data &&
            data.map(
              (country, index) =>
                country.independent &&
                country.name && (
                  <HStack key={`${index}-${country.name}`} space="md">
                    {country.flags.png && (
                      <Image
                        alt={"country flag"}
                        size="2xs"
                        source={{ uri: country.flags.png }}
                      />
                    )}{" "}
                    <Text size="xl" key={`${index}-${country.cca2}`}>
                      {country.name.common ??
                        country.name.official ??
                        "Unknown"}
                    </Text>
                  </HStack>
                )
            )}
        </Box>
      </ScrollView>
    </VStack>
  );
};

// export default () => <CountriesScreen />;
export default () => (
  <DashboardLayout>
    {Platform.OS === "android" ? (
      <StatusBar hideTransitionAnimation={"fade"} />
    ) : (
      <StatusBar style="auto" />
    )}
    <CountriesScreen />{" "}
  </DashboardLayout>
);
