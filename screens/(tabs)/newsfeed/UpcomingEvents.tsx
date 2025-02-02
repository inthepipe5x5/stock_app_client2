import {
  HStack,
  Box,
  VStack,
  Image,
  Text,
  Heading,
} from "@gluestack-ui/themed";
interface EventBlogData {
  bannerUri: string;
  title: string;
  description: string;
  publishedDate: string;
}
const UpcomingEvents = (eventData: EventBlogData[]) => {
  return eventData.map((item, index) => {
    return (
      <HStack
        className="p-3 items-center h-full border border-border-300 rounded-xl"
        space="lg"
        key={index}
      >
        <Box className="relative h-full w-40 rounded">
          <Image
            style={{ height: "100%", width: "100%" }}
            contentFit="cover"
            source={item.bannerUri}
            alt={item.title}
          />
        </Box>
        <VStack className="justify-between h-full" space="md">
          <Text className="text-sm">{item.publishedDate}</Text>
          <Heading size="md">{item.title}</Heading> 
          <Text className="line-clamp-2">{item.description}</Text>
        </VStack>
      </HStack>
    );
  });
};

export default UpcomingEvents;
export { EventBlogData };
