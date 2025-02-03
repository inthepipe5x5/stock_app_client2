import QRView from "@/screens/qrView";
import DashboardLayout from "@/screens/_layout";
import { useLocalSearchParams } from "expo-router";

export default () => {
  const local = useLocalSearchParams();
  return (
    <DashboardLayout>
      <QRView qrValue={local.id} />
    </DashboardLayout>
  );
};
