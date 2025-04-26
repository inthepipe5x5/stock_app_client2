// import { useState, useRef, useCallback, useMemo, useEffect, createContext, useContext } from "react";
// import * as ImagePicker from "expo-image-picker";
// import { Dimensions, Platform } from "react-native";
// import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogBody, AlertDialogBackdrop } from "@/components/ui/alert-dialog";
// import { Button, ButtonText } from "@/components/ui/button";
// import { Heading } from "@/components/ui/heading";
// import { Text } from "@/components/ui/text";
// import React from "react";
// import { viewPort } from "@/constants/dimensions";
// const MediaContext = createContext(null);

// export const MediaProvider = ({ children }: { children: React.ReactNode }) => {
//     const [showPermissionModal, setShowPermissionModal] = useState<"camera" | "gallery" | null>(null);
//     const cameraPermissionStatusRef = useRef<"granted" | "denied" | "cancelled" | null>(null);
//     const [media, setMedia] = useState<{ [key: string]: any }[] | null>(null);
//     const { width, height } = Dimensions.get('window')
    
//     const requestPermission = useCallback(async () => {
//         const { status } = await ImagePicker.requestCameraPermissionsAsync();
//         return { status };
//     }, []);

//     const pickMedia = useCallback(async (type: "all" | "images" | "videos" = 'all') => {
//         const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (status !== "granted") {
//             console.warn("Permission to access camera roll is required!");
//             return null;
//         }
//         const result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: type === "all"
//                 ? ImagePicker.MediaTypeOptions.All
//                 : type === "images"
//                     ? ImagePicker.MediaTypeOptions.Images
//                     : ImagePicker.MediaTypeOptions.Videos,
//             allowsEditing: ['android', 'ios'].includes(Platform.OS),
//             aspect: [4, 3],
//             quality: 1,
//         });
//         if (!result.canceled && !!result?.assets) {
//             return setMedia(result.assets);
//         }
//         else if (!result?.canceled) {
//             setMedia(null) //clear media if no assets are selected
//         }
//     }, []);


//     const requestMediaPermissions = async () => {
//         try {
//             const permissionResponse = await requestPermission()
//             cameraPermissionStatusRef.current = (permissionResponse?.status as "granted" | "denied" | "cancelled") ?? null;
//             if (showPermissionModal) setShowPermissionModal(false);
//         }
//         catch (error) {
//             console.error("Error requesting permissions:", error);
//         }
//     };

//     useEffect(() => {
//         if ([cameraPermissionStatusRef?.current, cameraPermissionStatusRef].every(ref => ref === Fnull)) {
//             setShowPermissionModal(true);
//         }

//         // requestPermissions();
//     }, []);


//     function AlertDialogComponent({
//         heading,
//         description
//     }: {
//         heading?: string | null | undefined
//         description?: string | null | undefined
//     }


//     ) {
//         const handleClose = () => setShowPermissionModal(null);
//         return (
//             <>
//                 <Button onPress={() => setShowPermissionModal('gallery')}>
//                     <ButtonText>Open Dialog</ButtonText>
//                 </Button>
//                 <AlertDialog
//                     isOpen={showPermissionModal !== null}
//                     onClose={handleClose}
//                     size={viewPort.width > 600 ? "lg" : "sm"}
//                     className={`min-width-${viewPort.devices.mobile.width} max-width-${viewPort.devices.tablet.width}`}
//                 >
//                     <AlertDialogBackdrop />
//                     <AlertDialogContent>
//                         <AlertDialogHeader>
//                             <Heading className="text-typography-950 font-semibold" size="md">
//                                 {heading ?? "Permissions Required"}
//                             </Heading>
//                         </AlertDialogHeader>
//                         <AlertDialogBody className="mt-3 mb-4">
//                             <Text size="sm">
//                                 {description ?? "Camera & File Permissions are required to access the camera and gallery. Please allow access to continue."}
//                             </Text>
//                         </AlertDialogBody>
//                         <AlertDialogFooter className="">
//                             <Button
//                                 variant="outline"
//                                 action="secondary"
//                                 onPress={() => {
//                                     //set permission refs
//                                     cameraPermissionStatusRef.current = 'cancelled';
//                                     //close alert
//                                     handleClose()
//                                 }}
//                                 size="sm"
//                             >
//                                 <ButtonText>Cancel</ButtonText>
//                             </Button>
//                             <Button size="sm" onPress={async () => {
//                                 const permissionResponse = await requestPermission()
//                                 cameraPermissionStatusRef.current = (permissionResponse?.status as "granted" | "denied" | "cancelled") ?? null;
//                                 setShowPermissionModal(null);
//                             }}>
//                                 <ButtonText>Set Permissions</ButtonText>
//                             </Button>
//                         </AlertDialogFooter>
//                     </AlertDialogContent>
//                 </AlertDialog>
//             </>
//         );
//     }

//     const value = useMemo(() => ({
//         requestMediaPermissions,
//         pickMedia
//     }), []);


//     return (
//         <MediaContext.Provider value={value}>
//             {children}
//             {showPermissionModal ? <RequestPermissionModal variant={showPermissionModal} /> : null}
//         </MediaContext.Provider>
//     );
// };

// export const useMediaContext = () => {
//     const context = useContext(MediaContext);
//     if (!context) {
//         throw new Error("useMediaContext must be used within a MediaProvider");
//     }
//     return context;
// };

// export default MediaProvider;