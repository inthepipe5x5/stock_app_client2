import Dashlayout from "screens/(tabs)/_layout";
import InviteUserModal from "@/components/InviteUserModal";

export default function ContentDashboard(props: any) {
  return (
    <Dashlayout>
      <InviteUserModal />
      {props.children}
    </Dashlayout>
  );
}
