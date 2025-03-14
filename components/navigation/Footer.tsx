import React, { useRef } from 'react';
import { Animated, ScrollView, View, Platform, Dimensions } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '../ui/button';



const StyledBox = (props: any) => {
  return (
    <ScrollView className="bg-zinc-400" {...(props?.scrollViewProps ? { ref: props.scrollViewProps } : {})}>
      <Box className="bg-slate-100 border-r-background-info p-16" {...props} />
    </ScrollView>
  );
}



export const AnimatedMobileFooterView = (props: any) => {

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
        <View style={{ height: 1200, padding: 20 }}>
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
        <StyledBox className="bg-gray-800 p-4">
          {props.footerChildren ? props.footerChildren : (
            <Button action="positive" variant="solid" className="bg-primary-500 animate-hover-highlight" onPress={props.footerButtonOnPress ?? (() => {
              console.log('Footer button pressed!');
            })} {...(props.footerButtonProps ?? {})}>
              <ButtonText className="text-white text-center">Sticky Footer</ButtonText>
            </Button>
          )}
        </StyledBox>
      </Animated.View>
    </View>
  );
};

export const StaticWebFooterView = (props: any) => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* Main Content */}
        <View style={{ height: 1200, padding: 20 }}>
          <Text className="text-lg">{props.titleText ?? "Scroll down to see the footer appear!"}</Text>
          {// Content Children
            props.contentChildren ? props.contentChildren : null}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#333',
          padding: 16,
        }}
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

const Footer = (props: any) => {
  // If Platform is web, render StaticWebFooterView
  if (Platform.OS === 'web') return <StaticWebFooterView {...props} />;

  // Else, render AnimatedMobileFooterView
  return <AnimatedMobileFooterView {...props} />;
};

export default Footer;
