"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2, RefreshCw, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  created_at: string;
  guides?: any[];
}

interface BundlesSectionProps {
  bundles: Bundle[];
  guides: any[];
  onView?: (item: any, type: string) => void;
  onDelete?: (id: string, name: string, type: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function BundlesSection({ bundles, guides, onView, onDelete, onRefresh, isRefreshing }: BundlesSectionProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    guide_ids: [] as string[]
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      guide_ids: []
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.price || formData.guide_ids.length === 0) {
      toast.error('Please fill in all required fields and select at least one guide');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bundles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.title,
          description: formData.description,
          price: formData.price,
          guide_ids: formData.guide_ids,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bundle');
      }

      toast.success('Bundle created successfully');
      setIsCreateOpen(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error creating bundle:', error);
      toast.error('Failed to create bundle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setFormData({
      title: bundle.name,
      description: bundle.description,
      price: bundle.price.toString(),
      guide_ids: bundle.guides?.map(g => g.id) || []
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBundle || !formData.title || !formData.description || !formData.price || formData.guide_ids.length === 0) {
      toast.error('Please fill in all required fields and select at least one guide');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/bundles/${editingBundle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.title,
          description: formData.description,
          price: formData.price,
          guide_ids: formData.guide_ids,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bundle');
      }

      toast.success('Bundle updated successfully');
      setIsEditOpen(false);
      setEditingBundle(null);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error updating bundle:', error);
      toast.error('Failed to update bundle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (bundle: Bundle) => {
    if (!confirm(`Are you sure you want to delete "${bundle.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/bundles/${bundle.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bundle');
      }

      toast.success('Bundle deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting bundle:', error);
      toast.error('Failed to delete bundle');
    }
  };

  const handleGuideToggle = (guideId: string) => {
    setFormData(prev => ({
      ...prev,
      guide_ids: prev.guide_ids.includes(guideId)
        ? prev.guide_ids.filter(id => id !== guideId)
        : [...prev.guide_ids, guideId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Guide Bundles
          </h1>
          <p className="text-gray-600 mt-1">Manage fitness guide bundles and collections</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Bundle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Bundle</DialogTitle>
                <DialogDescription>
                  Create a new guide bundle with multiple fitness guides.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter bundle title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter bundle description"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (R) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <Label>Select Guides for Bundle</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {guides && Array.isArray(guides) ? guides.map((guide) => (
                      <label key={guide.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.guide_ids.includes(guide.id)}
                          onChange={() => handleGuideToggle(guide.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{guide.title} - R{guide.price}</span>
                      </label>
                    )) : (
                      <p className="text-sm text-gray-500">No guides available</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Bundle'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bundles ({bundles.length})</CardTitle>
          <CardDescription>
            Manage your fitness guide bundles and collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!bundles || !Array.isArray(bundles) || bundles.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles yet</h3>
              <p className="text-gray-500">Create your first guide bundle to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bundles.map((bundle) => (
                <Card key={bundle.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    {bundle.image_url ? (
                      <img
                        src={bundle.image_url}
                        alt={bundle.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{bundle.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bundle.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-green-600">R{bundle.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">
                        {bundle.guides?.length || 0} guides
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(bundle)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(bundle)}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bundle</DialogTitle>
            <DialogDescription>
              Update the bundle information and guides.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter bundle title"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter bundle description"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Price (R) *</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <Label>Select Guides for Bundle</Label>
              <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {guides.map((guide) => (
                  <label key={guide.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.guide_ids.includes(guide.id)}
                      onChange={() => handleGuideToggle(guide.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{guide.title} - R{guide.price}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingBundle(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Bundle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}