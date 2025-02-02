import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuSeparator,
} from "@/components/ui/menu";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonIcon } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { useUserSession } from "@/contexts/userSessionProvider";
import { MenuIcon, CircleUserRound } from "lucide-react-native";

const UserMenu = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { state: session, signOut } = useUserSession();

  return (
    <Menu
      offset={5}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={({ ...triggerProps }) => {
        return (
          <Button {...triggerProps} size="sm">
            <ButtonIcon as={MenuIcon} />
          </Button>
        );
      }}
    >
      <MenuItem
        key="Profile"
        textValue="Profile"
        className="p-2 justify-between"
      >
        <MenuItemLabel size="sm">Profile</MenuItemLabel>
        <Badge action="success" className="rounded-full">
          <BadgeIcon as={CircleUserRound} />
        </Badge>
      </MenuItem>
      <MenuItem
        key="Settings"
        textValue="Settings"
        className="p-2"
        onPress={() => router.push("/(profile)/settings")}
      >
        <MenuItemLabel size="sm">Settings</MenuItemLabel>
      </MenuItem>
      <MenuSeparator />
      {session && session.user ? (
        <MenuItem
          key="Logout"
          textValue="Logout"
          className="p-2"
          onPress={() => {
            signOut();
            router.push("/(auth)/signin");
          }}
        >
          <MenuItemLabel size="sm">Logout</MenuItemLabel>
        </MenuItem>
      ) : (
        <>
          <MenuItem
            key="Sign In"
            textValue="Sign In"
            className="p-2"
            onPress={() => {
              router.push("/(auth)/signin");
            }}
          >
            <MenuItemLabel size="sm">Sign In</MenuItemLabel>
          </MenuItem>
          <MenuItem
            key="Sign Up"
            textValue="Sign Up"
            className="p-2"
            onPress={() => {
              router.push("/(auth)/signup");
            }}
          >
            <MenuItemLabel size="sm">Sign Up</MenuItemLabel>
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export default UserMenu;
