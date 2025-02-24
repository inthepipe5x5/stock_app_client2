import React, { Suspense } from "react";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { BadgeCheckIcon, LockIcon } from "lucide-react-native";
import { pick, remapKeys } from "@/utils/pick";
import { Spinner } from "./ui/spinner";
import { Edit } from "lucide-react-native";
import { Button } from "./ui/button";
import { useRouter } from "expo-router";
import { baseModelResource } from "@/lib/models/types";
import isTruthy from "@/utils/isTruthy";
import { useToast } from "./ui/toast";
import { userProfile } from "@/constants/defaultSession";

/**
 * ---------------------------
 * @function getResourceRoute
 * ---------------------------
 * Returns an object representing the route pathname & query params for a given resource.
 * @template R
 * @param {R} baseModelResource - The resource being edited.
 * @returns {Object} An object containing the pathname and query parameters for the resource route.
 */
export const getResourceRoute = <R extends baseModelResource>(
  resource: R
): { pathname: string; params: Record<string, any> } => {
  const { action, type, resource_id, relations } = resource || {};
  const { children: childResources } = relations ?? {};
  // Construct the pathname and query parameters for the resource route
  // Example: /(tabs)/(dashboard)/(stacks)/userProfile.12345.children/read
  const pathname = `/(tabs)/(dashboard)/(stacks)/${type}.${resource_id}.${
    isTruthy(childResources) ? `children/${action ?? "read"}` : ""
  }`;
  const params = {
    type,
    id: resource_id,
    action,
    children: childResources
      ? Object.values(childResources)
          .flat()
          .filter(isTruthy)
          .map((child) => child.resource_id)
          .join(",")
      : undefined,
  };
  return { pathname, params };
};

/**
 * ---------------------------
 * @function SuspendedAvatar
 * ---------------------------
 * Inspiration Source: {@link https://gluestack.io/ui/docs/components/badge}
 * @param {object} props - The properties object.
 * @param {string} [props.avatarFallBackText] - The fallback text for the avatar.
 * @param {string} [props.avatarURI] - The URI for the avatar image.
 * @param {string} [props.HeaderText] - The header text to display.
 * @param {string} [props.username] - The username to display.
 * @param {string} [props.badgeStatus] - The status text for the badge.
 * @param {string} [props.role] - The role text to display.
 * @param {string} [props.roleText] - The alternative role text to display.
 * @returns {JSX.Element} The SuspendedAvatar component.
 *
 * @remarks
 * - The SuspendedAvatar component is a UI component that displays a user's avatar, name, and role with suspense for loading states.
 * - The component uses the Avatar, AvatarFallbackText, and AvatarImage components from the GlueStick UI library.
 */
interface SuspendedAvatarProps {
  avatarUserId: string;
  avatarFallBackText?: string;
  avatarURI?: string;
  HeaderText?: string;
  username?: string;
  badgeStatus?: string;
  editPermission?: boolean | false;
  role?: string;
  roleText?: string;
  data?: Partial<userProfile>;
  parentResource?: baseModelResource | null | undefined;
}

export const SuspendedAvatar = (props: SuspendedAvatarProps) => {
  const router = useRouter();
  const defaultAction: baseModelResource["action"] = "read";
  const { action } = props.parentResource ?? { action: defaultAction };
  const editPermission = props.editPermission ?? false;
  const toast = useToast();

  const handleEditButtonPress = () => {
    console.log("Edit button clicked");
    const resourceUpdateRoute = getResourceRoute({
      resource_id: props.avatarUserId,
      type: "userProfile",
      action: "update",
      data: {},
      relations: {},
    });

    return (
      <VStack space="2xl">
        <HStack space="md">
          <Suspense
            fallback={
              <Skeleton variant="rounded" speed={4}>
                <SkeletonText>User Avatar</SkeletonText>
              </Skeleton>
            }
          >
            <Avatar>
              <AvatarFallbackText>
                {props?.avatarFallBackText ?? "User Avatar"}
              </AvatarFallbackText>
              <AvatarImage
                source={{
                  uri:
                    props?.avatarURI ??
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
                }}
              />
            </Avatar>
          </Suspense>
          <VStack>
            <HStack>
              <HStack>
                <Heading size="sm">
                  {props.HeaderText ?? props.username ?? "Suspended Heading"}
                </Heading>
                {editPermission ? (
                  <Edit className="mr-2" size={8} />
                ) : (
                  <LockIcon className="mr-2" size={8} />
                )}
                <Button
                  disabled={!editPermission}
                  action={editPermission ? "primary" : "secondary"}
                  variant="outline"
                  onPress={() => {
                    console.log("Edit button clicked");
                    const action = "update";
                    const resourceUpdateRoute = getResourceRoute({
                      resource_id: props.parentResource?.resource_id ?? "",
                      relations: {
                        children: {
                          userProfile: { user_id: props.avatarUserId },
                        },
                      },
                      type: "userProfile",
                      action: "update",
                    });
                    router.push({
                      pathname:
                        `/(tabs)/(dashboard)/(stacks)/[type].[id].[children]` as any,
                      params: {
                        type: "household",
                        id: props.avatarUserId,
                        children: "members",
                      },
                    });
                  }}
                ></Button>
              </HStack>
              {/* Suspended role badge */}
              <Suspense
                fallback={
                  <Badge
                    size="sm"
                    variant="outline"
                    action="info"
                    className="ml-1"
                  >
                    <HStack>
                      <SkeletonText speed={4} />
                      <Spinner size="small" />
                    </HStack>
                  </Badge>
                }
              >
                <Badge
                  size="sm"
                  variant="solid"
                  action="success"
                  className="ml-1"
                >
                  <BadgeText>{props.badgeStatus}</BadgeText>
                  <BadgeIcon as={BadgeCheckIcon} className="ml-1" />
                </Badge>
              </Suspense>
            </HStack>

            <Suspense fallback={<SkeletonText speed={4} />}>
              <Text size="sm">
                {props.role ?? props.roleText ?? "User Role Text"}
              </Text>
            </Suspense>
          </VStack>
        </HStack>
      </VStack>
    );
  };
};
