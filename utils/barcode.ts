/**
 * Normalizes barcodes according to Open Food Facts documentation.
 * {@link https://openfoodfacts.github.io/openfoodfacts-server/api/ref-barcode-normalization/}
 * @param barcode - The barcode to normalize.
 * @returns The normalized barcode.
 */
const normalizeBarcode = (barcode: string): string => {
    // Remove leading zeros
    let normalizedBarcode = barcode.replace(/^0+/, '');

    // Normalize based on the length of the barcode
    if (normalizedBarcode.length <= 7) {
        // Pad with leading zeros to make it 8 digits
        normalizedBarcode = normalizedBarcode.padStart(8, '0');
    } else if (normalizedBarcode.length >= 9 && normalizedBarcode.length <= 12) {
        // Pad with leading zeros to make it 13 digits
        normalizedBarcode = normalizedBarcode.padStart(13, '0');
    }

    return normalizedBarcode;
};

export default normalizeBarcode;