import React, { useRef } from 'react';
import { Animated, ScrollView, View, Platform, Dimensions, useWindowDimensions } from 'react-native';
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
const StyledBox = (props: any) => {
  return (
    <ScrollView className="bg-zinc-400" {...(props?.scrollViewProps ? { ref: props.scrollViewProps } : {})}>
      <Box className="bg-slate-100 border-r-background-info p-16" {...props} />
    </ScrollView>
  );
}

type footerProps = {
  titleText?: string;
  footerButtonOnPress?: () => void;
  footerButtonProps?: any;
  contentChildren?: JSX.Element | JSX.Element[];
  footerChildren?: Icon[];
  footerAnimationProps?: any;
  translateY?: any;
}

export const AnimatedMobileFooterView = (props: footerProps) => {

  const scrollY = useRef(new Animated.Value(0)).current;
  const windowDimensions = useRef(Dimensions.get('window'));
  const { height: windowHeight, width: windowWidth } = windowDimensions.current;
  const translateY = scrollY.interpolate(props.translateY ?? {
    inputRange: [0, ((windowHeight * 0.3) + 100)], // Footer moves out of view when scrolling down //[triggerHeight, triggerHeight + 100],
    outputRange: [(windowHeight * 0.3 + 100), 0], // Footer moves into view when scrolling up //[0, 100],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Main Content */}
        <View style={{ height: 1200, paddingBottom: 0 }}>
          <Text className="text-lg">{props.titleText ?? "Scroll down to see the footer appear!"}</Text>
        </View>
      </Animated.ScrollView>

      {/* Footer */}
      <Animated.View
        style={props.footerAnimationProps ?? {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY }],
          backgroundColor: '#333',
          padding: 16,
        }}
      >
        {/* <StyledBox className="p-1">
          {props.footerChildren ? props.footerChildren : (
            <Button action="positive" variant="solid" className="animate-hover-highlight" onPress={props.footerButtonOnPress ?? (() => {
              console.log('Footer button pressed!');
            })} {...(props.footerButtonProps ?? {})}>
              <ButtonText className="text-white text-center">Sticky Footer</ButtonText>
            </Button>
          )}
        </StyledBox> */}
        <HStack
          className={cn(
            "bg-background-0 justify-between w-full absolute left-0 bottom-0 right-0 p-3 overflow-hidden items-center  border-t-border-300  md:hidden border-t",
            { "pb-5": Platform.OS === "ios" },
            { "pb-5": Platform.OS === "android" }
          )}
        >
          {(props?.footerContent ?? SideBarContentList).map(
            (
              item: Icons,
              index: React.Key | null | undefined
            ) => {
              return (
                <Pressable
                  className="px-0.5 flex-1 flex-col items-center"
                  key={index}
                  onPress={() => router.push("/news-feed/news-and-feed")}
                >
                  <Icon
                    as={item.iconName}
                    size="md"
                    className="h-[32px] w-[65px]"
                  />
                  <Text className="text-xs text-center text-typography-600">
                    {item.iconText ?? ""}
                  </Text>
                </Pressable>
              );
            }
          )}
        </HStack>
      </Animated.View>
    </View>
  );
};

export const StaticWebFooterView = (props: footerProps) => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* Main Content */}
        <View style={{ height: 1200, padding: 20 }}>
          <Text className="text-lg">{props.titleText ?? "Scroll down to see the footer appear!"}</Text>
          {// Content Children
            props.footerChildren ? props.footerChildren.map((icon, index) => (
              <Icon key={index} as={icon.iconName} size="md" className="h-[32px] w-full" />
            )) : null}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        // style={{
        //   position: 'fixed',
        //   bottom: 0,
        //   left: 0,
        //   right: 0,
        //   backgroundColor: '#333',
        //   padding: 16,
        // }}
        className="fixed bottom-0 left-0 right-0 p-safe-or-16"
      >
        <StyledBox className="bg-gray-800 p-4">
          {props.footerChildren ? props.footerChildren : (
            <Button action="positive" variant="solid" className="bg-primary-500 animate-hover-highlight" onPress={props.footerButtonOnPress ?? (() => {
              console.log('Footer button pressed!');
            })} {...(props.footerButtonProps ?? {})}>
              <ButtonText className="text-white text-center">Sticky Footer</ButtonText>
            </Button>
          )}
        </StyledBox>
      </View>
    </View>
  );
};

const Footer = (props: footerProps) => {
  const windowDimensions = useWindowDimensions();
  const { height: windowHeight, width: windowWidth } = windowDimensions;

  // If Platform is web or wider than viewPort.width, render StaticWebFooterView
  return (Platform.OS === 'web' || (!!Number.isNaN(windowWidth) && windowWidth > viewPort.width)) ?
    <StaticWebFooterView {...props} />
    // Else, render AnimatedMobileFooterView
    : <AnimatedMobileFooterView {...props} />;
};

export default Footer;
