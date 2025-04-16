// import { cn } from "@gluestack-ui/nativewind-utils/cn";
// import { ThemedView } from "./ThemedView";
// import { Turnstile } from '@marsidev/react-turnstile'
// import { Appearance } from "react-native";
// import React from "react";
// import { viewPort } from "@/constants/dimensions";
// import { Heading } from "./ui/heading";
// import { useUserSession } from "./contexts/UserSessionProvider";
// import { useCaptchaContext } from "./contexts/CaptchaContext";
// import { Text } from "./ui/text";
// import { Pressable } from "./ui/pressable";
// import { Box } from "./ui/box";
// import { View } from "react-native";

// export type CaptchaStyleProps = {
//     container?: {
//         className?: string | null | undefined;
//         minHeight?: number | null | undefined;
//         minWidth?: number | null | undefined;
//         maxHeight?: number | null | undefined;
//         maxWidth?: number | null | undefined;
//     },
//     theme?: 'light' | 'dark' | null | undefined;
//     size?: 'normal' | 'compact' | 'invisible' | null | undefined;
// }

// export type CaptchaProps = {
//     // setCaptchaToken: (token: string | null) => void;
//     // setCaptchaError?: (error: string | null) => void;
//     styles?: CaptchaStyleProps | null | undefined;
// }
// /** @remark DEPRECATED: This component is deprecated and will be removed in the future. CAPTCHA HAS BEEN TURNED OFF FOR NOW DUE TO REACT NATIVE ISSUES WITH TURNSTILE
//  *  @remark This component is used to render the Cloudflare Turnstile Captcha.
//  * 
//  * This component is used in the following routes:
//  * *  - Add / Update / Delete routes
//  * *  - Login / Register routes
//  * 
//  * @param param0 
//  * @returns 
//  */

// export default function Captcha({
//     styles,
//     // setCaptchaToken,
//     // setCaptchaError 
// }: CaptchaProps) {
//     const siteKey = process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ?? null
//     const theme = (styles?.theme ?? (Appearance.getColorScheme() ?? 'light'));
//     const [captchaError, setCaptchaError] = React.useState<string | null>(null);
//     const {
//         turnstileRef,
//         getCaptchaToken,
//         updateCaptchaThenRedirect
//     } = useCaptchaContext();

//     if (siteKey === null) {
//         console.error("Cloudflare Turnstile site key is not defined. Please set the EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY environment variable.");
//         throw new Error("Cloudflare Turnstile site key is not defined. Please set the EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY environment variable.");
//     }
//     const onError = (error: string) => {
//         console.error("Captcha error:", error);
//         if (!!setCaptchaError) {
//             setCaptchaError(error);
//         }
//     }

//     return (
//         <ThemedView
//             className={cn(
//                 "flex-1 justify-center items-center",
//                 styles?.container?.className ?? "",
//                 theme === 'dark' ? "bg-background-0" : "bg-background-900"
//             )}
//             style={{
//                 minHeight: styles?.container?.minHeight ?? viewPort.devices.mobile.width * 0.5,
//                 minWidth: styles?.container?.minWidth ?? viewPort.devices.mobile.width * 0.8,
//                 maxHeight: viewPort.height * 0.8,
//                 maxWidth: viewPort.width * 0.8,
//             }}
//         >
//             <Heading
//                 className={cn(
//                     "text-center",
//                     theme === 'dark' ? "text-background-900" : "text-background-0",

//                 )}
//             >Please complete the Captcha challenge to continue.</Heading>
//             <Turnstile
//                 ref={turnstileRef}
//                 siteKey={siteKey}
//                 options={{
//                     theme,
//                     size: styles?.size ?? 'normal',
//                 }}
//                 onSuccess={(token) => {
//                     console.log(token);
//                     updateCaptchaThenRedirect(token);
//                 }}
//                 onError={onError}
//                 onExpire={() => {
//                     console.log("Captcha expired.");
//                     setCaptchaError("Captcha expired. Please try again.");
//                 }}
//                 onTimeout={() => {
//                     console.log("Captcha timed out.");
//                     setCaptchaError("Captcha timed out. Please try again.");
//                 }}
//                 as={View}
//             />
//             {
//                 captchaError ?
//                     (
//                         <Box
//                             className={cn(
//                                 "flex-1 justify-center items-center",
//                                 theme === 'dark' ? "bg-background-0" : "bg-background-900",
//                             )}
//                             style={{
//                                 minHeight: styles?.container?.minHeight ?? viewPort.devices.mobile.width * 0.5,
//                                 minWidth: styles?.container?.minWidth ?? viewPort.devices.mobile.width * 0.8,
//                                 maxHeight: viewPort.height * 0.4,
//                                 maxWidth: viewPort.width * 0.4,
//                             }}
//                         >
//                             <Heading
//                                 className={cn(
//                                     "text-center",
//                                     theme === 'dark' ? "text-background-900" : "text-background-0",
//                                 )}>
//                                 Captcha error: {captchaError}
//                             </Heading>
//                             <Pressable
//                                 onPress={() => {
//                                     setCaptchaError(null);
//                                     turnstileRef.current?.reset();
//                                 }}
//                                 className={cn(
//                                     "flex-1 justify-center items-center rounded-md p-2 m-2 border-2",
//                                     theme === 'dark' ? "border-background-900 bg-background-0"
//                                         : "border-background-200 bg-background-900"
//                                     ,
//                                 )}>
//                                 <Text
//                                     className={cn(
//                                         "text-center",
//                                         theme === 'dark' ? "text-background-900" : "text-background-0",
//                                     )}
//                                 >Please try again.
//                                 </Text>
//                             </Pressable>
//                         </Box>
//                     ) :
//                     null
//             }
//         </ThemedView >
//     )
// }