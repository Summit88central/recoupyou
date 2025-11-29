"use client";

import React, { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react';
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

export default function GuideDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/guides/${params?.id}`);
        if (!res.ok) throw new Error('Failed to fetch guide');
        const data = await res.json();
        setGuide(data.guide);
      } catch (e) {
        toast.error('Failed to load guide');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id]);

  const formatPrice = (price: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(price);

  const parseDescription = (desc: string): string[] => {
    return desc
      .split(/(?:\s*✓\s*|\n|\r|•\s*)/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 pt-20" />;
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Button variant="outline" onClick={() => router.push('/guides')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guides
          </Button>
          <p className="mt-6 text-gray-600">Guide not found</p>
        </div>
      </div>
    );
  }

  const points = parseDescription(guide.description);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Button variant="outline" onClick={() => router.push('/guides')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Guides
        </Button>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl">{guide.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {guide.image_url && (
              <img src={guide.image_url} alt={guide.title} className="w-full h-64 object-cover rounded mb-4" />
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-pink-600">{formatPrice(guide.price)}</span>
              <Button onClick={() => { addItem(guide, 'guide'); toast.success('Added to cart'); }} className="bg-pink-600 hover:bg-pink-700 text-white" disabled={guide.in_stock === false}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
            {guide.in_stock === false && (
              <div className="mb-4">
                <span className="bg-pink-200 text-pink-700 px-3 py-1 rounded font-semibold">OUT OF STOCK</span>
              </div>
            )}
            {points.length > 0 ? (
              <ul className="text-gray-700 space-y-2">
                {points.map((pt, idx) => (
                  <li key={idx} className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-pink-500 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">{guide.description}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
