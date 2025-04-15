import React from "react";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Modal, ModalBackdrop, ModalContent, ModalCloseButton, ModalHeader, ModalBody } from "@/components/ui/modal";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Icon, CloseIcon, CopyIcon } from "@/components/ui/icon";
import { resourceRelationship } from "@/lib/models/types";
import { ResourceType } from "@/components/navigation/ResourceActionSheet";
import { Spinner } from "@/components/ui/spinner";
import useDebounce from "@/hooks/useDebounce";
import supabase from "@/lib/supabase/supabase";
import { user_households, userProfile } from "@/constants/defaultSession";
import { useQuery } from "@tanstack/react-query";
import { fetchUserHouseholdRelations } from "@/lib/supabase/session";
import UserCards from "@/screens/content/UserCards";
import { AlertTriangle, MailPlusIcon, ShareIcon, UserCheck2Icon } from "lucide-react-native";
import { Divider } from "@/components/ui/divider";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { userCreateSchema } from "@/lib/schemas/userSchemas";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";

// import * as Clipboard from "expo-clipboard";

// export default function InviteUserModalRoute() {
//   const router = useRouter();
//   const { household_id, resourceType, resourceId } = useLocalSearchParams();
//   const [inviteLink, setInviteLink] = useState<string | null>(null
//     // `https://example.com/app/(tabs)/household/${household_id}/${resourceType}/${resourceId}`
//   );

//   const handleCopyLink = async () => {
//     await Clipboard.setStringAsync(inviteLink);
//     alert("Invite link copied to clipboard!");
//   };

//   return (
//     <VStack className="flex-1 bg-white p-4">
//       <VStack className="gap-2">
//         <Heading size="md" className="text-typography-950">
//           Grow your household
//         </Heading>
//         <Text size="sm" className="text-typography-500">
//           Share this link to invite others to collaborate on this resource.
//         </Text>
//       </VStack>
//       <VStack className="gap-4 mt-4">
//         <Input variant="outline" size="sm" className="flex-1">
//           <InputField value={inviteLink} editable={false} />
//         </Input>
//         <Pressable
//           onPress={handleCopyLink}
//           className="h-9 w-9 justify-center items-center border border-outline-300 rounded"
//         >
//           <Icon as={CopyIcon} className="stroke-background-800" />
//         </Pressable>
//       </VStack>
//       <Button
//         onPress={() => router.back()}
//         className="mt-4"
//         variant="outline"
//         size="md"
//         action="secondary"
//       >
//         <ButtonText>Close</ButtonText>
//       </Button>
//     </VStack>
//   );
// }
export type currentResource = {
  type: Omit<ResourceType, "profile">;
  data: any;
}

export type InviteUserModalProps = {
  showInviteModal: boolean;
  setShowInviteModal: (showInviteModal: boolean) => void;
  userHousehold: Omit<Partial<user_households>, "access_level" | "household_id"> & {
    access_level: user_households["access_level"];
    household_id: user_households["household_id"];
  };
  currentChildResource: currentResource;
  showHouseholdMembers?: boolean;
  resourceRelationship?: resourceRelationship | null;
  resourceId?: string | null;
  resourceType?: string | null;
};

const showInviteOutcomeToast = (
  action: "success" | "error" | "warning" | "info" | "muted",
  redirectLink?: string,
  toastProps?: {
    title?: string;
    description?: string;
    action?: string;
    duration?: number
    placement?: "bottom right" | "bottom left" | "top right" | "top left";
  },
  error?: Error | null | undefined
) => {
  const toast = useToast();
  if (error || action === "error") {
    toast.show({
      duration: toastProps?.duration ?? 5000,
      placement: toastProps?.placement ?? "bottom right",
      onCloseComplete: () => {
        if (redirectLink) {
          router.replace({ pathname: redirectLink as any });
        }
      },
      render: ({ id }) => (
        <Toast nativeID={id} variant="outline" action="error">
          <HStack space="xs">
            <AlertTriangle size={24} />
            <ToastTitle className="text-indicator-error">
              {toastProps?.title ?? "Uh oh. Something went wrong."}{" "}
            </ToastTitle>
            <ToastDescription className="text-indicator-error">
              {toastProps?.description ?? error?.message ?? "An error occurred."}
            </ToastDescription>
            <Button
              onPress={() => {
                console.log("Try again pressed");
                toast.close(id);
              }}
              variant={redirectLink ? "link" : "outline"}
              action="negative"
              size="sm"
              className="ml-5 text-error-400"
            >
              <ButtonText>{redirectLink ? "Go back" : "Try again"}</ButtonText>
            </Button>
          </HStack>
        </Toast>
      ),
    });
  }


  if (action === "success") {
    toast.show({
      duration: toastProps?.duration ?? 5000,
      placement: toastProps?.placement ?? "bottom right",
      onCloseComplete: () => {
        if (redirectLink) {
          router.replace({ pathname: redirectLink as any });
        }
      },
      render: ({ id }) => (
        <Toast nativeID={id} variant="outline" action="success">
          <VStack space="xs">
            <HStack space="xs">
              <ToastTitle className="text-indicator-success">
                {toastProps?.title ?? "Success!"}
              </ToastTitle>
            </HStack>
            <ToastDescription>
              {toastProps?.description ?? "User invited by email."}
            </ToastDescription>
          </VStack>
        </Toast>
      ),
    });

  } else {
    toast.show({
      duration: toastProps?.duration ?? 5000,
      placement: toastProps?.placement ?? "bottom right",
      render: ({ id }) => (
        <Toast nativeID={id} variant="outline" action={action}>
          <VStack space="xs">
            <UserCheck2Icon size={24} />
            <ToastTitle className="text-indicator-success">
              Welcome New User!
            </ToastTitle>
            <ToastDescription className="text-indicator-success">
              Please set up your profile to continue.
            </ToastDescription>
          </VStack>
        </Toast>
      ),
    });
  }
};


export default function InviteUserModal(props: InviteUserModalProps) {
  const [showInviteModal, setShowModal] = React.useState<boolean>(props.showInviteModal ?? false);
  const [searchQuery, setSearchQuery] = React.useState<string | undefined>("");
  const [searchResults, setSearchResults] = React.useState<Partial<userProfile>[] | null>([]);
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);
  const [selectedResults, setSelectedResults] = React.useState<Partial<userProfile> | null>(null);
  const emailSchema = userCreateSchema.partial().pick({ "email": true })

  const { userHousehold: { user_id, household_id, access_level }, currentChildResource } = props;

  const userHouseholdQuery = useQuery({
    queryKey: ["userHousehold", household_id],
    queryFn: async (): Promise<user_households[]> => {
      //fetch current user household data
      const currentHouseholdMembers = await fetchUserHouseholdRelations({ household_id });
      console.log("Current User Household Member Data:", currentHouseholdMembers);
      return currentHouseholdMembers;
    }
  })

  //find other users to invite
  const findUsersQuery = useQuery({
    queryKey: ["findUsers", searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
          .not('user_id', 'eq', user_id)
          .not("user_id", "in", userHouseholdQuery.data?.map(member => member.user_id) ?? [])
          .limit(10)
          .order("name", { ascending: true });
        if (error) throw error;
        return data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      }
    },
    enabled: !!searchQuery && searchQuery !== "" && searchQuery.length > 2 && userHouseholdQuery.isSuccess,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
    staleTime: 1000 * 3,
  });


  const onSearch = (e: any) => {
    setSearchQuery(useDebounce(e.target.value, 3000));
  }

  const generateNewUserInvite = async () => {
    try {
      if (!selectedResults || selectedResults === null) {
        showInviteOutcomeToast("warning", undefined, { title: "No user selected", description: "Please select a user to invite." });
        //reset search query
        setSearchQuery("");
        return;
      } else if (!selectedResults?.email || selectedResults?.email === "") {
        showInviteOutcomeToast("warning", undefined, { title: "No email found", description: "Please select a user with an email address or enter a proper email address" });


        const { data, error } = await supabase.auth.signInWithOtp({
          type: "magiclink",
          email: selectedResults?.email ?? "",
          options: {
            redirectTo: "/app/(auth)/(signup)/join-household",
            expiresAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(),
            shouldCreateUser: false //prevent creating new user
          }
        })
      }
    }
    catch (error) {
      showInviteOutcomeToast("error", undefined, { title: "Error generating invite link", description: (error as Error)?.message ?? "An error occurred." }, error as Error);
    }
  }
  const generateInviteLink = async () => {
    if (!selectedResults || selectedResults === null) {
      showInviteOutcomeToast("warning", undefined, { title: "No user selected", description: "Please select a user to invite." });
      //reset search query
      setSearchQuery("");
      return;
    };
    let path = "/app/(tabs)/(stacks)/[type]/[id]/[action]";
    let params = {
      type: currentChildResource.type.toString(),
      id: currentChildResource.data.id,
      action: "join",
      dismissToURL: "/app/(tabs)/(stacks)/[type]/[id]/[details]"
    }
    try {
      if (currentChildResource.type === "household") {
        path = "/app/(auth)/(signup)/join-household";
        params = {
          householdId: currentChildResource.data.id,
          newMemberEmail: selectedResults.email,
          invited_at: new Date().toISOString()
        }
      }

      const appLink = await Linking.createURL(
        "/app/(tabs)/(stacks)/[type]/[id]/[action]",
        {
          queryParams:
          {
            type: currentChildResource.type.toString(), id: currentChildResource.data.id,
            action: "join"
          }
        });
    }
    catch (error) {
      showInviteOutcomeToast("error", undefined, { title: "Error generating invite link", description: (error as Error)?.message ?? "An error occurred." }, error as Error);
    }
  }

  const onSubmit = async (data: any) => {
    console.log("On Submit pressed => submit data:", data);
    if (selectedResults && selectedResults !== null && selectedResults?.user_id) {
      try {
        // Call API to invite user
        const upsertedData = await supabase.from("user_households").upsert({
          user_id: selectedResults?.user_id,
          household_id: data.household_id,
          access_level: "member",
          invite_accepted: false,
          invited_at: new Date().toISOString(),
        });
        console.log("Upserted data:", upsertedData);
        showInviteOutcomeToast("success", undefined, { title: "User invited", description: "User invited by email." });

        //close modal
        setShowModal(false);

      } catch (error) {
        showInviteOutcomeToast("error", undefined, { title: "Error inviting user", description: (error as Error)?.message ?? "An error occurred." }, error as Error);
      }
    }
  }

  return (
    <>
      <Button onPress={() => setShowModal(true)} className="flex-row items-center gap-2"
        variant="outline" size="md" action="secondary">
        <ButtonText>Share</ButtonText>
        <ButtonIcon as={ShareIcon} className="stroke-background-500" size="md" />
      </Button>
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <ModalBackdrop />
        <ModalContent className="max-w-[395px]">
          <ModalHeader className="gap-2 items-start">
            <VStack className="gap-1">
              <Heading size="md" className="text-typography-950">
                {["task", "product"].includes(currentChildResource.type as unknown as string) ? "Share with user" : "Grow your household"}

              </Heading>
              <Text size="sm" className="text-typography-500">
                {["task", "product"].includes(currentChildResource.type as unknown as string) ? "Invite a user" : "Invite a user to join your household"}
              </Text>
            </VStack>
            <ModalCloseButton>
              <Icon as={CloseIcon} className="stroke-background-500" />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody
            className="mb-0"
            contentContainerClassName="gap-4 space-between flex-row items-center"
          >
            <Input variant="outline" size="sm" className="flex-1">
              <InputField
                value={searchQuery}
                onChange={onSearch}
                onBlur={(text: string) => {
                  if (text === "" || text.length < 3) {
                    setSearchResults(null);
                  } setSearchQuery(text);
                }}
                placeholder={`Search for a user to join ${currentChildResource.type}`}
              />
            </Input>
            <Button
              variant="solid"
              action="positive"
              size="lg"
              className="flex-1 fixed-bottom-0"
              // disabled={selectedResults === null || selectedResults === undefined}
              onPress={async () => {
                const validEmail = await emailSchema.parseAsync(selectedResults.email)
                //handle success
                if (validEmail) onSubmit(selectedResults);
                setTimeout(() => {
                  showInviteOutcomeToast("info", undefined, { title: "No existing users found", description: `Please select a user or enter a valid email! This input is invalid: ${validEmail.email}` });

                }, 2000);
              }}>
              <ButtonText className="text-typography-white">{selectedResults ? "Send Email Invite" : "Add User"}</ButtonText>
              <ButtonIcon as={MailPlusIcon} className="stroke-white" />
            </Button>
            <Divider className="w-full my-5" />
            <VStack className="flex-1 gap-2">
              {findUsersQuery.isLoading ? (
                <Spinner size="small" />
              ) : findUsersQuery.isSuccess ? (
                findUsersQuery.data?.map((user: any) => (
                  <Pressable key={user.id} onPress={() => setSelectedResults(user)} className="flex-row items-center gap-2">
                    <UserCards user={{ ...user, role: "non-member" }} keysToRender={["email", "role"]} />
                    {/* <VStack className="gap-1">
                      <Text size="sm" className="text-typography-950">{user.name}</Text>
                      <Text size="xs" className="text-typography-500">{user.email}</Text>
                    </VStack> */}
                  </Pressable>
                ))
              ) : null}
            </VStack>

          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
