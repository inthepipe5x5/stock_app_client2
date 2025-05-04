import { MMKV, Mode, Configuration } from 'react-native-mmkv';
import supabase from '@/lib/supabase/supabase';
import { appInfo } from '@/constants/appName';
import { hash } from '@/lib/OFF/OFFcredentials';
import normalizeBarcode from '@/utils/barcode';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { removeOldestQuery } from '@tanstack/react-query-persist-client';
import defaultUserPreferences from '@/constants/userPreferences';
import { Platform } from 'react-native';
import { userProfile } from '@/constants/defaultSession';

export const encryptionKey = process.env.EXPO_PUBLIC_ENCRYPTION_KEY ?? "secretKey"
export const keySeparator = process.env.EXPO_PUBLIC_KEY_SEPARATOR ?? "|_|";

console.log('mmkv key length', encryptionKey.length ?? 0);

export const defaultStoragePath = ['ios', 'android'].includes(Platform.OS) ? `${appInfo.slug}/storage/general` : undefined
export const defaultStorageId = `${appInfo.slug}${keySeparator}general_mmkvStorage`;


/* createStorage function
* @param {string} id - The `id` parameter is a string that represents the unique identifier for the MMKV storage instance.
 @default @variable defaultStorageId else 'mmkv.default'
*
* */
export const createStorage = (id: string = defaultStorageId,
    options: Omit<Partial<Configuration>, "id"> = {
        encryptionKey: encryptionKey,
        path: `/data/${appInfo.slug}`,
        mode: Mode['MULTI_PROCESS'],
    }) => {
    const mobile = ['ios', 'android'].includes(Platform.OS);
    const storageOptions = mobile ? { id, ...options } : { id }
    const storage = new MMKV(storageOptions);
    console.log({ mobile }, 'storage options', { storageOptions }, { storage });
    //set a default value for hydratedAt
    storage.set("hydratedAt", new Date().toISOString());
    return storage;
}
//#region general storage for the app
export const GeneralStorage = createStorage();


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
    //check if the userId is not null or undefined and is not 'anon' 
    if ([["ios", "android"].includes(Platform.OS), !!userId, userId !== 'anon'].every(Boolean)) {
        let user = !!userId && userId !== 'anon' ? userId : 'anon';
        //check if the userId is already hashed
        const hashedUserId = !preHashed ? await hash(user) : user;

        // const userStorage = new MMKV({
        //     id: `${appInfo.slug}${keySeparator}${hashedUserId}${keySeparator}mmkvStorage`,
        //     encryptionKey: Platform.OS === 'web' ? undefined : encryption,
        //     path: Platform.OS === 'web' ? undefined : `${appInfo.slug}/storage/${hashedUserId}`,
        //     mode: Mode['MULTI_PROCESS'],
        // });
        const userStorage = createStorage(
            `${appInfo.slug}${keySeparator}${hashedUserId}${keySeparator}mmkvStorage`, //id
        )

        return userStorage;
    }

    // return GeneralStorage;
    return createStorage();
};

// /**
//  * The function `getUserStorage` retrieves user storage information based on the provided userId.
//  * @param {string} userId - The `userId` parameter is a string that represents the unique identifier of
//  * the user for whom you want to retrieve the storage information.
//  * @returns The `getUserStorage` function returns an object with the following properties:
//  * - `userStorage`: The user storage object created for the specified `userId`.
//  * - `userStoragePath`: The path of the user storage, or `null` if not available.
//  * - `userStorageExists`: A boolean indicating whether the user storage exists or not.
//  */
// export const getUserStorage = async (userId: string) => {
//     if (!!!userId || userId === 'anon') {
//         throw new Error("userId is required to get user storage.");
//     }

//     const userStorage = await createUserStorage(userId, encryptionKey, true);
//     const userStoragePath = userStorage.getString("path") ?? null;
//     const userStorageExists = ['ios', 'android'].includes(Platform.OS) ? await FileSystem.getInfoAsync(userStoragePath ?? "", { size: true }) : false;
//     return {
//         userStorage,
//         userStoragePath,
//         userStorageExists,
//     };
// }

export interface mmkvCacheInterface {
    userId: string | null;
    storage: MMKV;
    encryption: string | null;
    storagePrefix: string;
    keySepChar: string;

    resourceKeys: {
        [key: string]: string;
    };
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    // getUserResources(resourceTypeKey: Extract<keyof mmkvCache['resourceKeys'], string>[] | null): any[] | null;
    // setUserResources(resourceData: { [resourceTypeKey in keyof mmkvCache['resourceKeys']]?: any }): void;
    // deleteUserResources(resourceTypeKey: Extract<keyof mmkvCache['resourceKeys'], string>[] | null): void;
    // updateStorage(unhashedNewUID: string): Promise<MMKV>;
    getKeys(): string[];
    resetStorage(): void;
    getCurrentUser(): Partial<userProfile> | null;
    flattenObject(obj: any, parent: string, res: any): any;
    clearStorage(): void;
    getScannedBarcodesByUserId(userId: string): string[] | null;
    parseScannedBarcodes(barcodes: string | string[]): string[];
    setScannedBarcodesByUserId(barcodes: string[]): void;
    // getUserStorage(userId: string): Promise<MMKV>;
    // getUserStoragePath(userId: string): Promise<string | null>;
}

//#region mmkvCache wrapper class for MMKV storage to be used as a cache for supabase client
export class mmkvCache implements mmkvCacheInterface {
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
        previousStorage?: MMKV
    ) {
        this.encryption = encryption ?? this.encryption;
        this.userId = userId ?? 'anon';
        this.storage = previousStorage ?? GeneralStorage;
    }

    // async init() {
    //     //get the userId from the storage if it is not set
    //     const { data: { session } } = await supabase.auth.getSession() || null;

    //     //set userId to the stored user id or 'anon' string if it is set to null or undefined
    //     this.userId = !!session?.user?.id ? session?.user?.id : 'anon';
    //     //call the updateStorage function to update the storage with the userId
    //     return this.updateStorage(this.userId as string);
    // }
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
    removeItem(key: string): void {
        if (this.storage.contains(key)) {
            this.storage.delete(key);
            console.warn(`Key ${key} not found in storage, but found without prefix padder. Deleted it.`);
        }
        const removeKey = this.padKey(key);
        if (this.storage.contains(removeKey)) {
            this.storage.delete(removeKey);
            console.log(`Key ${key} deleted from storage`);
        }
        console.error(`Key ${key} not found in storage`);
    }

    //resource specific functions for standardizing getting/setting resources

    // //get data for the user specific resource (as defined in @class mmkvCache.resourceKeys) from the storage
    // getUserResources(resourceTypeKey: Extract<keyof mmkvCache['resourceKeys'], string>[] | null = null) {
    //     let extractKeys;

    //     switch (true) {
    //         case Array.isArray(resourceTypeKey):
    //             extractKeys = resourceTypeKey.map((key) => {
    //                 return this.getItem(this.resourceKeys[key]);
    //             });
    //             break;
    //         case typeof resourceTypeKey === 'string':
    //             extractKeys = this.getItem(this.resourceKeys[resourceTypeKey]);
    //             break;
    //         default:
    //             return Object.values(this.resourceKeys).map((key) => {
    //                 return this.getItem(key);
    //             });
    //     }
    // }

    // //set data for the user specific resource (as defined in @class mmkvCache.resourceKeys) from the storage
    // setUserResources(resourceData: { [resourceTypeKey in keyof mmkvCache['resourceKeys']]?: any }) {

    //     if (Object.keys(resourceData).every((key => Object.values(this.resourceKeys).includes(key)))) {
    //         const errorMessage = (`Resource keys: ${{ keys: Object.keys(resourceData) }} do not match the storage keys`);
    //         console.error(errorMessage);
    //         throw new Error(errorMessage);
    //     }
    //     Object.entries(resourceData).forEach(([key, value]) => {
    //         this.setItem(this.resourceKeys[key as keyof mmkvCache['resourceKeys']], JSON.stringify(value));
    //     });
    //     console.log(`Storage updated for user ${this.userId} with resources:`, Object.keys(resourceData));

    // }

    // //get data for the user specific resource (as defined in @class mmkvCache.resourceKeys) from the storage
    // deleteUserResources(resourceTypeKey: Extract<keyof mmkvCache['resourceKeys'], string>[] | null = null) {
    //     let extractKeys;

    //     switch (true) {
    //         case Array.isArray(resourceTypeKey):
    //             extractKeys = resourceTypeKey.map((key) => {
    //                 return this.removeItem(this.resourceKeys[key]);
    //             });
    //             break;
    //         case typeof resourceTypeKey === 'string':
    //             extractKeys = this.removeItem(this.resourceKeys[resourceTypeKey]);
    //             break;
    //         default:
    //             return Object.values(this.resourceKeys).map((key) => {
    //                 return this.removeItem(key);
    //             });
    //     }
    // }

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
    getCurrentUser(): Partial<userProfile> | null {
        const user = this.getItem('user');
        return !!user && user !== 'anon' ? JSON.parse(user) as Partial<userProfile> : null;
    }
    //util function to flatten objects
    flattenObject = (obj: any, parent: string = '', res: any = {}) => {
        for (let key in obj) {
            let propName = parent ? parent + '.' + key : key;
            if (typeof obj[key] == 'object' && obj[key] !== null) {
                this.flattenObject(obj[key], propName, res);
            } else {
                res[propName] = obj[key];
            }
        }
        return res;
    };

    // -------------------------------------
    //update the hashed userId and storage if the userId is different from the current one
    //this is used to update the storage when the user logs in or out
    // async updateStorage(unhashedNewUID: string = "anon"): Promise<MMKV> {
    //     //do not update the storage if the userId is the same as the current one
    //     if (unhashedNewUID === this.userId) {
    //         console.log(`Storage already updated for user ${unhashedNewUID}`);
    //         return this.storage;
    //     }
    //     //get current user ID from storage
    //     let currentUser = this.getCurrentUser() ?? null;
    //     let instanceUserId = currentUser?.user_id ?? this.userId ?? "anon"

    //     //get all keys in storage 
    //     const keys = this.getKeys();
    //     //filter out keys related to previous user
    //     const outdatedKeys = (keys ?? []).filter((key) => {
    //         return key.includes(instanceUserId as string);
    //     })
    //     //remove the resources & keys related to the previous user
    //     const removal = [...outdatedKeys, ...Object.values(this.resourceKeys)]
    //         .map((key) => {
    //             //remove the key from storage
    //             console.log('outdated key:', key, 'updating storage for new uid', unhashedNewUID);
    //             this.removeItem(key)
    //         });
    //     console.log('removal of user keys performed on:', { removal });
    //     //handle the case where the user is anonymous or logged out
    //     if (!!!unhashedNewUID || unhashedNewUID === 'anon') {
    //         this.resetStorage();
    //         console.log(`Storage reset for anon user: ${unhashedNewUID}`);
    //         this.storage = createStorage();
    //     }

    //     //filter out keys related to previous user
    //     //check if the unhashedNewUID is different from the current one
    //     this.userId = unhashedNewUID;
    //     this.storage = await createUserStorage(
    //         unhashedNewUID,
    //         this.encryption as string,
    //         false
    //     );

    //     //update the user key in the storage
    //     this.setItem(this.resourceKeys.user, JSON.stringify(unhashedNewUID));


    //     console.log(`Storage updated for user ${unhashedNewUID}`);

    //     return this.storage;
    // }

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

        if (!!!this.userId || this.userId === 'anon') {
            throw new Error("userId is required to set scanned barcodes.");
        }
        if (!!!barcodes || barcodes.length === 0) {
            throw new Error("barcodes are required to set scanned barcodes.");
        }
        //parse barcodes to remove duplicates and normalize them
        const parsedBarcodes = this.parseScannedBarcodes(barcodes);

        const key = `${this.storagePrefix}${currentUser}${this.keySepChar}scannedBarcodes`;
        //check if barcodes are new or already in storage
        const storedBarcodes = currentUser ? this.getScannedBarcodesByUserId(currentUser as string) : null;
        const storedBarcodeCount = storedBarcodes?.length ?? 0;
        const newBarcodesCount = parsedBarcodes?.length ?? 0;
        console.log(`Storing ${newBarcodesCount} new barcodes for user ${currentUser} (${storedBarcodeCount} already stored)`);
        return this.storage.set(key, JSON.stringify([...new Set([...(storedBarcodes ?? []), ...parsedBarcodes])]));
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