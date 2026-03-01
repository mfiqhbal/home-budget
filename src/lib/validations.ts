import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
  address: z.string().max(200).optional(),
  status: z.enum(["active", "completed", "on_hold"]).default("active"),
  currency: z.string().default("MYR"),
});

export const budgetItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  type: z.string().optional(),
  itemName: z.string().min(1, "Item name is required"),
  estimateAmount: z.string().default("0"),
  actualAmount: z.string().default("0"),
  priority: z.number().min(1).max(3).default(3),
  notes: z.string().optional(),
});

export const comparisonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  itemType: z.string().optional(),
  notes: z.string().optional(),
});

export const comparisonItemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  price: z.string().default("0"),
  quantity: z.number().min(1).default(1),
  transportCost: z.string().default("0"),
  totalCost: z.string().default("0"),
  link: z.string().url().optional().or(z.literal("")),
  supplierId: z.string().uuid().optional().or(z.literal("")).or(z.literal("none")),
  remark: z.string().optional(),
  isSelected: z.boolean().default(false),
});

export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  products: z.string().optional(),
  pricing: z.string().optional(),
  notes: z.string().optional(),
});

export const checklistItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "done"]).default("not_started"),
  notes: z.string().optional(),
});

export const wiringPlanSchema = z.object({
  location: z.string().min(1, "Location is required"),
  machine: z.string().optional(),
  plugLocation: z.string().optional(),
  plugType: z.string().optional(),
  wiringType: z.string().optional(),
  quantity: z.number().min(1).default(1),
  pricePerUnit: z.string().default("0"),
  installationPrice: z.string().default("0"),
  notes: z.string().optional(),
});

export const galleryImageSchema = z.object({
  room: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  coohomUrl: z.string().url().optional().or(z.literal("")),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type BudgetItemFormData = z.infer<typeof budgetItemSchema>;
export type ComparisonFormData = z.infer<typeof comparisonSchema>;
export type ComparisonItemFormData = z.infer<typeof comparisonItemSchema>;
export type SupplierFormData = z.infer<typeof supplierSchema>;
export type ChecklistItemFormData = z.infer<typeof checklistItemSchema>;
export type WiringPlanFormData = z.infer<typeof wiringPlanSchema>;
export type GalleryImageFormData = z.infer<typeof galleryImageSchema>;
