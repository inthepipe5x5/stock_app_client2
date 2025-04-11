/**
 * @description: This file contains the Supabase bucket functions for uploading and deleting files.
 * It includes functions for uploading images, deleting images, and getting the URL of an image.
 */

import supabase from "@/lib/supabase/supabase"
import { formatDatetimeObject } from "@/utils/date";



interface UploadToSupabaseParams {
    blobURI: {
        blob: string;
        fileExtension: string;
        uri: string
    };
    bucketName: string;
    countryCode?: string;
}

export const uploadToSupabase = async (
    blobURI: { blob: string; fileExtension: string; uri: string },
    bucketName: string,
    fileName?: string,
    fileExtension?: string,
    countryCode: string = 'ca'
): Promise<string | null> => {
    try {
        // Destructure the blobURI object
        const { blob } = blobURI;

        const generatedFileName: string = fileName ?? `${formatDatetimeObject(new Date(), countryCode)}.${fileExtension ?? blobURI.fileExtension ?? "jpeg"}`; // Generate a unique filename

        const { data, error }: { data: any; error: Error | null } = await supabase.storage.from(bucketName).upload(generatedFileName, blob);

        if (error) throw error;
        console.log('Upload successful:', data);
        return data
    } catch (error) {
        console.error('Upload failed:', error);
        return null;
    }
};

export const uploadMultiplePhotosToSupabase = async (
    blobURIs: { blob: string; fileExtension: string; uri: string }[],
    bucketName: string,
    countryCode: string = 'ca'
): Promise<string[] | null> => {
    try {
        const uploadPromises = blobURIs.map(async (blobURI) => {
            const { blob } = blobURI;
            const generatedFileName: string = `${formatDatetimeObject(new Date(), countryCode)}.${blobURI.fileExtension ?? "jpeg"}`; // Generate a unique filename

            const { data, error }: { data: any; error: Error | null } = await supabase.storage.from(bucketName).upload(generatedFileName, blob);

            if (error) throw error;
            console.log('Upload successful:', data);
            return data
        });

        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error('Upload failed:', error);
        return null;
    }
}
