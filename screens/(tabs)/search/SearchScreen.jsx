import React, { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonText } from "@/components/ui/skeleton-text";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { Icon } from "@/components/ui/icon";
import { ButtonGroup } from "@/components/ui/button-group";
import { Center } from "@/components/ui/center";
import { FlatList } from "@/components/ui/flat-list";
import { Box } from "@/components/ui/box";
import { Toast } from "@/components/ui/toast";
import { ToastTitle } from "@/components/ui/toast-title";
import { ToastDescription } from "@/components/ui/toast-description";
import { BadgeIcon } from "@/components/ui/badge-icon";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input-field";
import { InputIcon } from "@/components/ui/input-icon";
import { SearchIcon } from "@gluestack-ui/icons";
import { useQuery } from "@tanstack/react-query";
import { ListFilter, ScanBarcode, ShoppingBasket } from "lucide-react-native";
import { useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Check, CheckCheck } from "lucide";
import { resourceIconMap as filters } from "../../../constants/resources";
// Default search category
const defaultCategory = {
  label: "All",
  value: filters.map((category) => category.value),
  icon: CheckCheck,
};

//searchCategories => Label is rendered text, value is the db table to search
const searchCategories = [defaultCategory, ...filters];

/**
 * SearchScreen Component
 *
 * A reusable and dynamic search screen for querying different categories of data.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.searchFunctionsObject - A function or an object of functions to handle searches.
 * @param {string} props.title - Optional title for the search screen.
 * @returns {React.ReactNode} - SearchScreen component.
 */
const SearchScreen = ({ searchFunctionsObject = {}, title, ...props }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [searchCategory, setSearchCategory] = useState(defaultCategory);
  const [openCategoryMenu, setOpenCategoryMenu] = useState(false);
  const { width } = useWindowDimensions();

  const getMenuPlacement = () => (width < 768 ? "bottom" : "top");

  const { data, error, isLoading } = useQuery(
    ["search", debouncedQuery, searchCategory.value],
    async () => {
      const searchFn = searchFunctionsObject[searchCategory.value];
      if (!searchFn) {
        console.warn(
          `No search function for category: ${searchCategory.label}`
        );
        return [];
      }
      return await searchFn(debouncedQuery);
    },
    {
      enabled: !!debouncedQuery,
      staleTime: 500,
      keepPreviousData: true,
    }
  );

  const handleSearch = () => {
    if (!searchQuery) return;
    console.log(`Searching "${searchQuery}" in "${searchCategory.label}"`);
  };

  return (
    <VStack space="md" p="$4" flex={1}>
      <Text size="2xl" bold>
        {title || `Search ${searchCategory.label}`}
      </Text>

      {/* Search Input and Filters */}
      <Center>
        <FormControl>
          <Input className="text-center md:hidden border-border-100">
            <InputField
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {/* <InputSlot className="pr-3">
              <InputIcon as={ListFilter} />
            </InputSlot> */}
          </Input>
        </FormControl>
        <ButtonGroup>
          <Button
            onPress={handleSearch}
            action="primary"
            variant="solid"
            iconRight={<Icon as={SearchIcon} />}
          >
            Search
          </Button>
          <Button
            onPress={() => router.push("/(search)/scan")}
            action="secondary"
            variant="solid"
          >
            <Icon as={Camera} />
            Scan
          </Button>
          <Menu
            isOpen={openCategoryMenu}
            onOpenChange={setOpenCategoryMenu}
            placement={getMenuPlacement()}
          >
            <Menu.Trigger>
              <Button variant="outline">
                <Icon as={ListFilter} />
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              {searchCategories.map((category) => (
                <Menu.Item
                  key={category.value}
                  onPress={() => {
                    setSearchCategory(category);
                    setOpenCategoryMenu(false);
                  }}
                >
                  <Icon as={category.icon} mr="$2" />
                  {category.label}
                  {searchCategory.value === category.value && (
                    <BadgeIcon as={Camera} />
                  )}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu>
        </ButtonGroup>
      </Center>

      {/* Loading State */}
      {isLoading && (
        <Box className="w-[325px] gap-4 p-3 rounded-md bg-background-100">
          <Skeleton variant="sharp" className="h-[150px]" />
          <SkeletonText _lines={3} className="h-3" />
          <HStack className="gap-2 align-middle">
            <Skeleton variant="circular" className="h-[24px] w-[24px] mr-2" />
            <SkeletonText _lines={2} gap={1} className="h-2 w-2/5" />
          </HStack>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Toast variant="error">
          <ToastTitle>Error</ToastTitle>
          <ToastDescription>
            {error.message || "Something went wrong. Please try again."}
          </ToastDescription>
        </Toast>
      )}

      {/* Search Results */}
      {data && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Box
              p="$3"
              borderBottomWidth={1}
              borderBottomColor="$gray200"
              className="bg-background-100 rounded-md"
            >
              <Text>{item.name}</Text>
              <Badge
                action="secondary"
                leftIcon={
                  <Icon
                    as={
                      searchCategories.find((cat) =>
                        cat.value.includes(item.type)
                      )?.icon
                    }
                  />
                }
              >
                {item.type}
              </Badge>
              <Text>{item.description}</Text>
              <Button
                variant="outline"
                onPress={() => router.push(`/details?id=${item.id}`)}
              >
                Details
              </Button>
            </Box>
          )}
          ListEmptyComponent={
            <Center>
              <Text>No results found for "{debouncedQuery}".</Text>
            </Center>
          }
        />
      )}
    </VStack>
  );
};

export default SearchScreen;
