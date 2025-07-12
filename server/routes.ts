import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeProductImage } from "./services/gemini";
import multer from "multer";
import { insertProductSchema, productAnalysisSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
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

  // Analyze product images
  app.post("/api/products/analyze", upload.array('images', 10), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No images provided" });
      }

      const analysisResults = [];

      for (const file of files) {
        try {
          const analysisResult = await analyzeProductImage(file.buffer, file.mimetype);
          
          // Validate the analysis result
          const validatedResult = productAnalysisSchema.parse(analysisResult);
          
          // Convert to our product format
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
            imageUrl: null, // We're not storing images in this implementation
          };

          // Validate against insert schema
          const validatedProduct = insertProductSchema.parse(productData);
          
          // Store the product
          const savedProduct = await storage.createProduct(validatedProduct);
          analysisResults.push(savedProduct);
        } catch (error) {
          console.error("Error analyzing image:", error);
          analysisResults.push({
            error: "Failed to analyze image",
            filename: file.originalname,
          });
        }
      }

      res.json({ results: analysisResults });
    } catch (error) {
      console.error("Error in product analysis:", error);
      res.status(500).json({ error: "Failed to analyze products" });
    }
  });

  // Compare products
  app.post("/api/products/compare", async (req, res) => {
    try {
      const { productIds } = req.body;
      
      if (!Array.isArray(productIds) || productIds.length < 2) {
        return res.status(400).json({ error: "At least 2 product IDs are required for comparison" });
      }

      const products = await Promise.all(
        productIds.map(id => storage.getProduct(id))
      );

      const validProducts = products.filter(p => p !== undefined);
      
      if (validProducts.length < 2) {
        return res.status(400).json({ error: "At least 2 valid products are required for comparison" });
      }

      res.json({ products: validProducts });
    } catch (error) {
      console.error("Error comparing products:", error);
      res.status(500).json({ error: "Failed to compare products" });
    }
  });

  // Delete product
  app.delete("/api/products/:id", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
