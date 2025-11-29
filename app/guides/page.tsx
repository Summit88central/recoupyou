"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Download, Users, CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Guide {
  id: string;
  title: string;
  description: string;
  price: number;
  file_path: string;
  discount: number;
  promo_code?: string;
  image_url?: string;
  in_stock?: boolean;
}

interface Bundle {
  id: string;
  name: string;
  price: number;
  guide1_id: string;
  guide2_id: string;
  guides?: Guide[];
}

const GuidesPage: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'guides' | 'bundles'>('guides');
  const { addItem } = useCart();
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch guides and bundles in parallel
      const [guidesResponse, bundlesResponse] = await Promise.all([
        fetch('/api/guides'),
        fetch('/api/bundles')
      ]);

      if (guidesResponse.ok) {
        const guidesData = await guidesResponse.json();
        setGuides(guidesData.guides || []);
      }

      if (bundlesResponse.ok) {
        const bundlesData = await bundlesResponse.json();
        setBundles(bundlesData.bundles || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load guides and bundles');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price);
  };

  

  const handleAddToCart = (item: Guide | Bundle, type: 'guide' | 'bundle') => {
    addItem(item, type);
    toast.success(`${type === 'guide' ? (item as Guide).title : (item as Bundle).name} added to cart!`);
  };

  const parseDescription = (desc: string): string[] => {
    if (!desc) return [];
    const parts = desc
      .split(/(?:\s*✓\s*|\n|\r|•\s*)/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    return parts;
  };

  const toggleExpanded = (id: string) => {
    setExpandedGuides((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fitness Guides & Bundles
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your fitness journey with our comprehensive guides. Download instantly and start your transformation today.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'guides'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Individual Guides ({guides.length})
            </button>
            <button
              onClick={() => setActiveTab('bundles')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'bundles'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bundles ({bundles.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'guides' ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No guides available</h3>
                <p className="text-gray-500">Check back soon for new fitness guides!</p>
              </div>
            ) : (
              guides.map((guide) => (
                <div key={guide.id} className="space-y-2">
                  {guide.image_url && (
                    <div
                      className="relative overflow-hidden rounded aspect-square cursor-pointer"
                      onClick={() => window.location.assign(`/guides/${guide.id}`)}
                    >
                      <img src={guide.image_url} alt={guide.title} className="w-full h-full object-cover" />
                      {guide.in_stock === false && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-pink-200 text-pink-700 px-3 py-1 rounded font-semibold">OUT OF STOCK</span>
                        </div>
                      )}
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-gray-900">{guide.title}</h3>
                  <div className="text-pink-600 font-bold">{formatPrice(guide.price)}</div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4" />
                    <span className="ml-1 text-xs text-gray-600">4.0</span>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(guide, 'guide')}
                    className="bg-pink-600 hover:bg-pink-700 text-white w-full"
                    disabled={guide.in_stock === false}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bundles.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles available</h3>
                <p className="text-gray-500">Check back soon for new guide bundles!</p>
              </div>
            ) : (
              bundles.map((bundle) => (
                <Card key={bundle.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {bundle.name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Bundle
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600">
                      Get multiple guides at a discounted price
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <h4 className="font-medium text-gray-900">Includes:</h4>
                      {bundle.guides?.map((guide, index) => (
                        <div key={guide.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{guide.title}</span>
                          <span className="text-gray-500">{formatPrice(guide.price)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Individual Price:</span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(bundle.guides?.reduce((sum, guide) => sum + guide.price, 0) || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-lg font-medium text-gray-900">Bundle Price:</span>
                        <span className="text-2xl font-bold text-pink-600">
                          {formatPrice(bundle.price)}
                        </span>
                      </div>
                      <div className="text-center mt-2">
                        <Badge variant="destructive">
                          Save {formatPrice((bundle.guides?.reduce((sum, guide) => sum + guide.price, 0) || 0) - bundle.price)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      onClick={() => handleAddToCart(bundle, 'bundle')}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add Bundle to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidesPage;
