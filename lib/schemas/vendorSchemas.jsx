// ProductVendors table
// CREATE TABLE ProductVendors (
//     id UUID PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     description TEXT,
//     product_types TEXT[],
//     vendor_type TEXT[],
//     draft_status draft_status DEFAULT 'draft'
// );

import { z } from "zod";
import { DraftStatus, vendorScale } from "./enums";

/* This code snippet is defining a schema using Zod for validating the structure of a vendor object.
Here's a breakdown of what each property in the `vendorSchema` object represents: */
const vendorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255),
  description: z.string().optional(),
  productTypes: z.array(z.string()).optional(),
  vendorType: z.array(z.string()).optional(),
  addresses: z.array(z.string()).optional(),
  cities: z.array(z.string()).optional().default(["Toronto"]),
  region: z.array(z.string()).optional().default(["Ontario"]),
  country: z.array(z.string()).optional().default(["Canada"]),
  draftStatus: z.enum(DraftStatus).default("draft"),
  vendorScale: z.enum(vendorScale).default("domestic"),
});

const createVendorSchema = vendorSchema.omit;

const updateVendorSchema = vendorSchema.partial().omit({ id: true });

const deleteVendorSchema = z.object({
    id: vendorSchema.shape.id,
});

const getVendorSchema = z.object({
    id: vendorSchema.shape.id,
});

export {
  createVendorSchema,
  updateVendorSchema,
  deleteVendorSchema,
  getVendorSchema,
  vendorSchema,
};
