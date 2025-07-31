import React from 'react';
import { 
  Table, TableHeader, TableBody, 
  TableRow, TableHead, TableCell 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

type ProductsTableProps = {
  products: Product[];
  className?: string;
};

const statusStyles = {
  'In Stock': 'bg-green-100 text-green-800',
  'Low Stock': 'bg-amber-100 text-amber-800',
  'Out of Stock': 'bg-red-100 text-red-800'
};

const ProductsTable = ({ products, className }: ProductsTableProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell className="text-right">RWF {product.price.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Badge className={cn(
                    statusStyles[product.status],
                    "font-normal"
                  )}>
                    {product.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductsTable;
