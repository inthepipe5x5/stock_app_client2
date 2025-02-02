import {
  HStack,
  Box,
  VStack,
  Image,
  Text,
  Heading,
} from "@gluestack-ui/themed";
interface BlogData {
  bannerUri: string;
  title: string;
  description: string;
  publishedDate: string;
}

const BlogCards = (BLOGS_DATA: BlogData[]) => {
  return BLOGS_DATA.map((item, index) => {
    return (
      <VStack className="rounded-xl border border-border-300 p-5" key={index}>
        <Box className="w-full h-64 rounded">
          <Image
            style={{ height: "100%", width: "100%" }}
            source={item.bannerUri}
            alt={item.bannerUri}
            contentFit="cover"
          />
        </Box>
        <VStack className="mt-4" space="md">
          <Text className="text-sm">{item.publishedDate}</Text>
          <Heading size="md">{item.title}</Heading>
          <Text className="line-clamp-2">{item.description}</Text>
        </VStack>
      </VStack>
    );
  });
};

export default BlogCards;
export { BlogData };