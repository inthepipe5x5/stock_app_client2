// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as SecureStore from "expo-secure-store";
// import { storeUserSession, restoreLocalSession } from "@/lib/supabase/session";
// import defaultSession from "@/constants/defaultSession";
// import { userPreferences } from "@/constants/userPreferences";
// import { ensureSessionNotExpired } from "@/utils/isExpired";

// jest.mock("@react-native-async-storage/async-storage");
// jest.mock("expo-secure-store");
// jest.mock("@/utils/isExpired", () => ({
//   ensureSessionNotExpired: jest.fn(),
// }));

// const mockSession = {...defaultSession, ...{
//   user: { id: "123", email: "test@example.com" },
//   token: "fakeToken",
//   refreshToken: "fakeRefreshToken",
// }}
// console.log({mockSession});

// describe("Session Storage Tests", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("stores user session in AsyncStorage or SecureStore", async () => {
//     SecureStore.setItemAsync.mockResolvedValueOnce(undefined);
//     AsyncStorage.setItem.mockResolvedValueOnce(undefined);

//     await storeUserSession(mockSession);

//     expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
//       expect.stringMatching(/_session$/),
//       JSON.stringify(mockSession)
//     );
//   });

//   test("restores session from AsyncStorage when available", async () => {
//     AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockSession));
//     ensureSessionNotExpired.mockReturnValue(true);

//     const session = await restoreLocalSession();

//     expect(AsyncStorage.getItem).toHaveBeenCalled();
//     expect(session.user).toEqual(mockSession.user);
//   });

//   test("restores default session if no valid session is found", async () => {
//     AsyncStorage.getItem.mockResolvedValueOnce(null);
//     ensureSessionNotExpired.mockReturnValue(false);

//     const session = await restoreLocalSession();

//     expect(session).toEqual(defaultSession);
//   });
// });
