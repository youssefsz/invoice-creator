"use client";

import { Invoice, getCurrencySymbol } from "@/lib/types";
import { getClientById } from "@/lib/storage";
import { getInvoiceTotal } from "@/lib/calculations";
import { FileText } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { useMemo } from "react";

interface InvoiceListProps {
    invoices: Invoice[];
    onInvoiceClick: (invoice: Invoice) => void;
    headerTitle?: string;
}

function getDateLabel(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = differenceInCalendarDays(today, date);

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return format(date, "MMM dd");
}

export function InvoiceList({ invoices, onInvoiceClick, headerTitle }: InvoiceListProps) {
    const totalBalance = useMemo(() => {
        return invoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
    }, [invoices]);

    // Group invoices by currency for the balance display? 
    // For simplicity, we'll assume one currency or just show the total of the first one if mixed,
    // or better, display mixed currencies? The image shows "Balance due TND900".
    // We'll use the currency of the first invoice for the total if available, otherwise default.
    const primaryCurrency = invoices.length > 0 ? invoices[0].currency : "USD";
    const currencySymbol = getCurrencySymbol(primaryCurrency);

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
        <div className="bg-card rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in-0 duration-300">
            {headerTitle && (
                <div className="flex justify-between items-center px-6 py-5 border-b border-border/40 bg-card">
                    <span className="text-muted-foreground font-medium text-[15px]">{headerTitle}</span>
                    <span className="text-muted-foreground font-medium text-[15px]">
                        {currencySymbol} {totalBalance.toFixed(0)}
                    </span>
                </div>
            )}

            <div className="flex flex-col">
                {invoices.map((invoice, index) => {
                    const client = getClientById(invoice.clientId);
                    const total = getInvoiceTotal(invoice);
                    const symbol = getCurrencySymbol(invoice.currency);
                    const dateLabel = getDateLabel(invoice.createdAt);
                    // Extract simplified ID if it's long, or just use it. 
                    // Assuming invoiceNumber is like "001" or "INV-001".
                    const displayId = invoice.invoiceNumber.replace(/^INV-/, '');

                    return (
                        <div
                            key={invoice.id}
                            onClick={() => onInvoiceClick(invoice)}
                            className="flex justify-between items-center px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/40 last:border-0 active:bg-muted/50"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-base text-foreground">
                                    {client?.name || "Unknown"}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground/60">
                                    {dateLabel} • {displayId}
                                </span>
                            </div>
                            <div className="font-bold text-base text-foreground">
                                {symbol} {total.toFixed(0)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
