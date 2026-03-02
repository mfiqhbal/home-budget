import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  status: text("status").default("active").notNull(),
  currency: text("currency").default("MYR").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const budgetItems = pgTable("budget_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").notNull(),
  category: text("category").notNull(),
  type: text("type"),
  itemName: text("item_name").notNull(),
  estimateAmount: numeric("estimate_amount", { precision: 12, scale: 2 }).default("0"),
  actualAmount: numeric("actual_amount", { precision: 12, scale: 2 }).default("0"),
  priority: integer("priority").default(3).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comparisons = pgTable("comparisons", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category"),
  itemType: text("item_type"),
  notes: text("notes"),
  budgetItemId: uuid("budget_item_id").references(() => budgetItems.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comparisonItems = pgTable("comparison_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  comparisonId: uuid("comparison_id")
    .references(() => comparisons.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").notNull(),
  productName: text("product_name").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).default("0"),
  quantity: integer("quantity").default(1),
  transportCost: numeric("transport_cost", { precision: 12, scale: 2 }).default("0"),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }).default("0"),
  link: text("link"),
  supplierId: uuid("supplier_id"),
  remark: text("remark"),
  isSelected: boolean("is_selected").default(false),
  linkImage: text("link_image"),
  linkTitle: text("link_title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  products: text("products"),
  pricing: text("pricing"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const checklistItems = pgTable("checklist_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  title: text("title").notNull(),
  dueDate: timestamp("due_date"),
  status: text("status").default("not_started").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const wiringPlans = pgTable("wiring_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").notNull(),
  location: text("location").notNull(),
  machine: text("machine"),
  plugLocation: text("plug_location"),
  plugType: text("plug_type"),
  wiringType: text("wiring_type"),
  quantity: integer("quantity").default(1),
  pricePerUnit: numeric("price_per_unit", { precision: 12, scale: 2 }).default("0"),
  installationPrice: numeric("installation_price", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const galleryImages = pgTable("gallery_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").notNull(),
  room: text("room"),
  title: text("title"),
  description: text("description"),
  coohomUrl: text("coohom_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const images = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  storagePath: text("storage_path").notNull(),
  publicUrl: text("public_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgetCategoryOrders = pgTable("budget_category_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").notNull(),
  category: text("category").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type NewBudgetItem = typeof budgetItems.$inferInsert;
export type Comparison = typeof comparisons.$inferSelect;
export type NewComparison = typeof comparisons.$inferInsert;
export type ComparisonItem = typeof comparisonItems.$inferSelect;
export type NewComparisonItem = typeof comparisonItems.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type NewChecklistItem = typeof checklistItems.$inferInsert;
export type WiringPlan = typeof wiringPlans.$inferSelect;
export type NewWiringPlan = typeof wiringPlans.$inferInsert;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;
export type ImageRecord = typeof images.$inferSelect;
export type NewImageRecord = typeof images.$inferInsert;
export type BudgetCategoryOrder = typeof budgetCategoryOrders.$inferSelect;
export type NewBudgetCategoryOrder = typeof budgetCategoryOrders.$inferInsert;
