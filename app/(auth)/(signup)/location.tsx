import { LocationFormComponent } from "@/screens/(auth)/LocationForm";
import { useCallback, useEffect, useState } from "react";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import { AuthLayout } from "@/screens/(auth)/layout";
import { useForegroundPermissions, getLastKnownPositionAsync, reverseGeocodeAsync, stopLocationUpdatesAsync } from "expo-location"
import { Toast, useToast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { MapPinCheck } from "lucide-react-native";
import isTruthy from "@/utils/isTruthy";
import { useLocalSearchParams } from "expo-router";

export default function newUserLocationScreen() {
  const { state, dispatch } = useUserSession();
  const params = useLocalSearchParams();
  const [disableForm, setDisableForm] = useState(false);
  const [permission, requestPermission] = useForegroundPermissions();
  const [defaultValues, setDefaultValues] = useState({
    city: state?.user?.city ?? params?.city[0] ?? "",
    state: state?.user?.state ?? params?.state[0] ?? "",
    country: state?.user?.country ?? params?.country[0] ?? "",
    postalcode: state?.user?.postalcode ?? params?.postalcode[0] ?? "",
  });
  const toast = useToast();



  //check location
  useEffect(() => {
    const fetchLocation = async () => {
      //request permission if not granted
      if (!state?.user?.preferences?.locationPermissions && (permission === null || (permission.status !== "granted" && permission.status !== "denied"))) {
        await requestPermission();
      }
      //if permission denied, return
      if (permission?.status === "denied") {
        //stop location updates
        stopLocationUpdatesAsync("locationTask");
        //show toast to request permissions
        return toast.show({
          placement: "top",
          duration: 10000,
          render: ({ id }) => (
            <Toast id={id} variant="outline" action="warning">
              <ToastTitle>Location Permissions Denied</ToastTitle>
              <ToastDescription>
                You have denied location permissions. Please enable location permissions or fill out the form manually.
              </ToastDescription>
              <Button onPress={() => requestPermission()} variant="outline" action="positive">
                <ButtonText>
                  Enable Location Permissions
                </ButtonText>
                <ButtonIcon as={MapPinCheck} fill={"green"} />
              </Button>
            </Toast>
          ),
        });
      }
      {/* //get location if permission granted */ }
      const locationResponse = await getLastKnownPositionAsync();
      {/* //reverse geocode location into city, state, country, postal code */ }
      if (locationResponse) {
        const { coords } = locationResponse;
        const { latitude, longitude } = coords;
        const address = await reverseGeocodeAsync({ latitude, longitude });

        console.log("address found via expo location hook:", address);

        //only update global user state & default values if address is found
        if (address.length > 0 && address.some(isTruthy)) {
          const { city, region: state, country, postalCode } = address[0] || "";
          dispatch({
            type: "UPDATE_USER",
            payload: {
              user: {
                city,
                state,
                country,
                postalcode: postalCode,
              },
              preferences: {
                locationPermissions: permission?.status === "granted",
              },
            },
          });
          setDefaultValues({
            city: city ?? "",
            state: state ?? "",
            country: country ?? "",
            postalcode: postalCode ?? "",
          });
          //update formProps to disable form
          formProps.disableForm = true;
        }
      }
    };
    fetchLocation();
  }, [permission]);

  const enableEditButton = () => {
    return (
      <Button size="sm" variant="solid" action="positive" onPress={() => setDisableForm(false)}>
        <ButtonText>
          Edit
        </ButtonText>
      </Button>
    )
  }
  let formProps = {
    disableForm: disableForm,
    setDisableForm: setDisableForm,
    enableEditButton: useCallback(() => enableEditButton(), []),
  }


  return (
    <AuthLayout>
      {/** enable manual form entry if location permissions are denied       */
        formProps.disableForm ?
          enableEditButton() : null
      }

      {/* //pass default values and form props to the form screen */}
      <LocationFormComponent defaultValues={defaultValues} formProps={formProps} />
    </AuthLayout>
  );
}
