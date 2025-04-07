import DashboardLayout from "@/screens/_layout";
import { ResourceContentTemplate } from "./ResourceDetail";
import { userProfile } from "@/constants/defaultSession";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile, getProfile } from "@/lib/supabase/session";
import LoadingOverlay from "@/components/navigation/TransitionOverlayModal";

export const UserProfileComponent = (props: {
    user?: { [key: string]: any } | Partial<userProfile>
    | null | undefined
    bannerURI?: string | null | undefined
    imageURI?: string | null | undefined
    stats?: {
        [key: string]: any
    }[] | null | undefined
}) => {
    const { user } = props;
    const userName = user?.name
        ?? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`;
    const imageURI = props?.imageURI ?? user?.app_metadata?.avatar_url ?? `https://avatar.iran.liara.run/username?username=${(userName)}`;

    return (
        <ResourceContentTemplate
            resourceType="profile"
            resource={user ?? {}}
            onEditButtonPress={() => console.log("Edit button pressed")}
            title={
                userName ?? "User Profile"
            }
            imageURI={imageURI} // Use the imageURI variable here
            bannerURI={props?.bannerURI ?? `https://avatar.iran.liara.run/username?username=${(userName)}`}
        />
    );
}

const UserProfilePage = () => {
    const params = useLocalSearchParams();
    const [userId, setUserId] = React.useState<string | undefined | null>(params?.user_id[0] as string | undefined);
    const router = useRouter();

    useEffect(() => {
        if (!!!userId) {
            return router.replace('/+not-found?message=User not found');
        }

    }, [userId]);

    const userData = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const { data, error } = await getProfile({
                user_id: userId as string,
            });
            if (error) {
                router.replace('/+not-found?message=User not found');
            }
            return data;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
        enabled: !!userId && typeof userId === 'string',
    })

    return (
        <DashboardLayout>
            userData?.isFetched ?
            (<UserProfileComponent user={userData} />) :
            {LoadingOverlay({ visible: userData.isLoading ?? true, title: "Loading User Profile..." })}
        </DashboardLayout>
    );
}
export default UserProfilePage;