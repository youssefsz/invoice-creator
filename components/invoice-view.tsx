"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Invoice, getCurrencySymbol, CompanyInfo } from "@/lib/types";
import {
    getClientById,
    toggleInvoiceStatus,
    deleteInvoice,
} from "@/lib/storage";
import { getInvoiceTotal, getInvoiceSubtotal, getTotalDiscount, getTaxAmount } from "@/lib/calculations";
import { InvoicePreview } from "./invoice-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Check, Edit, MoreVertical, Trash2, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceLanguage, LANGUAGE_OPTIONS } from "@/lib/translations";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

interface InvoiceViewProps {
    invoice: Invoice;
    onClose: () => void;
    onEdit: () => void;
    onStatusChange: () => void;
    onDelete: () => void;
    companyInfo?: CompanyInfo;
}

export function InvoiceView({
    invoice,
    onClose,
    onEdit,
    onStatusChange,
    onDelete,
    companyInfo,
}: InvoiceViewProps) {
    const [isPaid, setIsPaid] = useState(invoice.isPaid);
    const [isExporting, setIsExporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showPreviewLanguageDialog, setShowPreviewLanguageDialog] = useState(false);
    const [exportLanguage, setExportLanguage] = useState<InvoiceLanguage>("en");
    const [previewLanguage, setPreviewLanguage] = useState<InvoiceLanguage>("en");
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    const client = getClientById(invoice.clientId);
    const currencySymbol = getCurrencySymbol(invoice.currency);
    const total = getInvoiceTotal(invoice);
    const subtotal = getInvoiceSubtotal(invoice.items);
    const totalDiscount = getTotalDiscount(invoice.items);
    const tax = getTaxAmount(invoice.items, invoice.taxRate);

    // Generate PDF blob for preview
    const generatePdfBlob = useCallback(async () => {
        setIsPdfLoading(true);

        try {
            // Wait for preview to render
            await new Promise((resolve) => setTimeout(resolve, 200));

            if (!previewRef.current) {
                throw new Error("Preview not available");
            }

            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            if (imgHeight > pdfHeight) {
                const ratio = pdfHeight / imgHeight;
                pdf.addImage(imgData, "PNG", 0, 0, imgWidth * ratio, pdfHeight);
            } else {
                pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            }

            const blob = pdf.output("blob");
            const url = URL.createObjectURL(blob);

            // Clean up old blob URL
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }

            setPdfBlobUrl(url);
        } catch (error) {
            console.error("Error generating PDF preview:", error);
        } finally {
            setIsPdfLoading(false);
        }
    }, [invoice, client, pdfBlobUrl, previewLanguage]);

    // Generate PDF when preview is opened
    useEffect(() => {
        if (showPreview && !pdfBlobUrl) {
            generatePdfBlob();
        }
    }, [showPreview, pdfBlobUrl, generatePdfBlob]);

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [pdfBlobUrl]);

    const handleTogglePaid = () => {
        const updatedInvoice = toggleInvoiceStatus(invoice.id);
        if (updatedInvoice) {
            setIsPaid(updatedInvoice.isPaid);
            onStatusChange();
        }
    };

    const handleDelete = () => {
        deleteInvoice(invoice.id);
        onDelete();
    };

    const handlePreview = (language: InvoiceLanguage) => {
        setShowPreviewLanguageDialog(false);
        setPreviewLanguage(language);
        // Clear old PDF blob to regenerate with new language
        if (pdfBlobUrl) {
            URL.revokeObjectURL(pdfBlobUrl);
            setPdfBlobUrl(null);
        }
        setShowPreview(true);
    };

    const handleExportPDF = async (language: InvoiceLanguage) => {
        setShowExportDialog(false);
        setExportLanguage(language);
        setIsExporting(true);

        // Wait for the preview to re-render with new language
        await new Promise((resolve) => setTimeout(resolve, 300));

        try {
            if (!previewRef.current) {
                throw new Error("Preview not available");
            }

            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            if (imgHeight > pdfHeight) {
                const ratio = pdfHeight / imgHeight;
                pdf.addImage(imgData, "PNG", 0, 0, imgWidth * ratio, pdfHeight);
            } else {
                pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            }

            pdf.save(`${invoice.invoiceNumber}.pdf`);
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert("Failed to export PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === now.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }
    };

    // Extract invoice number without prefix
    const invoiceNum = invoice.invoiceNumber.replace("INV-", "");

    return (
        <>
            <div className="flex flex-col min-h-screen bg-background">
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="transition-transform duration-200 hover:scale-105 active:scale-95">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Invoice
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Main Content */}
                <div className="flex-1 px-4 pb-24">
                    {/* Main Invoice Card */}
                    <Card className="p-4 mb-4">
                        {/* Client Name */}
                        <h1 className="text-2xl font-semibold leading-tight">
                            {client?.name || "Unknown Client"}
                        </h1>
                        {/* Due Date */}
                        <p className="text-sm text-muted-foreground mt-2">No Due Date</p>
                        {/* Amount */}
                        <p className="text-lg font-semibold">{invoice.currency}{total.toFixed(0)}</p>
                        {/* Paid Badge */}
                        {isPaid ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#d1e4d0] text-green-900 text-sm font-medium mt-2 w-fit">
                                <Check className="h-3.5 w-3.5" />
                                Paid
                            </div>
                        ) : (
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-200 text-amber-900 text-sm font-medium mt-2 w-fit">
                                Unpaid
                            </div>
                        )}
                        {/* Divider */}
                        <div className="border-t mt-3 mb-2" />
                        {/* Paid Toggle */}
                        <div className="flex items-center justify-between py-1">
                            <span className="text-muted-foreground">Paid</span>
                            <button
                                onClick={handleTogglePaid}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isPaid ? "bg-foreground" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white transition-transform ${isPaid ? "translate-x-6" : "translate-x-1"
                                        }`}
                                >
                                    {isPaid && <Check className="h-3 w-3 text-foreground" />}
                                </span>
                            </button>
                        </div>
                        {/* Divider */}
                        <div className="border-t my-2" />
                        {/* Received Amount */}
                        <div className="flex items-center justify-between py-1">
                            <span className="text-muted-foreground">Received</span>
                            <span className="font-medium">{invoice.currency}{isPaid ? total.toFixed(0) : "0"}</span>
                        </div>
                    </Card>

                    {/* Info Rows */}
                    <div className="space-y-0">
                        {/* Paid Date */}
                        <div className="flex items-center justify-between py-4 border-b">
                            <span className="text-foreground">Paid</span>
                            <span className="text-muted-foreground">
                                {isPaid ? formatDate(invoice.updatedAt) : "—"}
                            </span>
                        </div>

                        {/* Issued Date */}
                        <div className="flex items-center justify-between py-4 border-b">
                            <span className="text-foreground">Issued</span>
                            <span className="text-muted-foreground">
                                {formatDate(invoice.createdAt)}
                            </span>
                        </div>

                        {/* Invoice Number */}
                        <div className="flex items-center justify-between py-4 border-b">
                            <span className="text-foreground">Invoice #</span>
                            <span className="text-muted-foreground">{invoiceNum}</span>
                        </div>

                        {/* Items Count */}
                        <div className="flex items-center justify-between py-4 border-b">
                            <span className="text-foreground">Items</span>
                            <span className="text-muted-foreground">
                                {invoice.items.length} {invoice.items.length === 1 ? "item" : "items"}
                            </span>
                        </div>

                        {/* Note if exists */}
                        {invoice.note && (
                            <div className="py-4 border-b">
                                <span className="text-foreground block mb-1">Note</span>
                                <span className="text-muted-foreground text-sm">{invoice.note}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <div className="flex gap-3 max-w-lg mx-auto">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => setShowPreviewLanguageDialog(true)}
                        >
                            Preview
                        </Button>
                        <Button
                            className="flex-1 h-12 text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => setShowExportDialog(true)}
                            disabled={isExporting}
                        >
                            {isExporting ? "Exporting..." : "Export PDF"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview Language Selection Dialog */}
            <Dialog open={showPreviewLanguageDialog} onOpenChange={setShowPreviewLanguageDialog}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Preview Language</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Choose the language for the invoice preview:
                        </p>
                        {LANGUAGE_OPTIONS.map((option) => (
                            <Button
                                key={option.code}
                                variant="outline"
                                className="w-full justify-start gap-3 h-12 text-base"
                                onClick={() => handlePreview(option.code)}
                            >
                                <span className="text-xl">{option.flag}</span>
                                <span>{option.label}</span>
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Export Language Selection Dialog */}
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Export Language</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Choose the language for your invoice PDF:
                        </p>
                        {LANGUAGE_OPTIONS.map((option) => (
                            <Button
                                key={option.code}
                                variant="outline"
                                className="w-full justify-start gap-3 h-12 text-base"
                                onClick={() => handleExportPDF(option.code)}
                            >
                                <span className="text-xl">{option.flag}</span>
                                <span>{option.label}</span>
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {invoice.invoiceNumber}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Preview Sheet - Shows actual PDF */}
            <Sheet open={showPreview} onOpenChange={(open) => {
                setShowPreview(open);
                if (!open) {
                    // Clear PDF blob when closing to regenerate fresh on next open
                    if (pdfBlobUrl) {
                        URL.revokeObjectURL(pdfBlobUrl);
                        setPdfBlobUrl(null);
                    }
                }
            }}>
                <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b flex-shrink-0">
                        <SheetTitle>Invoice Preview</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 bg-gray-100 relative">
                        {isPdfLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                                    <p className="text-sm text-gray-500">Generating PDF...</p>
                                </div>
                            </div>
                        ) : pdfBlobUrl ? (
                            <iframe
                                src={pdfBlobUrl}
                                className="w-full h-full border-0"
                                title="Invoice PDF Preview"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    width: '100%',
                                    height: '100%',
                                }}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-sm text-gray-500">Failed to generate PDF preview</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Hidden preview for PDF export */}
            <div className="fixed -left-[9999px] top-0">
                <InvoicePreview
                    ref={previewRef}
                    invoice={invoice}
                    client={client || null}
                    companyInfo={companyInfo}
                    language={showPreview ? previewLanguage : exportLanguage}
                />
            </div>
        </>
    );
}
