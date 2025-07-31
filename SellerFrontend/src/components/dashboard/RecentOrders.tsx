
import React from 'react';
import { 
  Table, TableHeader, TableBody, 
  TableRow, TableHead, TableCell 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type Order = {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Processing' | 'Cancelled';
};

type RecentOrdersProps = {
  orders: Order[];
  className?: string;
};

const statusStyles = {
  'Completed': 'bg-green-100 text-green-800',
  'Processing': 'bg-blue-100 text-blue-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

const RecentOrders = ({ orders, className }: RecentOrdersProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent Orders</CardTitle>
        <Button variant="ghost" size="sm">View All</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell className="text-right">frw {order.amount.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Badge className={cn(
                    statusStyles[order.status],
                    "font-normal"
                  )}>
                    {order.status}
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

export default RecentOrders;
