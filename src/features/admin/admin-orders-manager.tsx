"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatInrFromPaise } from "@/lib/utils";
import type { FulfilmentStatus, OrderRecord } from "@/types";

const FULFILMENT_STATUSES: FulfilmentStatus[] = [
  "pending",
  "payment_pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export function AdminOrdersManager({ orders }: { orders: OrderRecord[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.fulfilmentStatus !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [orders, search, statusFilter]);

  async function handleStatusChange(
    orderId: string,
    fulfilmentStatus: FulfilmentStatus
  ) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, fulfilmentStatus }),
    });

    if (res.ok) {
      toast.success("Order fulfilment status updated.");
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      toast.error(data.error ?? "Failed to update order.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-label-meta text-muted-olive">Fulfilment</p>
          <h1 className="text-section-heading mt-1 text-deep-earth-olive">
            Orders ({filtered.length})
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order # or customer..."
            className="h-9 w-56 bg-surface text-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-44 bg-surface text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {FULFILMENT_STATUSES.map((st) => (
                <SelectItem key={st} value={st} className="capitalize">
                  {st.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface-secondary">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Fulfilment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-olive">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-deep-earth-olive">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-deep-earth-olive">
                      {order.customerName}
                    </p>
                    <p className="text-[11px] text-muted-olive">
                      {order.customerEmail}
                    </p>
                  </TableCell>
                  <TableCell>{formatInrFromPaise(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "default" : "outline"
                      }
                      className="capitalize"
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.fulfilmentStatus}
                      onValueChange={(val) =>
                        handleStatusChange(order.id, val as FulfilmentStatus)
                      }
                    >
                      <SelectTrigger className="h-8 w-36 bg-surface text-xs capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FULFILMENT_STATUSES.map((st) => (
                          <SelectItem key={st} value={st} className="capitalize">
                            {st.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-olive">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
