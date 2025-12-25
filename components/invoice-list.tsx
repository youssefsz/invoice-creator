"use client";

import { Invoice, getCurrencySymbol } from "@/lib/types";
import { getClientById } from "@/lib/storage";
import { getInvoiceTotal } from "@/lib/calculations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, FileText } from "lucide-react";

interface InvoiceListProps {
    invoices: Invoice[];
    onInvoiceClick: (invoice: Invoice) => void;
}

export function InvoiceList({ invoices, onInvoiceClick }: InvoiceListProps) {
    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in-0 duration-300">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-1">No invoices yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                    Create your first invoice to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {invoices.map((invoice, index) => {
                const client = getClientById(invoice.clientId);
                const total = getInvoiceTotal(invoice);
                const currencySymbol = getCurrencySymbol(invoice.currency);

                return (
                    <Card
                        key={invoice.id}
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:shadow-sm active:scale-[0.99] animate-in fade-in-0 slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
                        onClick={() => onInvoiceClick(invoice)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                        {invoice.invoiceNumber}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs transition-colors duration-200 ${invoice.isPaid
                                            ? "bg-[#d1e4d0] text-green-900 hover:bg-[#d1e4d0]"
                                            : "bg-amber-200 text-amber-900 hover:bg-amber-200"
                                            }`}
                                    >
                                        {invoice.isPaid ? "Paid" : "Unpaid"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                    {client?.name || "Unknown Client"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">
                                    {currencySymbol}
                                    {total.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {invoice.currency}
                                </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
