import { Product } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ShoppingCart, 
  Bookmark, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  UserX,
  Heart,
  List
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToComparison: (product: Product) => void;
  onSave?: (product: Product) => void;
  isInComparison?: boolean;
}

export function ProductCard({ 
  product, 
  onAddToComparison, 
  onSave,
  isInComparison = false 
}: ProductCardProps) {
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

  // Calculate time left percentage for progress bar
  const calculateTimeLeftPercentage = () => {
    if (!product.timeLeft) return 0;
    
    const timeLeftMatch = product.timeLeft.match(/(\d+)\s*(month|year)/i);
    if (!timeLeftMatch) return 0;
    
    const value = parseInt(timeLeftMatch[1]);
    const unit = timeLeftMatch[2].toLowerCase();
    
    const months = unit === 'year' ? value * 12 : value;
    const maxMonths = 24; // Assume 2 years is typical shelf life
    
    return Math.min((months / maxMonths) * 100, 100);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {product.name}
            </h3>
            <p className="text-gray-600">
              <span className="font-medium">{product.brand}</span> • {product.category}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToComparison(product)}
              disabled={isInComparison}
              className="text-xs"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {isInComparison ? "Added" : "Compare"}
            </Button>
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSave(product)}
                className="text-xs"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ingredients */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <List className="h-5 w-5 mr-2 text-primary" />
                Key Ingredients
              </h4>
              <div className="space-y-4">
                {product.ingredients.map((ingredient, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{ingredient.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">{ingredient.function}</p>
                      </div>
                      <Badge className={`ml-4 ${getSafetyColor(ingredient.safetyRating)}`}>
                        {getSafetyIcon(ingredient.safetyRating)}
                        <span className="ml-1 capitalize">{ingredient.safetyRating}</span>
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Benefits:</p>
                        <p className="text-gray-600">{ingredient.benefits}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Considerations:</p>
                        <p className="text-gray-600">{ingredient.sideEffects}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Instructions */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                Usage Instructions
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900">{product.usageInstructions}</p>
              </div>
            </div>

            {/* Warnings */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                Warnings & Precautions
              </h4>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-900">{product.warnings}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status */}
            {(product.expiryDate || product.timeLeft) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Product Status
                </h5>
                <div className="space-y-3">
                  {product.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expiry Date:</span>
                      <span className="text-sm font-medium text-gray-900">{product.expiryDate}</span>
                    </div>
                  )}
                  {product.timeLeft && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time Left:</span>
                      <span className="text-sm font-medium text-green-600">{product.timeLeft}</span>
                    </div>
                  )}
                  <Progress value={calculateTimeLeftPercentage()} className="h-2" />
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Recommendations</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Recommended For:
                  </p>
                  <p className="text-sm text-gray-600">{product.recommendedFor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1 flex items-center">
                    <UserX className="h-4 w-4 mr-1" />
                    Not Recommended For:
                  </p>
                  <p className="text-sm text-gray-600">{product.notRecommendedFor}</p>
                </div>
              </div>
            </div>

            {/* User Insights */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                User Insights
              </h5>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Pros:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {product.userSentiment.pros.map((pro, index) => (
                      <li key={index}>• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Cons:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {product.userSentiment.cons.map((con, index) => (
                      <li key={index}>• {con}</li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-700">"{product.userSentiment.reviewSummary}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
