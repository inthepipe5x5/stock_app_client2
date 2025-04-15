import joinHouseHoldScreen from "@/app/(auth)/(signup)/join-household";

//  * @param {string} householdId - The ID of the household
//  * @param {string} userId - The ID of the user to check access for
//  * @param {string} createdBy - The ID of the user who created the resource
//  * @returns {boolean} - Returns true if the user has access, false otherwise

export default function JoinSearchedHouseholdScreen() {
    return joinHouseHoldScreen();
}