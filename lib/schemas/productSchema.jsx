import { z } from "zod";
import { DraftStatus } from "./lib/enums";
/*
-- ProductItems table
CREATE TABLE ProductItems (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    inventory_id UUID REFERENCES ProductInventories (id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES ProductVendors (id) ON DELETE SET NULL,
    auto_replenish BOOLEAN DEFAULT FALSE,
    min_quantity INTEGER,
    max_quantity INTEGER,
    current_quantity INTEGER NOT NULL,
    unit VARCHAR(50),
    barcode VARCHAR(255),
    qr_code VARCHAR(255),
    last_scanned TIMESTAMP WITH TIME ZONE,
    scan_history JSONB,
    expiration_date DATE,
    updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    draft_status draft_status DEFAULT 'draft'
);
*/

/**
 * Product schema validation
 */
const productSchema = z.object({
  // Identifiers
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),

  // Relationships
  inventoryId: z.string().uuid(),
  vendorId: z.string().uuid().nullable(),

  // Fields
  autoReplenish: z.boolean().default(false),
  minQuantity: z.number().int().nullable(),
  maxQuantity: z.number().int().nullable(),
  currentQuantity: z.number().int().nonnegative(),
  unit: z.string().max(50).optional(),
  barcode: z.string().max(255).optional(),
  qrCode: z.string().max(255).optional(),

  // Metadata
  lastScanned: z.string().datetime().nullable(),
  scanHistory: z.record(z.unknown()).optional(),
  expirationDate: z.string().datetime().optional(),
  updatedDt: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  draftStatus: z.enum(DraftStatus).default("draft"),
});

/**
 * Schema for creating a product
 */
const createProductSchema = productSchema
  .omit({
    id: true,
    updatedDt: true,
  })
  .partial({
    inventoryId: true,
    vendorId: true,
    minQuantity: true,
    maxQuantity: true,
    unit: true,
    barcode: true,
    qrCode: true,
    lastScanned: true,
    scanHistory: true,
    expirationDate: true,
    draftStatus: true,
  });

/**
 * Schema for updating a product
 */
const updateProductSchema = productSchema.partial();

/**
 * Schema for deleting a product
 */
const deleteProductSchema = z.object({
  id: z.string().uuid(),
});

export {
  productSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
};
