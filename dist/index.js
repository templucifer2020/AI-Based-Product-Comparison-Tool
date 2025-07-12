// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  products;
  currentId;
  constructor() {
    this.products = /* @__PURE__ */ new Map();
    this.currentId = 1;
  }
  async getProduct(id) {
    return this.products.get(id);
  }
  async getAllProducts() {
    return Array.from(this.products.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async createProduct(insertProduct) {
    const id = this.currentId++;
    const product = {
      id,
      name: insertProduct.name,
      brand: insertProduct.brand,
      category: insertProduct.category,
      ingredients: insertProduct.ingredients,
      usageInstructions: insertProduct.usageInstructions,
      warnings: insertProduct.warnings,
      expiryDate: insertProduct.expiryDate ?? null,
      timeLeft: insertProduct.timeLeft ?? null,
      recommendedFor: insertProduct.recommendedFor,
      notRecommendedFor: insertProduct.notRecommendedFor,
      userSentiment: insertProduct.userSentiment,
      imageUrl: insertProduct.imageUrl ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.products.set(id, product);
    return product;
  }
  async deleteProduct(id) {
    return this.products.delete(id);
  }
};
var storage = new MemStorage();

// server/services/gemini.ts
import { GoogleGenAI } from "@google/genai";

// shared/schema.ts
import { pgTable, text, serial, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  ingredients: json("ingredients").$type().notNull(),
  usageInstructions: text("usage_instructions").notNull(),
  warnings: text("warnings").notNull(),
  expiryDate: text("expiry_date"),
  timeLeft: text("time_left"),
  recommendedFor: text("recommended_for").notNull(),
  notRecommendedFor: text("not_recommended_for").notNull(),
  userSentiment: json("user_sentiment").$type().notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var productIngredientSchema = z.object({
  name: z.string(),
  function: z.string(),
  benefits: z.string(),
  sideEffects: z.string(),
  safetyRating: z.enum(["safe", "caution", "warning"]).default("safe")
});
var userSentimentSchema = z.object({
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  reviewSummary: z.string()
});
var productAnalysisSchema = z.object({
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
  userSentiment: userSentimentSchema
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});

// server/services/gemini.ts
import dotenv from "dotenv";
dotenv.config();
var apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.error("\u274C GEMINI_API_KEY not found in environment variables!");
  console.error("Please make sure you have:");
  console.error("1. Created a .env file in the project root");
  console.error("2. Added your API key: GEMINI_API_KEY=your_actual_api_key_here");
  console.error("3. Get your free API key from: https://ai.google.dev/");
}
var ai = new GoogleGenAI({
  apiKey: apiKey || ""
});
async function analyzeProductImage(imageBuffer, mimeType) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please check your .env file and ensure GEMINI_API_KEY is set with your API key from https://ai.google.dev/");
  }
  try {
    const currentDate = (/* @__PURE__ */ new Date()).toLocaleDateString();
    const systemPrompt = `You are an expert consumer product analyst with access to scientific and market knowledge.

A user has provided an image of a product package. Extract any text from the image and analyze it.

Based on the text and visual information, do the following:

1. Identify the product name, type, and brand.
2. List all ingredients and describe:
   - What each ingredient is
   - Its benefits
   - Known side effects or health risks
   - Safety rating (safe, caution, warning)
3. Extract:
   - Usage instructions
   - Health warnings
   - Expiry date (if any)
4. Estimate how much time is left to use it (assume today is ${currentDate})
5. Determine who should or shouldn't use this product
6. Simulate a realistic review summary

Return everything in the exact JSON format specified in the schema.`;
    const contents = [
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType
        }
      },
      systemPrompt
    ];
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            productName: { type: "string" },
            category: { type: "string" },
            brand: { type: "string" },
            keyIngredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  function: { type: "string" },
                  benefits: { type: "string" },
                  sideEffects: { type: "string" },
                  safetyRating: { type: "string", enum: ["safe", "caution", "warning"] }
                },
                required: ["name", "function", "benefits", "sideEffects", "safetyRating"]
              }
            },
            usageInstructions: { type: "string" },
            warnings: { type: "string" },
            expiryDate: { type: "string" },
            timeLeft: { type: "string" },
            recommendedFor: { type: "string" },
            notRecommendedFor: { type: "string" },
            userSentiment: {
              type: "object",
              properties: {
                pros: { type: "array", items: { type: "string" } },
                cons: { type: "array", items: { type: "string" } },
                reviewSummary: { type: "string" }
              },
              required: ["pros", "cons", "reviewSummary"]
            }
          },
          required: ["productName", "category", "brand", "keyIngredients", "usageInstructions", "warnings", "recommendedFor", "notRecommendedFor", "userSentiment"]
        }
      },
      contents
    });
    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini AI");
    }
    const parsedResult = JSON.parse(rawJson);
    return productAnalysisSchema.parse(parsedResult);
  } catch (error) {
    console.error("Error analyzing product image:", error);
    throw new Error(`Failed to analyze product image: ${error}`);
  }
}

// server/routes.ts
import multer from "multer";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
async function registerRoutes(app2) {
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getAllProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  app2.post("/api/products/analyze", upload.array("images", 10), async (req, res) => {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No images provided" });
      }
      const analysisResults = [];
      for (const file of files) {
        try {
          const analysisResult = await analyzeProductImage(file.buffer, file.mimetype);
          const validatedResult = productAnalysisSchema.parse(analysisResult);
          const productData = {
            name: validatedResult.productName,
            brand: validatedResult.brand,
            category: validatedResult.category,
            ingredients: validatedResult.keyIngredients,
            usageInstructions: validatedResult.usageInstructions,
            warnings: validatedResult.warnings,
            expiryDate: validatedResult.expiryDate || null,
            timeLeft: validatedResult.timeLeft || null,
            recommendedFor: validatedResult.recommendedFor,
            notRecommendedFor: validatedResult.notRecommendedFor,
            userSentiment: validatedResult.userSentiment,
            imageUrl: null
            // We're not storing images in this implementation
          };
          const validatedProduct = insertProductSchema.parse(productData);
          const savedProduct = await storage.createProduct(validatedProduct);
          analysisResults.push(savedProduct);
        } catch (error) {
          console.error("Error analyzing image:", error);
          analysisResults.push({
            error: "Failed to analyze image",
            filename: file.originalname
          });
        }
      }
      res.json({ results: analysisResults });
    } catch (error) {
      console.error("Error in product analysis:", error);
      res.status(500).json({ error: "Failed to analyze products" });
    }
  });
  app2.post("/api/products/compare", async (req, res) => {
    try {
      const { productIds } = req.body;
      if (!Array.isArray(productIds) || productIds.length < 2) {
        return res.status(400).json({ error: "At least 2 product IDs are required for comparison" });
      }
      const products2 = await Promise.all(
        productIds.map((id) => storage.getProduct(id))
      );
      const validProducts = products2.filter((p) => p !== void 0);
      if (validProducts.length < 2) {
        return res.status(400).json({ error: "At least 2 valid products are required for comparison" });
      }
      res.json({ products: validProducts });
    } catch (error) {
      console.error("Error comparing products:", error);
      res.status(500).json({ error: "Failed to compare products" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const success = await storage.deleteProduct(productId);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import dotenv2 from "dotenv";
dotenv2.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port
  }, () => {
    log(`serving on port ${port}`);
  });
})();
