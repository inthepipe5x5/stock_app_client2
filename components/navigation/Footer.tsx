import React, { useRef, useEffect, ReactNode } from 'react';
import { Keyboard, Animated, ScrollView, View, Platform, Dimensions, useWindowDimensions, KeyboardAvoidingView, Appearance } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '../ui/button';
import { viewPort } from "@/constants/dimensions";
import { HStack } from '../ui/hstack';
import { cn } from '@gluestack-ui/nativewind-utils/cn';
import { Pressable } from '../ui/pressable';
import { router } from 'expo-router';
import { Icon } from '../ui/icon';
import { Icons, SideBarContentList } from './NavigationalDrawer';
import { LucideIcon } from 'lucide-react-native';
import { BlurView } from "expo-blur";

interface FloatingHeaderProps {
  children: ReactNode;
  variant?: 'default' | 'rounded' | 'square'; //'default' | 'square' => default 
}
/**
 * The FloatingHeader component in TypeScript React uses Animated API to slide up when the keyboard is
 * shown and slide back down when the keyboard is hidden.
 * @param {FloatingHeaderProps}  - The code you provided is a React component called `FloatingHeader`
 * that creates a floating header with animation when the keyboard is shown or hidden. Here's a
 * breakdown of the code:
 * @returns The `FloatingHeader` component is being returned. It consists of an `Animated.View`
 * component that animates based on the keyboard events (`keyboardWillShow` and `keyboardWillHide`).
 * Inside the `Animated.View`, there is a `BlurView` component with some styling and children
 * components passed as props.
 */

export function FloatingHeader(
  {
    children,
    variant
  }: FloatingHeaderProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const containerStyle = {
    border: !!!variant || ['default', 'square'].includes(variant) ? '' : 'rounded-full border-2 border-border-200 shadow-sm',
  }

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener("keyboardWillShow", () => {
      Animated.timing(slideAnim, {
        toValue: -80, // move up
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    const keyboardWillHide = Keyboard.addListener("keyboardWillHide", () => {
      Animated.timing(slideAnim, {
        toValue: 0, // move back down
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
      <BlurView
        intensity={50}
        tint="light"
        className={cn("w-full border-b border-border-200 p-4", containerStyle.border)}
      >
        <Box className="flex-row items-center justify-between">
          {children}
        </Box>
      </BlurView>
    </Animated.View >
  );
}



interface FloatingFooterProps {
  children: ReactNode;
  safeAreaBottom?: boolean;
  slideAnimVal?: Animated.Value | null | undefined;
  translateYVal?: number | null | undefined;
}

export function FloatingFooter({ children, translateYVal, slideAnimVal = null, safeAreaBottom = true }: FloatingFooterProps) {
  const slideAnim = useRef(slideAnimVal ?? new Animated.Value(0)).current;
  const slideUpValue = Math.abs(translateYVal ?? 60) * -1; // Default slide up value
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener("keyboardWillShow", () => {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    const keyboardWillHide = Keyboard.addListener("keyboardWillHide", () => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, slideUpValue], // Slide up by 60px
  });

  const BlurComponent: React.FC<{ children: ReactNode }> = ({ children }) => Platform.OS === 'ios' ? (
    <BlurView
      intensity={50}
      tint="light"
      className={`w-full border-t border-border-200 p-4 ${safeAreaBottom ? "pb-8" : ""}`}
    >
      {children}
    </BlurView>
  ) : (
    <View
      className={cn(`w-full border-t border-border-200 p-4`,
        Appearance.getColorScheme() === 'dark' ? 'bg-black/80' : ` bg-white/80`,
        safeAreaBottom ? "pb-8" : ""
      )}
    >
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      className="w-full"
    >
      <Animated.View style={{ transform: [{ translateY }] }}>
        {/* 
        //commented out for now, as it is not working as expecte on android - replaced with BlurComponent
        // BlurView is not natively supported on Android, so we use a View with a background color instead
        <BlurView
          intensity={50}
          tint="light"
          className={`w-full border-t border-border-200 p-4 ${safeAreaBottom ? "pb-8" : ""}`}
        > */}
        <BlurComponent>
          <Box className="flex-row items-center justify-center">
            {children}
          </Box>
        </BlurComponent>
        {/* </BlurView> */}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

export const StyledBox = (props: any) => {
  return (
    <ScrollView className="display-flex" {...(props?.scrollViewProps ? { ref: props.scrollViewProps } : {})}>
      <Box className="bg-slate-100 border-r-background-info p-16" {...props} />
    </ScrollView>
  );
}

type footerProps = {
  titleText?: string;
  footerButtonOnPress?: () => void;
  footerButtonProps?: any;
  contentChildren?: JSX.Element | JSX.Element[];
  footerChildren?: LucideIcon[];
  footerAnimationProps?: any;
  translateY?: any;
}

// export const AnimatedMobileFooterView = (props: footerProps) => {

//   const scrollY = useRef(new Animated.Value(0)).current;
//   const windowDimensions = useRef(Dimensions.get('window'));
//   const {height: windowHeight, width: windowWidth } = windowDimensions.current;
//   const translateY = scrollY.interpolate(props.translateY ?? {
//     inputRange: [0, ((windowHeight * 0.3) + 100)], // Footer moves out of view when scrolling down //[triggerHeight, triggerHeight + 100],
//     outputRange: [(windowHeight * 0.3 + 100), 0], // Footer moves into view when scrolling up //[0, 100],
//     extrapolate: 'clamp',
//   });

//   return (
//     <View style={{ flex: 1 }}>
//       <Animated.ScrollView
//         onScroll={Animated.event(
//           [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//           { useNativeDriver: true }
//         )}
//         scrollEventThrottle={16}
//       >
//         {/* Main Content */}
//         <View style={{ height: 1200, paddingBottom: 0 }}>
//           <Text className="text-lg">{props.titleText ?? "Scroll down to see the footer appear!"}</Text>
//         </View>
//       </Animated.ScrollView>

//       {/* Footer */}
//       <Animated.View
//         style={props.footerAnimationProps ?? {
//           position: 'absolute',
//           bottom: 0,
//           left: 0,
//           right: 0,
//           transform: [{ translateY }],
//           backgroundColor: '#333',
//           padding: 16,
//         }}
//       >
//         {/* <StyledBox className="p-1">
//           {props.footerChildren ? props.footerChildren : (
//             <Button action="positive" variant="solid" className="animate-hover-highlight" onPress={props.footerButtonOnPress ?? (() => {
//               console.log('Footer button pressed!');
//             })} {...(props.footerButtonProps ?? {})}>
//               <ButtonText className="text-white text-center">Sticky Footer</ButtonText>
//             </Button>
//           )}
//         </StyledBox> */}
//         <HStack
//           className={cn(
//             "bg-background-0 justify-between w-full absolute left-0 bottom-0 right-0 p-3 overflow-hidden items-center  border-t-border-300  md:hidden border-t",
//             { "pb-5": Platform.OS === "ios" },
//             { "pb-5": Platform.OS === "android" }
//           )}
//         >
//           {(props?.footerContent ?? SideBarContentList).map(
//             (
//               item: Icons,
//               index: React.Key | null | undefined
//             ) => {
//               return (
//                 <Pressable
//                   className="px-0.5 flex-1 flex-col items-center"
//                   key={index}
//                   onPress={() => router.push("/news-feed/news-and-feed")}
//                 >
//                   <Icon
//                     as={item.iconName}
//                     size="md"
//                     className="h-[32px] w-[65px]"
//                   />
//                   <Text className="text-xs text-center text-typography-600">
//                     {item.iconText ?? ""}
//                   </Text>
//                 </Pressable>
//               );
//             }
//           )}
//         </HStack>
//       </Animated.View>
//     </View>
//   );
// };

export const StaticStickyFooter = ({ children }: { children: ReactNode }) => {
  return (
    <View className="fixed bottom-0 left-0 right-0 p-4">
      {children}
    </View>
  );
};

const Footer = (props: footerProps & { static?: boolean }) => {
  const { static: isStatic, ...restProps } = props;
  const windowDimensions = useWindowDimensions();
  const { height: windowHeight, width: windowWidth } = windowDimensions;

  // Determine if the footer should be static or floating
  const shouldRenderStatic = isStatic ?? (Platform.OS === 'web' || (!!Number.isNaN(windowWidth) && windowWidth > viewPort.width));

  return shouldRenderStatic ? (
    <StaticStickyFooter {...restProps}>
      {props?.contentChildren}
    </StaticStickyFooter>
  ) : (
    <FloatingFooter {...restProps}>
      {props?.contentChildren}
    </FloatingFooter>
  );
};

export default Footer;
