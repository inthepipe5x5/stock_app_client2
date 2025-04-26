import 'react-native-get-random-values'; // Ensure polyfill is applied early
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeneralStorage, getUserStorage } from '@/lib/storage/mmkv';
import * as SecureStore from 'expo-secure-store';
import aesjs, { ByteSource } from 'aes-js';

/**
 * LargeSecureStore stores large data encrypted in AsyncStorage, 
 * while a single 256-bit AES key is kept securely in SecureStore.
 * TODO: CHANGE THIS TO USE MMKV INSTEAD OF ASYNCSTORAGE  
 */
class LargeSecureStore {
  private globalKeyAlias = process.env.EXPO_PUBLIC_SECRET_KEY as string;
  private isInitialized = false;
  private encryptionKey: Uint8Array | null = null;
  private generalStorage = GeneralStorage; // Placeholder for general storage
  private userStorage: any = null; // Placeholder for user-specific storage
  private userStoragePath: string | null = null;

  constructor () {
    // Initialize the global key and user storage
    this.initKey().catch((error) => {
      console.error('Error initializing LargeSecureStore:', error);
    });
  }
  /**
   * Initialize the global encryption key. If none is found in SecureStore,
   * generate a new 256-bit random key and store it.
   */
  private async initKey() {
    if (this.isInitialized) return;

    let encryptionKeyHex = await SecureStore.getItemAsync(this.globalKeyAlias);
    if (!encryptionKeyHex) {
      // Generate a 256-bit (32 bytes) random key
      const randomKey = crypto.getRandomValues(new Uint8Array(32));
      encryptionKeyHex = aesjs.utils.hex.fromBytes(randomKey);

      // Store hex-encoded key in SecureStore
      if (encryptionKeyHex) {
        console.log('Generated new encryption key:', encryptionKeyHex);
        await SecureStore.setItemAsync(this.globalKeyAlias, encryptionKeyHex);
      }
    }
    // Convert hex string back to bytes for actual encryption usage
    this.encryptionKey = aesjs.utils.hex.toBytes(encryptionKeyHex);
    this.isInitialized = true;
  }

  // Util function to ensure the global key is loaded
  private async checkInit() {
    await this.initKey();
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    return;
  }

  /**
   * Encrypts the provided `value` using AES-256 in CBC mode with a random IV.
   * The IV and ciphertext are stored in AsyncStorage as JSON.
   */
  private async _encrypt(itemKey: string, value: string): Promise<string> {
    // Ensure the global key is loaded
    await this.checkInit();

    // 1. Generate a random 16-byte IV
    const ivBytes = crypto.getRandomValues(new Uint8Array(16));

    // 2. Convert plaintext to bytes
    const valueBytes = aesjs.utils.utf8.toBytes(value);

    // 3. Encrypt using AES-CBC
    const aesCbc = new aesjs.ModeOfOperation.cbc(this.encryptionKey as ByteSource, ivBytes);
    // For CBC encryption, we must pad the plaintext
    const paddedValueBytes = aesjs.padding.pkcs7.pad(valueBytes);
    const encryptedBytes = aesCbc.encrypt(paddedValueBytes);

    // 4. Convert to hex strings
    const ivHex = aesjs.utils.hex.fromBytes(ivBytes);
    const ciphertextHex = aesjs.utils.hex.fromBytes(encryptedBytes);

    // 5. Store as JSON with structure { iv, ciphertext }
    // We only store these in AsyncStorage. The key is in SecureStore
    const storedString = JSON.stringify({ iv: ivHex, ciphertext: ciphertextHex });
    return storedString;
  }

  /**
   * Decrypts the value from AsyncStorage using the global AES key stored in SecureStore.
   */
  private async _decrypt(itemKey: string, storedValue: string): Promise<string | null> {
    // Ensure the global key is loaded
    await this.initKey();
    if (!this.encryptionKey) throw new Error('Encryption key not initialized');

    // 1. Parse JSON to extract IV and ciphertext
    let ivHex: string, ciphertextHex: string;
    try {
      const parsed = JSON.parse(storedValue);
      ivHex = parsed.iv;
      ciphertextHex = parsed.ciphertext;
    } catch {
      return null; // or throw error
    }

    const ivBytes = aesjs.utils.hex.toBytes(ivHex);
    const encryptedBytes = aesjs.utils.hex.toBytes(ciphertextHex);

    // 2. Decrypt using AES-CBC
    const aesCbc = new aesjs.ModeOfOperation.cbc(this.encryptionKey, ivBytes);
    const decryptedBytes = aesCbc.decrypt(encryptedBytes);

    // 3. Unpad the plaintext
    const unpadded = aesjs.padding.pkcs7.strip(decryptedBytes);

    // 4. Convert back to UTF-8
    return aesjs.utils.utf8.fromBytes(unpadded);
  }

  /**
   * Returns the decrypted value from AsyncStorage, or null if not found.
   */
  async getItem(itemKey: string): Promise<string | null> {
    const encryptedString = await AsyncStorage.getItem(itemKey);
    if (!encryptedString) return null;

    return await this._decrypt(itemKey, encryptedString);
  }

  /**
   * Removes both the encrypted entry from AsyncStorage and 
   * DOES NOT remove the global key from SecureStore. 
   * If you want to remove the entire key, do so carefully.
   */
  async removeItem(itemKey: string): Promise<void> {
    await AsyncStorage.removeItem(itemKey);
    // The global encryption key is shared, so we typically don't remove it from SecureStore here
    // If you want item-specific keys, you'd remove that from SecureStore as well
  }

  /**
   * Encrypts and stores the value in AsyncStorage.
   */
  async setItem(itemKey: string, value: string): Promise<void> {
    const encrypted = await this._encrypt(itemKey, value);
    await AsyncStorage.setItem(itemKey, encrypted);
  }
}

export default new LargeSecureStore();
