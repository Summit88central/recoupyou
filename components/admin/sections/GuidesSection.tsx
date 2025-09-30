"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Trash2, Edit, RefreshCw, Plus, Upload, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface GuidesSectionProps {
  guides: any[];
  onView: (item: any, type: string) => void;
  onDelete: (id: string, name: string, type: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function GuidesSection({ guides, onView, onDelete, onRefresh, isRefreshing }: GuidesSectionProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    pdf: null as File | null
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      pdf: null
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, pdf: file }));
  };

  const handleCreateGuide = async () => {
    if (!formData.title || !formData.description || !formData.price || !formData.pdf) {
      toast.error('Please fill in all required fields and upload a PDF');
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('pdf', formData.pdf);

      const response = await fetch('/api/guides', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create guide');
      }

      toast.success('Guide created successfully!');
      setIsCreateDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error creating guide:', error);
      toast.error('Failed to create guide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGuide = (guide: any) => {
    setEditingGuide(guide);
    setFormData({
      title: guide.title,
      description: guide.description,
      price: guide.price.toString(),
      pdf: null
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGuide = async () => {
    if (!formData.title || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      if (formData.pdf) {
        formDataToSend.append('pdf', formData.pdf);
      }

      const response = await fetch(`/api/guides/${editingGuide.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to update guide');
      }

      toast.success('Guide updated successfully!');
      setIsEditDialogOpen(false);
      setEditingGuide(null);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error updating guide:', error);
      toast.error('Failed to update guide');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Fitness Guides
          </h1>
          <p className="text-gray-600 mt-1">Manage your fitness guides and PDFs</p>
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700">
                <Plus className="h-4 w-4" />
                Add Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Guide</DialogTitle>
                <DialogDescription>
                  Add a new fitness guide to your collection.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter guide title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter guide description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (ZAR) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <Label htmlFor="pdf">PDF File *</Label>
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGuide} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Guide'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Guides ({guides.length})</span>
          </CardTitle>
          <CardDescription>
            Manage your fitness guides, upload new PDFs, and set pricing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guides.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No guides yet</h3>
              <p className="text-gray-500 mb-4">Create your first fitness guide to get started.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-pink-600 hover:bg-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Guide
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guides.map((guide) => (
                <Card key={guide.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {guide.image_url && (
                      <img
                        src={guide.image_url}
                        alt={guide.title}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-pink-600">
                        {formatPrice(guide.price)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(guide.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGuide(guide)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(guide.id, guide.title, "guide")}
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Guide</DialogTitle>
            <DialogDescription>
              Update the guide information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter guide title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter guide description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Price (ZAR) *</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
              />
            </div>
            <div>
              <Label htmlFor="edit-pdf">New PDF File (optional)</Label>
              <Input
                id="edit-pdf"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGuide} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Guide'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}