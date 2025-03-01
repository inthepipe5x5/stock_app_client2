import React, { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import supabase from "@/lib/supabase/supabase";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircleIcon, Edit } from "lucide-react-native";
import { getResourceRoute } from "@/lib/models/utils";
import { baseModelResource } from "@/lib/models/types";
import { resourceIconMap } from "@/constants/resources";
import { Alert } from "./ui/alert";
import { Icon } from "./ui/icon";
import isTruthy from "@/utils/isTruthy";
/**
 * ---------------------------
 * @function fetchChildResources
 * ---------------------------
 * Fetches child resources for a given parent from Supabase.
 */
const fetchChildResources = async (parentType: string, parentId: string) => {
  let childTable;

  switch (parentType) {
    case "household":
      childTable = "public.user_households";
      break;
    case "inventory":
      childTable = "public.products";
      break;
    case "task":
      childTable = "public.tasks";
      break;
    default:
      throw new Error("Invalid parent resource type");
  }

  const { data, error } = await supabase
    .from(childTable)
    .select("*")
    .eq(`${parentType}_id`, parentId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * ---------------------------
 * @function SuspendedParentList
 * ---------------------------
 * Renders a parent resource (household, inventory, or task) and its related child resources.
 */
interface SuspendedParentListProps {
  parentResource: baseModelResource;
}

const SuspendedParentList = ({ parentResource }: SuspendedParentListProps) => {
  const router = useRouter();

  const {
    data: childResources,
    error,
    isLoading,
  } = useQuery(
    {
      queryKey: [
        "childResources",
        parentResource.type,
        parentResource.resource_id,
      ],
    },
    () => fetchChildResources(parentResource.type, parentResource.resource_id)
  );

  const handleEdit = (childId: string) => {
    const { pathname, params } = getResourceRoute({
      resource_id: parentResource.resource_id,
      type: parentResource.type,
      action: "update",
      relations: { children: { id: childId } },
    });
    router.push(pathname as any, params);
  };

  return (
    <VStack space="lg">
      <Heading size="lg">{parentResource.type.toUpperCase()}</Heading>
      <Text size="md">ID: {parentResource.resource_id}</Text>

      <Suspense
        fallback={
          <Card className="p-4">
            <SkeletonText speed={4} />
            <Skeleton className="h-20 mt-2" />
          </Card>
        }
      >
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <Alert>
            <Icon as={AlertCircleIcon} />
            <Text size="md" className="text-error-600">
              Error loading child resources: {error.message}
            </Text>
          </Alert>
        ) : (
          isTruthy(childResources) &&
          childResources?.map((child) => (
            <Card key={child.id} className="p-4">
              <Text size="md">
                {parentResource.type === "household" ? "User" : "Item"}:{" "}
                {child.name ?? child.id}
              </Text>
              <Button
                onPress={() => handleEdit(child.id)}
                variant="outline"
                className="mt-2"
              >
                <ButtonIcon as={Edit} />
                Edit
              </Button>
            </Card>
          ))
        )}
      </Suspense>
    </VStack>
  );
};

export default SuspendedParentList;
