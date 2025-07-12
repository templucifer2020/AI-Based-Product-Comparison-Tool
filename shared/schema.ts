import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  ingredients: json("ingredients").$type<ProductIngredient[]>().notNull(),
  usageInstructions: text("usage_instructions").notNull(),
  warnings: text("warnings").notNull(),
  expiryDate: text("expiry_date"),
  timeLeft: text("time_left"),
  recommendedFor: text("recommended_for").notNull(),
  notRecommendedFor: text("not_recommended_for").notNull(),
  userSentiment: json("user_sentiment").$type<UserSentiment>().notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productIngredientSchema = z.object({
  name: z.string(),
  function: z.string(),
  benefits: z.string(),
  sideEffects: z.string(),
  safetyRating: z.enum(['safe', 'caution', 'warning']).default('safe'),
});

export const userSentimentSchema = z.object({
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  reviewSummary: z.string(),
});

export const productAnalysisSchema = z.object({
  productName: z.string(),
  category: z.string(),
  brand: z.string(),
  keyIngredients: z.array(productIngredientSchema),
  usageInstructions: z.string(),
  warnings: z.string(),
  expiryDate: z.string().optional(),
  timeLeft: z.string().optional(),
  recommendedFor: z.string(),
  notRecommendedFor: z.string(),
  userSentiment: userSentimentSchema,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductIngredient = z.infer<typeof productIngredientSchema>;
export type UserSentiment = z.infer<typeof userSentimentSchema>;
export type ProductAnalysis = z.infer<typeof productAnalysisSchema>;
