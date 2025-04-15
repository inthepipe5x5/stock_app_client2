import { Profile } from "@/screens/(tabs)/profile/index"
import useSupabaseSession from "@/hooks/useSupabaseSession"

export default function UserProfilePageRoute() {
    const session = useSupabaseSession()

    return (
        <Profile user={session.profile}
    )
}