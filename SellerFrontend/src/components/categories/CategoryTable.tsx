import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { CategoryViewSheet } from "./CategoryViewSheet";
import { AddCategoryDialog } from "./AddCategoryDialog";
import { toast } from "sonner";
import { deleteCategory } from '@/ApiConfig/ApiConfiguration';

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  createdAt: string;
  status: "active" | "inactive";
  imageSrc?: string;
}

interface CategoryTableProps {
  categories: Category[];
  onDeleteCategory: (id: string) => void;
  onUpdateCategory: (category: Category) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({ 
  categories, 
  onDeleteCategory,
  onUpdateCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setSheetOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(categoryId);
        onDeleteCategory(categoryId);
        toast.success("Category deleted successfully");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete category");
        console.error("Error deleting category:", error);
      }
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]"></TableHead>
              <TableHead className="w-[180px]">Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="hidden md:table-cell">Products</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No categories found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} onClick={() => handleViewCategory(category)} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>
                    {category.imageSrc ? (
                      <div className="h-10 w-10 rounded-md overflow-hidden">
                        <img 
                          src={category.imageSrc} 
                          alt={category.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[300px] truncate">{category.description}</TableCell>
                  <TableCell className="hidden md:table-cell">{category.productCount}</TableCell>
                  <TableCell className="hidden md:table-cell">{category.createdAt}</TableCell>
                  <TableCell>
                    <Badge variant={category.status === 'active' ? 'default' : 'outline'} className={category.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCategory(category);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {selectedCategory && (
        <CategoryViewSheet 
          open={sheetOpen} 
          onOpenChange={setSheetOpen} 
          category={selectedCategory}
          onUpdateCategory={onUpdateCategory} 
        />
      )}
    </>
  );
};