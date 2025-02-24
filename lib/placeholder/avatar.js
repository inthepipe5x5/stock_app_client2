import getRandomHexColor from "@/utils/getRandomHexColor";

const PLACEHOLDER_AVATAR_API = "https://ui-avatars.com/api/";

const fakeUserAvatar = ({ name, size, avatarBgColor, fontColor = "black" }) => {
  const background = avatarBgColor || getRandomHexColor();
  //change font color if it's the same as the background
  const textFontColor = background === fontColor ? getRandomHexColor() : fontColor;
  let queryParams = [];

  if (name) queryParams.push(`name=${name}`);
  if (size) queryParams.push(`size=${size}`);
  if (background) queryParams.push(`background=${background}`);
  if (textFontColor) queryParams.push(`color=${textFontColor}`);

  return queryParams.length === 0
    ? PLACEHOLDER_AVATAR_API
    : `${PLACEHOLDER_AVATAR_API}?${queryParams.join("&")}`;
};

const defaultAvatar = fakeUserAvatar({
  // default avatar
  name: "John Doe",
  size: 100,
  background: "transparent",
  fontColor: "black",
});

export { fakeUserAvatar, defaultAvatar };
