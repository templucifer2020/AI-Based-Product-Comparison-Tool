import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { FileUpload } from "@/components/ui/file-upload";
import { ProductCard } from "@/components/product-card";
import { ProductComparison } from "@/components/product-comparison";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    refetchInterval: false,
  });

  // Mutation for analyzing products
  const analyzeProductsMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiRequest('POST', '/api/products/analyze', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${data.results.length} products`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setSelectedFiles([]);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyzeProducts = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select at least one product image to analyze",
        variant: "destructive",
      });
      return;
    }

    analyzeProductsMutation.mutate(selectedFiles);
  };

  const handleAddToComparison = (product: Product) => {
    if (comparisonProducts.length >= 4) {
      toast({
        title: "Comparison Limit Reached",
        description: "You can compare up to 4 products at a time",
        variant: "destructive",
      });
      return;
    }

    if (comparisonProducts.find(p => p.id === product.id)) {
      toast({
        title: "Product Already Added",
        description: "This product is already in your comparison",
        variant: "destructive",
      });
      return;
    }

    setComparisonProducts([...comparisonProducts, product]);
    toast({
      title: "Added to Comparison",
      description: `${product.name} has been added to your comparison`,
    });
  };

  const handleRemoveFromComparison = (productId: number) => {
    setComparisonProducts(comparisonProducts.filter(p => p.id !== productId));
  };

  const handleClearComparison = () => {
    setComparisonProducts([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Search className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">ProductInsight AI</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-primary font-medium">
                Dashboard
              </a>
              <a href="#" className="text-gray-700 hover:text-primary font-medium">
                History
              </a>
              <a href="#" className="text-gray-700 hover:text-primary font-medium">
                Settings
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Analyze Products with AI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload product images and get detailed ingredient analysis, usage instructions, 
            and safety information powered by advanced AI technology.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Upload Product Images
            </h3>
            <p className="text-gray-600">
              Take clear photos of product labels, ingredient lists, or packaging text
            </p>
          </div>

          <FileUpload
            onFilesSelect={setSelectedFiles}
            maxFiles={10}
            disabled={analyzeProductsMutation.isPending}
          />

          {selectedFiles.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleAnalyzeProducts}
                disabled={analyzeProductsMutation.isPending}
                size="lg"
                className="px-8"
              >
                {analyzeProductsMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Analyze Products
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        )}

        {/* Analysis Results */}
        {products.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-gray-900">
                Analysis Results ({products.length})
              </h3>
              {comparisonProducts.length > 0 && (
                <Button variant="outline" onClick={handleClearComparison}>
                  Clear Comparison ({comparisonProducts.length})
                </Button>
              )}
            </div>

            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToComparison={handleAddToComparison}
                isInComparison={comparisonProducts.some(p => p.id === product.id)}
              />
            ))}
          </div>
        )}

        {/* Comparison Section */}
        {comparisonProducts.length > 1 && (
          <ProductComparison
            products={comparisonProducts}
            onRemoveProduct={handleRemoveFromComparison}
            onClearAll={handleClearComparison}
          />
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Products Analyzed Yet
            </h3>
            <p className="text-gray-600">
              Upload some product images to get started with AI-powered analysis
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Search className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-gray-900">ProductInsight AI</span>
              </div>
              <p className="text-gray-600 max-w-md">
                Making product information accessible through AI-powered analysis. 
                Get detailed insights about ingredients, safety, and usage for informed decisions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
              <ul className="space-y-2 text-gray-600">
                <li>Product Analysis</li>
                <li>Ingredient Breakdown</li>
                <li>Safety Assessment</li>
                <li>Product Comparison</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li>Help Center</li>
                <li>API Documentation</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 mt-8 text-center text-gray-600">
            <p>&copy; 2024 ProductInsight AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
