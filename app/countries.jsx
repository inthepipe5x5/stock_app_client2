import React from "react";
import { useQuery } from "@tanstack/react-query";
// import { fetchCountries } from "@/utils/countries";
import { ScrollView, Text } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import DashboardLayout from "@/screens/_layout";
import { use } from "react";
const COUNTRIES_API =
  process.env.EXPO_COUNTRIES_API || "https://restcountries.com/v3.1/all";

const fetchCountries = async () => {
  const res = await fetch(COUNTRIES_API);
  console.log("fetching countries from", COUNTRIES_API);
  if (!res.ok) throw new Error("Failed to fetch countries");
  console.log("res", res);
  return await res.json();
};

const CountriesScreen = () => {
  // const { data, error, isLoading } = useQuery("countries", fetchCountries);
  const [countries, setCountries] = useState([]);
  useEffect(() => {
    console.log("CountriesScreen mounted");
    fetchCountries().then((data) => {
      console.log("data", data);
      setCountries(data);
    });
  }, []);

  // if (isLoading) {
  //   return (
  //     <HStack>
  //       <Text>Loading Countries...</Text>;
  //       <Spinner size="large" />
  //     </HStack>
  //   );
  // }

  // if (error) {
  //   return <Text>Error: {error.message}</Text>;
  // }

  return (
    <VStack>
      <Button variant="outline" size="md" onPress={() => history.push("/")}>
        Go Back
      </Button>
      <ScrollView>
        {countries.map((country) => (
          <Text key={country.code}>{country.name}</Text>
        ))}
      </ScrollView>
    </VStack>
  );
};

export default () => {
  <DashboardLayout>
    <CountriesScreen />
  </DashboardLayout>;
};
