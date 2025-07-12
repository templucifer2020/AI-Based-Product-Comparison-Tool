import { Product } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ProductComparisonProps {
  products: Product[];
  onRemoveProduct: (productId: number) => void;
  onClearAll: () => void;
}

export function ProductComparison({ 
  products, 
  onRemoveProduct, 
  onClearAll 
}: ProductComparisonProps) {
  if (products.length === 0) {
    return null;
  }

  const getSafetyColor = (rating: string) => {
    switch (rating) {
      case "safe":
        return "bg-green-100 text-green-800";
      case "caution":
        return "bg-yellow-100 text-yellow-800";
      case "warning":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSafetyIcon = (rating: string) => {
    switch (rating) {
      case "safe":
        return <CheckCircle className="h-4 w-4" />;
      case "caution":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const calculateOverallSafety = (product: Product) => {
    const safetyScores = product.ingredients.map(ingredient => {
      switch (ingredient.safetyRating) {
        case "safe": return 5;
        case "caution": return 3;
        case "warning": return 1;
        default: return 3;
      }
    });
    
    const average = safetyScores.reduce((a, b) => a + b, 0) / safetyScores.length;
    
    if (average >= 4.5) return { rating: "Excellent", color: "text-green-600" };
    if (average >= 3.5) return { rating: "Good", color: "text-yellow-600" };
    return { rating: "Fair", color: "text-red-600" };
  };

  return (
    <Card className="mt-12">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Product Comparison</h3>
          <Button variant="outline" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900 min-w-32">
                  Feature
                </th>
                {products.map((product) => (
                  <th key={product.id} className="text-left py-3 px-4 min-w-64">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveProduct(product.id)}
                        className="ml-2 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-4 px-4 font-medium text-gray-900">Category</td>
                {products.map((product) => (
                  <td key={product.id} className="py-4 px-4 text-gray-600">
                    {product.category}
                  </td>
                ))}
              </tr>
              
              <tr className="bg-gray-50">
                <td className="py-4 px-4 font-medium text-gray-900">Key Ingredients</td>
                {products.map((product) => (
                  <td key={product.id} className="py-4 px-4 text-gray-600">
                    <div className="space-y-1">
                      {product.ingredients.slice(0, 3).map((ingredient, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm">{ingredient.name}</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getSafetyColor(ingredient.safetyRating)}`}
                          >
                            {getSafetyIcon(ingredient.safetyRating)}
                          </Badge>
                        </div>
                      ))}
                      {product.ingredients.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{product.ingredients.length - 3} more
                        </p>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="py-4 px-4 font-medium text-gray-900">Expiry Status</td>
                {products.map((product) => (
                  <td key={product.id} className="py-4 px-4">
                    {product.timeLeft ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {product.timeLeft}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </td>
                ))}
              </tr>
              
              <tr className="bg-gray-50">
                <td className="py-4 px-4 font-medium text-gray-900">Safety Rating</td>
                {products.map((product) => {
                  const safety = calculateOverallSafety(product);
                  return (
                    <td key={product.id} className="py-4 px-4">
                      <div className="flex items-center">
                        <span className={`font-medium ${safety.color}`}>
                          {safety.rating}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
              
              <tr>
                <td className="py-4 px-4 font-medium text-gray-900">Usage Instructions</td>
                {products.map((product) => (
                  <td key={product.id} className="py-4 px-4 text-gray-600">
                    <p className="text-sm line-clamp-3">{product.usageInstructions}</p>
                  </td>
                ))}
              </tr>
              
              <tr className="bg-gray-50">
                <td className="py-4 px-4 font-medium text-gray-900">Warnings</td>
                {products.map((product) => (
                  <td key={product.id} className="py-4 px-4 text-gray-600">
                    <p className="text-sm line-clamp-3">{product.warnings}</p>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="py-4 px-4 font-medium text-gray-900">Recommended For</td>
                {products.map((product) => (
                  <td key={product.id} className="py-4 px-4 text-gray-600">
                    <p className="text-sm line-clamp-3">{product.recommendedFor}</p>
                  </td>
                ))}
              </tr>
              
              <tr className="bg-gray-50">
                <td className="py-4 px-4 font-medium text-gray-900">User Rating</td>
                {products.map((product) => (
                  <td key={product.id} className="py-4 px-4 text-gray-600">
                    <p className="text-sm">{product.userSentiment.reviewSummary}</p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
