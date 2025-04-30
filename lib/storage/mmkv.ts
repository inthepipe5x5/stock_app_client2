import { MMKV, Mode } from 'react-native-mmkv';
import supabase from '@/lib/supabase/supabase';
import { appInfo } from '@/constants/appName';
import { hash } from '@/lib/OFF/OFFcredentials';
import * as FileSystem from 'expo-file-system';
import normalizeBarcode from '@/utils/barcode';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { removeOldestQuery } from '@tanstack/react-query-persist-client';
import defaultUserPreferences from '@/constants/userPreferences';
import { Platform } from 'react-native';
export const encryptionKey = 'secret'//process.env.EXPO_PUBLIC_ENCRYPTION_KEY ?? "82sufeDRW"
export const keySeparator = process.env.EXPO_PUBLIC_KEY_SEPARATOR ?? "|_|";
console.log('mmkv key length', encryptionKey.length ?? 0);

export const GeneralStorage = new MMKV({
    id: `${appInfo.slug}_general_mmkvStorage`,
    encryptionKey: Platform.OS === 'web' ? undefined : encryptionKey,
    path: `${appInfo.slug}/storage/general`,
    mode: Mode['MULTI_PROCESS'],
})

/**
 * The function `createUserStorage` creates a user storage using MMKV with optional encryption and
 * pre-hashing options.
 * @param {string} userId - The `userId` parameter is a string that represents the unique identifier of
 * the user for whom the storage is being created.
 * @param {string} encryption - The `encryption` parameter in the `createUserStorage` function is a
 * string that represents the encryption key used for encrypting the user storage data. If a value is
 * not provided for this parameter, it defaults to `encryptionKey`.
 * @param {boolean} [preHashed=false] - The `preHashed` parameter in the `createUserStorage` function
 * is a boolean flag that indicates whether the `userId` has already been hashed before being passed to
 * the function. If `preHashed` is set to `true`, the function will use the `userId` directly without
 * hashing
 * @returns The `createUserStorage` function returns a new instance of the MMKV storage with the
 * specified configuration settings for the given `userId`.
 */
export const createUserStorage = async (
    userId: string | null | undefined = 'anon',
    encryption: string = encryptionKey,
    preHashed: boolean = false,
) => {

    // if (!!!userId) {
    //     throw new Error("userId is required to create user storage.");
    // }
    let user = !!userId && userId !== 'anon' ? userId : 'anon';
    //check if the userId is already hashed
    const hashedUserId = !preHashed ? await hash(user) : user;

    const userStorage = new MMKV({
        id: `${appInfo.slug}${keySeparator}${hashedUserId}${keySeparator}mmkvStorage`,
        encryptionKey: encryption,
        path: `${appInfo.slug}/storage/${hashedUserId}`,
        mode: Mode['MULTI_PROCESS'],
    });

    return userStorage;
};

/**
 * The function `getUserStorage` retrieves user storage information based on the provided userId.
 * @param {string} userId - The `userId` parameter is a string that represents the unique identifier of
 * the user for whom you want to retrieve the storage information.
 * @returns The `getUserStorage` function returns an object with the following properties:
 * - `userStorage`: The user storage object created for the specified `userId`.
 * - `userStoragePath`: The path of the user storage, or `null` if not available.
 * - `userStorageExists`: A boolean indicating whether the user storage exists or not.
 */
export const getUserStorage = async (userId: string) => {
    if (!!!userId) {
        throw new Error("userId is required to get user storage.");
    }

    const userStorage = await createUserStorage(userId, encryptionKey, true);
    const userStoragePath = userStorage.getString("path") ?? null;
    const userStorageExists = await FileSystem.getInfoAsync(userStoragePath ?? "", { size: true });

    return {
        userStorage,
        userStoragePath,
        userStorageExists,
    };
}

//#region mmkvCache wrapper class for MMKV storage to be used as a cache for supabase client
export class mmkvCache {
    userId: string | null = 'anon';
    storage: MMKV = GeneralStorage;
    encryption: string | null = encryptionKey;
    storagePrefix: string = `${appInfo.slug}${keySeparator}`;
    keySepChar: string = keySeparator;

    resourceKeys: { //get the keys for the resources in the storage
        [key: string]: string;
    } = {
            product: 'product',
            households: 'households',
            inventories: 'inventories',
            suppliers: 'suppliers',
            tasks: 'tasks',
            barcode: 'scannedBarcodes',
            user: 'user',
        }

    constructor(
        userId?: string,
        encryption?: string,
        previousStorage?: MMKV | null
    ) {
        this.encryption = encryption ?? this.encryption;
        this.userId = userId ?? 'anon';
        this.storage = previousStorage ?? GeneralStorage;
    }

    async init() {
        //get the userId from the storage if it is not set
        const { data: { session } } = await supabase.auth.getSession() || null;

        //set userId to the stored user id or 'anon' string if it is set to null or undefined
        this.userId = !!session?.user?.id ? session?.user?.id : 'anon';
        //call the updateStorage function to update the storage with the userId
        return this.updateStorage(this.userId as string);
    }
    //util function to pad the key with the prefix
    padKey(key: string) {
        if (key.includes(this.storagePrefix)) {
            return key;
        }
        return `${this.storagePrefix}${key}`;
    }

    /* ------------------------------------- 
    /* these methods are added so that the Supabase client can access MMKV as cache
    */

    getItem(key: string) {
        const getKey = this.padKey(key);
        const storedVal = this.storage.getString(getKey);
        return storedVal ? JSON.parse(storedVal) : null;
    }

    setItem(key: string, value: string) {
        const setKey = this.padKey(key);
        return this.storage.set(setKey, value);
    }
    removeItem(key: string): boolean {
        if (this.storage.contains(key)) {
            this.storage.delete(key);
            console.warn(`Key ${key} not found in storage, but found without prefix padder. Deleted it.`);
            return true;
        }
        const removeKey = this.padKey(key);
        if (this.storage.contains(removeKey)) {
            this.storage.delete(removeKey);
            console.log(`Key ${key} deleted from storage`);
            return true;
        }
        console.error(`Key ${key} not found in storage`);
        return false;
    }

    //resource specific functions for standardizing getting/setting resources

    //get data for the user specific resource (as defined in @class mmkvCache.resourceKeys) from the storage
    getUserResources(resourceTypeKey: Extract<keyof mmkvCache['resourceKeys'], string>[] | null = null) {
        let extractKeys;

        switch (true) {
            case Array.isArray(resourceTypeKey):
                extractKeys = resourceTypeKey.map((key) => {
                    return this.getItem(this.resourceKeys[key]);
                });
                break;
            case typeof resourceTypeKey === 'string':
                extractKeys = this.getItem(this.resourceKeys[resourceTypeKey]);
                break;
            default:
                return Object.values(this.resourceKeys).map((key) => {
                    return this.getItem(key);
                });
        }
    }

    //set data for the user specific resource (as defined in @class mmkvCache.resourceKeys) from the storage
    setUserResources(resourceData: { [resourceTypeKey in keyof mmkvCache['resourceKeys']]?: any }) {

        if (Object.keys(resourceData).every((key => Object.values(this.resourceKeys).includes(key)))) {
            const errorMessage = (`Resource keys: ${{ keys: Object.keys(resourceData) }} do not match the storage keys`);
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
        Object.entries(resourceData).forEach(([key, value]) => {
            this.setItem(this.resourceKeys[key as keyof mmkvCache['resourceKeys']], JSON.stringify(value));
        });
        console.log(`Storage updated for user ${this.userId} with resources:`, Object.keys(resourceData));

    }

    //get data for the user specific resource (as defined in @class mmkvCache.resourceKeys) from the storage
    deleteUserResources(resourceTypeKey: Extract<keyof mmkvCache['resourceKeys'], string>[] | null = null) {
        let extractKeys;

        switch (true) {
            case Array.isArray(resourceTypeKey):
                extractKeys = resourceTypeKey.map((key) => {
                    return this.removeItem(this.resourceKeys[key]);
                });
                break;
            case typeof resourceTypeKey === 'string':
                extractKeys = this.removeItem(this.resourceKeys[resourceTypeKey]);
                break;
            default:
                return Object.values(this.resourceKeys).map((key) => {
                    return this.removeItem(key);
                });
        }
    }

    //get all keys in the storage
    getKeys() {
        const keys = this.storage.getAllKeys();
        return (keys ?? []).map((key) => {
            if (key.includes(this.storagePrefix)) {
                return key.replace(this.storagePrefix, '');
            }
            return key;
        });
    }
    //reset the storage to the default values
    resetStorage() {
        if (!!!this.storage)
            return this.storage = new MMKV({
                id: `${appInfo.slug}_general_mmkvStorage`,
                encryptionKey: this.encryption ?? encryptionKey as string,
            });

        //clear storage
        this.storage.clearAll();
        this.setItem(this.resourceKeys.user, JSON.stringify(this.userId));
        //reset user preferences to default
        this.setItem('preferences', JSON.stringify(defaultUserPreferences));
        this.setItem('theme', JSON.stringify(defaultUserPreferences.theme));
        //reset all permissions to false
        for (const key in Object.keys(defaultUserPreferences).filter((key: string) => key.includes('permissions'))) {
            this.setItem(key, JSON.stringify(false));
        }
    }

    //store the current user ID in the storage
    getCurrentUser(): string | null {
        const user = this.getItem('user');
        return user || user === 'anon' ? JSON.parse(user) : null;
    }
    // -------------------------------------
    //update the hashed userId and storage if the userId is different from the current one
    //this is used to update the storage when the user logs in or out
    async updateStorage(unhashedNewUID: string = "anon"): Promise<MMKV> {
        //do not update the storage if the userId is the same as the current one
        if (unhashedNewUID === this.userId) {
            console.log(`Storage already updated for user ${unhashedNewUID}`);
            return this.storage;
        }
        //get current user ID from storage
        let currentUser = this.getCurrentUser() ?? "anon";
        let instanceUserId = this.userId ?? "anon"

        //get all keys in storage 
        const keys = this.getKeys();
        //filter out keys related to previous user
        const outdatedKeys = (keys ?? []).filter((key) => {
            return key.includes(instanceUserId as string);
        })
        //remove the resources & keys related to the previous user
        const removal = [...outdatedKeys, ...Object.values(this.resourceKeys)]
            .map((key) => {
                //remove the key from storage
                console.log('outdated key:', key, 'updating storage for new uid', unhashedNewUID);
                this.removeItem(key)
            });
        console.log('removal of user keys performed on:', { removal });
        //handle the case where the user is anonymous or logged out
        if (unhashedNewUID === 'anon') {
            this.resetStorage();
            console.log(`Storage reset for anon user: ${unhashedNewUID}`);
            return this.storage ?? new mmkvCache();
        }

        //filter out keys related to previous user
        //check if the unhashedNewUID is different from the current one
        this.userId = unhashedNewUID;
        this.storage = await createUserStorage(
            unhashedNewUID,
            this.encryption as string,
            false
        );

        //update the user key in the storage
        this.setItem(this.resourceKeys.user, JSON.stringify(unhashedNewUID));


        console.log(`Storage updated for user ${unhashedNewUID}`);

        return this.storage;
    }

    async clearStorage() {
        this.storage.clearAll();
        if (this.userId) {
            console.log(`Storage cleared for user ${this.userId}`);
        } else {
            console.log(`Storage cleared for general storage`);
        }
    }
    /** ------------------------------------------------------------------------------------
     *  #region Barcode storage methods
     *  These methods are used to store and retrieve barcodes for a user in the storage.
     * -------------------------------------------------------------------------------------
     */

    // Function to retrieve all barcodes for a user
    getScannedBarcodesByUserId(userId: string): string[] | null {
        const key = `${this.storagePrefix}${userId}${this.keySepChar}scannedBarcodes`;
        const storedBarcodes = this.storage.getString(key)
            ? JSON.parse(this.storage.getString(key) as string)
            : null;
        return storedBarcodes.includes(',') ? storedBarcodes.split(',') : storedBarcodes;
    }

    //function to parse barcodes
    parseScannedBarcodes(barcodes: string | string[]): string[] {
        if (!!!barcodes) {
            throw new Error("barcodes are required to parse barcodes.");
        }
        let parsedBarcodes: string[] = [];
        switch (true) {
            case typeof barcodes === 'string':
                parsedBarcodes = barcodes.split(',').map((barcode) => normalizeBarcode(barcode.trim()));
                break;
            case Array.isArray(barcodes):
                parsedBarcodes = barcodes.map((barcode) => normalizeBarcode(barcode.trim()));
                break;
            default:
                throw new Error("barcodes must be a string or an array of strings.");
        }
        // remove duplicates by converting to a Set and back to an array
        return [...new Set(parsedBarcodes)];
    }
    // Function to store barcodes for a user
    setScannedBarcodesByUserId(barcodes: string[]) {
        const currentUser = this.getCurrentUser();

        if (!!!currentUser || currentUser === 'anon') {
            throw new Error("userId is required to set scanned barcodes.");
        }
        if (!!!barcodes || barcodes.length === 0) {
            throw new Error("barcodes are required to set scanned barcodes.");
        }
        //parse barcodes to remove duplicates and normalize them
        const parsedBarcodes = this.parseScannedBarcodes(barcodes);


        const key = `${this.storagePrefix}${currentUser}${this.keySepChar}scannedBarcodes`;
        //check if barcodes are new or already in storage
        const storedBarcodes = this.getScannedBarcodesByUserId(currentUser);
        const storedBarcodeCount = storedBarcodes?.length ?? 0;
        const newBarcodesCount = barcodes?.length ?? 0;

        if (storedBarcodes && storedBarcodeCount !== newBarcodesCount) {
            barcodes = [...new Set([...storedBarcodes, ...barcodes])];
        }
        return this.storage.set(key, JSON.stringify(barcodes));
    }



}


/* for supabase auth storage cache 
@ Returns a new instance of the @class mmkvCache class with the default encryption key and no userId.
@disclaimer DO NOT USE THIS FOR USER SPECIFIC STORAGE
*/
export const GeneralCache = new mmkvCache();
export type GeneralCacheType = typeof GeneralCache;

//#region persister client for tanstack query to integrate with mmkv
export const mmkvGeneralPersister = createSyncStoragePersister({
    storage: GeneralCache,
    key: `${appInfo.slug}${keySeparator}queries`,
    retry: removeOldestQuery
    // retry: 1,
})