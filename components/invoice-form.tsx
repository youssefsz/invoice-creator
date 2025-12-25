"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Invoice, InvoiceItem, CURRENCIES, getCurrencySymbol, CompanyInfo, SavedItem } from "@/lib/types";
import { getClientById, getClients, generateId, generateInvoiceNumber, saveInvoice, deleteInvoice, saveClient, getSavedItems, saveSavedItem } from "@/lib/storage";
import { getInvoiceSubtotal, getTaxAmount, getInvoiceTotal } from "@/lib/calculations";
import { InvoicePreview } from "./invoice-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { X, Calendar, FileText, User, Plus, Trash2, Eye, Loader2, Package } from "lucide-react";
import { Client } from "@/lib/types";
import { InvoiceLanguage, LANGUAGE_OPTIONS } from "@/lib/translations";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

interface InvoiceFormProps {
    existingInvoice?: Invoice;
    onClose: () => void;
    onSave: () => void;
    onDelete?: () => void;
    companyInfo?: CompanyInfo;
}

export function InvoiceForm({ existingInvoice, onClose, onSave, onDelete, companyInfo }: InvoiceFormProps) {
    const [clientId, setClientId] = useState(existingInvoice?.clientId || "");
    const [invoiceNumber] = useState(
        existingInvoice?.invoiceNumber || generateInvoiceNumber()
    );
    const [currency, setCurrency] = useState(existingInvoice?.currency || "TND");
    const [note, setNote] = useState(existingInvoice?.note || "");
    const [items, setItems] = useState<InvoiceItem[]>(
        existingInvoice?.items || []
    );
    const [taxRate, setTaxRate] = useState(existingInvoice?.taxRate || 0);
    const [discount, setDiscount] = useState(0);
    const [isPaid, setIsPaid] = useState(existingInvoice?.isPaid || false);
    const [showPreview, setShowPreview] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showItemEditor, setShowItemEditor] = useState(false);
    const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [showTaxInput, setShowTaxInput] = useState(false);
    const [showClientSelector, setShowClientSelector] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [newClient, setNewClient] = useState<Omit<Client, "id" | "createdAt">>({
        name: "",
        email: "",
        phone: "",
        address: "",
    });
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [showPreviewLanguageDialog, setShowPreviewLanguageDialog] = useState(false);
    const [previewLanguage, setPreviewLanguage] = useState<InvoiceLanguage>("en");
    const [issueDate, setIssueDate] = useState<Date>(
        existingInvoice?.createdAt ? new Date(existingInvoice.createdAt) : new Date()
    );
    const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
    const [dueDate, setDueDate] = useState<"none" | "receipt" | "10" | "15" | "30">("none");
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);

    // Due date options
    const dueDateOptions = [
        { value: "none" as const, label: "No due date" },
        { value: "receipt" as const, label: "On receipt" },
        { value: "10" as const, label: "10 days" },
        { value: "15" as const, label: "15 days" },
        { value: "30" as const, label: "30 days" },
    ];

    const getDueDateLabel = () => {
        const option = dueDateOptions.find(o => o.value === dueDate);
        return option?.label || "No due date";
    };

    const previewRef = useRef<HTMLDivElement>(null);
    const client = clientId ? getClientById(clientId) : null;
    const currencySymbol = getCurrencySymbol(currency);

    // Saved items for quick selection
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [showSavedItemsPicker, setShowSavedItemsPicker] = useState(false);

    useEffect(() => {
        setClients(getClients());
        setSavedItems(getSavedItems());
    }, []);

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
    }, [invoiceNumber, clientId, currency, note, items, taxRate, isPaid, client, pdfBlobUrl, previewLanguage]);

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

    const invoiceData = {
        invoiceNumber,
        clientId,
        currency,
        note,
        items,
        taxRate,
        isPaid,
    };

    const subtotal = getInvoiceSubtotal(items);
    const tax = getTaxAmount(items, taxRate);
    const total = getInvoiceTotal({ ...invoiceData, id: "", createdAt: "", updatedAt: "" });

    const handleSave = () => {
        if (!clientId) {
            alert("Please select a client");
            return;
        }
        if (items.length === 0) {
            alert("Please add at least one item");
            return;
        }

        const invoice: Invoice = {
            id: existingInvoice?.id || generateId(),
            ...invoiceData,
            createdAt: issueDate.toISOString(),
            updatedAt: new Date().toISOString(),
        };

        saveInvoice(invoice);
        onSave();
    };

    const handleDelete = () => {
        if (existingInvoice) {
            deleteInvoice(existingInvoice.id);
            onDelete?.();
        }
    };

    const handleAddItem = () => {
        setEditingItem({
            id: generateId(),
            name: "",
            quantity: 1,
            pricePerUnit: 0,
            discount: 0,
            taxable: false,
        });
        setShowItemEditor(true);
    };

    const handleEditItem = (item: InvoiceItem) => {
        setEditingItem({ ...item });
        setShowItemEditor(true);
    };

    const handleSaveItem = () => {
        if (!editingItem) return;

        const existingIndex = items.findIndex((i) => i.id === editingItem.id);
        if (existingIndex >= 0) {
            const newItems = [...items];
            newItems[existingIndex] = editingItem;
            setItems(newItems);
        } else {
            setItems([...items, editingItem]);

            // Save new item to saved items for future reuse (only if it has a name)
            if (editingItem.name.trim()) {
                const existingSavedItem = savedItems.find(
                    (si) => si.name.toLowerCase() === editingItem.name.toLowerCase()
                );
                if (!existingSavedItem) {
                    const newSavedItem: SavedItem = {
                        id: generateId(),
                        name: editingItem.name,
                        defaultPrice: editingItem.pricePerUnit,
                        createdAt: new Date().toISOString(),
                    };
                    saveSavedItem(newSavedItem);
                    setSavedItems(getSavedItems());
                }
            }
        }
        setShowItemEditor(false);
        setEditingItem(null);
    };

    // Handle selecting a saved item to quickly add
    const handleSelectSavedItem = (savedItem: SavedItem) => {
        setEditingItem({
            id: generateId(),
            name: savedItem.name,
            quantity: 1,
            pricePerUnit: savedItem.defaultPrice,
            discount: 0,
            taxable: false,
        });
        setShowSavedItemsPicker(false);
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const handleCreateClient = () => {
        if (!newClient.name.trim()) return;

        const clientData: Client = {
            ...newClient,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };

        saveClient(clientData);
        setClients(getClients());
        setClientId(clientData.id);
        setShowNewClientForm(false);
        setShowClientSelector(false);
        setNewClient({ name: "", email: "", phone: "", address: "" });
    };

    // Format date for display
    const formatDateChip = (date: Date) => {
        const now = new Date();
        const prefix = isPaid ? "Paid" : "Issued";
        if (date.toDateString() === now.toDateString()) {
            return `${prefix} Today`;
        }
        return `${prefix} ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    };

    // Extract invoice number without prefix
    const invoiceNum = invoiceNumber.replace("INV-", "");

    return (
        <>
            <div className="flex flex-col min-h-full bg-background relative">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-background sticky top-0 z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-10 w-10 transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    <h1 className="font-semibold text-lg">
                        {existingInvoice ? (isPaid ? "Edit Receipt" : "Edit Invoice") : "New Invoice"}
                    </h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Date/Invoice Chips */}
                <div className="flex gap-2 px-4 pb-4 flex-wrap">
                    {!isPaid && (
                        <Popover open={showDueDatePicker} onOpenChange={setShowDueDatePicker}>
                            <PopoverTrigger asChild>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-card border border-border text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{getDueDateLabel()}</span>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-44 p-1" align="start">
                                <div className="flex flex-col">
                                    {dueDateOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${dueDate === option.value
                                                ? "bg-foreground text-background"
                                                : "hover:bg-muted"
                                                }`}
                                            onClick={() => {
                                                setDueDate(option.value);
                                                setShowDueDatePicker(false);
                                            }}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    <Popover open={showIssueDatePicker} onOpenChange={setShowIssueDatePicker}>
                        <PopoverTrigger asChild>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-card border border-border text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDateChip(issueDate)}</span>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="single"
                                selected={issueDate}
                                onSelect={(date) => {
                                    if (date) {
                                        setIssueDate(date);
                                        setShowIssueDatePicker(false);
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-card border border-border text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{invoiceNum}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 px-4 pb-4 space-y-4">
                    {/* Client Section */}
                    <div className="space-y-1.5">
                        <Label className="text-sm text-muted-foreground">Client</Label>
                        <Card
                            className="py-3 px-4 bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setShowClientSelector(true)}
                        >
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <span className={client ? "text-foreground" : "text-muted-foreground"}>
                                    {client?.name || "Select a client"}
                                </span>
                            </div>
                        </Card>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-1.5">
                        <Label className="text-sm text-muted-foreground">Items</Label>
                        <Card className="bg-card overflow-hidden">
                            {items.length === 0 ? (
                                <div className="py-3 px-4 text-center text-muted-foreground text-sm">
                                    No items added yet
                                </div>
                            ) : (
                                <div>
                                    {items.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors ${index !== items.length - 1 ? "border-b border-border/50" : ""
                                                }`}
                                            onClick={() => handleEditItem(item)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground truncate">
                                                        {item.name || "Unnamed item"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.quantity}
                                                    </p>
                                                </div>
                                                <span className="font-medium text-foreground ml-4">
                                                    {(item.quantity * item.pricePerUnit * (1 - item.discount / 100)).toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="py-3 px-4 border-t border-border/50">
                                <Button
                                    variant="outline"
                                    className="gap-2 h-10 px-4 border-border"
                                    onClick={handleAddItem}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Item
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Total Section */}
                    <Card className="py-3 px-4 bg-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-lg">Total</span>
                            <div className="flex items-center gap-2">
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger className="h-8 w-auto border-border text-sm gap-1 px-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                {c.code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span className="font-semibold text-lg">
                                    {currency}{total.toFixed(0)}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 h-9 px-3 border-border"
                                onClick={() => setShowDiscountInput(!showDiscountInput)}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Discount
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 h-9 px-3 border-border"
                                onClick={() => setShowTaxInput(!showTaxInput)}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Tax
                            </Button>
                        </div>
                        {showTaxInput && (
                            <div className="mt-3 flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={taxRate}
                                    onChange={(e) =>
                                        setTaxRate(
                                            Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                                        )
                                    }
                                    placeholder="0"
                                    className="w-20 h-9"
                                />
                                <span className="text-sm text-muted-foreground">% Tax Rate</span>
                            </div>
                        )}
                    </Card>

                    {/* Notes Section */}
                    <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Notes & Payment Instructions"
                        className="min-h-[80px] bg-card resize-none py-3 px-4"
                    />

                    {/* Delete Button */}
                    {existingInvoice && (
                        <Button
                            variant="ghost"
                            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete invoice
                        </Button>
                    )}
                </div>

                {/* Sticky Bottom Bar */}
                <div className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t border-border/50 z-10 backdrop-blur-sm bg-background/95">
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 text-base bg-card gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => setShowPreviewLanguageDialog(true)}
                        >
                            <Eye className="h-4 w-4" />
                            Preview
                        </Button>
                        <Button
                            className="flex-[2] h-12 text-base bg-foreground text-background transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleSave}
                        >
                            Save changes
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
                                onClick={() => {
                                    setShowPreviewLanguageDialog(false);
                                    setPreviewLanguage(option.code);
                                    // Clear old PDF blob to regenerate with new language
                                    if (pdfBlobUrl) {
                                        URL.revokeObjectURL(pdfBlobUrl);
                                        setPdfBlobUrl(null);
                                    }
                                    setShowPreview(true);
                                }}
                            >
                                <span className="text-xl">{option.flag}</span>
                                <span>{option.label}</span>
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Client Selector Dialog */}
            <Dialog open={showClientSelector} onOpenChange={setShowClientSelector}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select Client</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-4 max-h-[300px] overflow-y-auto">
                        {clients.map((c) => (
                            <div
                                key={c.id}
                                className={`p-3 rounded-xl cursor-pointer transition-colors ${clientId === c.id
                                    ? "bg-foreground text-background"
                                    : "hover:bg-muted"
                                    }`}
                                onClick={() => {
                                    setClientId(c.id);
                                    setShowClientSelector(false);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {c.name}
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full mt-2 gap-2"
                            onClick={() => {
                                setShowNewClientForm(true);
                                setShowClientSelector(false);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Add New Client
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* New Client Form Dialog */}
            <Dialog open={showNewClientForm} onOpenChange={setShowNewClientForm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={newClient.name}
                                onChange={(e) =>
                                    setNewClient({ ...newClient, name: e.target.value })
                                }
                                placeholder="Client name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newClient.email}
                                onChange={(e) =>
                                    setNewClient({ ...newClient, email: e.target.value })
                                }
                                placeholder="client@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={newClient.phone}
                                onChange={(e) =>
                                    setNewClient({ ...newClient, phone: e.target.value })
                                }
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={newClient.address}
                                onChange={(e) =>
                                    setNewClient({ ...newClient, address: e.target.value })
                                }
                                placeholder="123 Main St, City, Country"
                            />
                        </div>
                        <Button
                            onClick={handleCreateClient}
                            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            disabled={!newClient.name.trim()}
                        >
                            Add Client
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Item Editor Dialog */}
            <Dialog open={showItemEditor} onOpenChange={setShowItemEditor}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem && items.some((i) => i.id === editingItem.id)
                                ? "Edit Item"
                                : "Add Item"}
                        </DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4 py-4">
                            {/* Saved Items Picker - Only show when adding new item */}
                            {savedItems.length > 0 && !items.some((i) => i.id === editingItem.id) && (
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Quick Add from Saved Items</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {savedItems.slice(0, 6).map((si) => (
                                            <button
                                                key={si.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-foreground text-sm hover:bg-muted/80 transition-colors border border-border"
                                                onClick={() => handleSelectSavedItem(si)}
                                            >
                                                <Package className="h-3 w-3" />
                                                {si.name}
                                            </button>
                                        ))}
                                    </div>
                                    {savedItems.length > 6 && (
                                        <p className="text-xs text-muted-foreground">
                                            +{savedItems.length - 6} more items in Settings
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={editingItem.name}
                                    onChange={(e) =>
                                        setEditingItem({ ...editingItem, name: e.target.value })
                                    }
                                    placeholder="Item or service name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={editingItem.quantity}
                                        onChange={(e) =>
                                            setEditingItem({
                                                ...editingItem,
                                                quantity: Math.max(1, parseInt(e.target.value) || 1),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price ({currencySymbol})</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editingItem.pricePerUnit}
                                        onChange={(e) =>
                                            setEditingItem({
                                                ...editingItem,
                                                pricePerUnit: Math.max(0, parseFloat(e.target.value) || 0),
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Discount (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editingItem.discount}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            discount: Math.min(
                                                100,
                                                Math.max(0, parseFloat(e.target.value) || 0)
                                            ),
                                        })
                                    }
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                {items.some((i) => i.id === editingItem.id) && (
                                    <Button
                                        variant="outline"
                                        className="text-red-500 border-destructive/30 hover:bg-destructive/10 dark:hover:bg-destructive/20"
                                        onClick={() => {
                                            handleRemoveItem(editingItem.id);
                                            setShowItemEditor(false);
                                            setEditingItem(null);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSaveItem}
                                    className="flex-1"
                                    disabled={!editingItem.name.trim()}
                                >
                                    {items.some((i) => i.id === editingItem.id)
                                        ? "Update Item"
                                        : "Add Item"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {invoiceNumber}. This action cannot be undone.
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
                <SheetContent side="bottom" className="h-[85%] p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b flex-shrink-0">
                        <SheetTitle>Invoice Preview</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 bg-muted relative">
                        {isPdfLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Generating PDF...</p>
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
                                <p className="text-sm text-muted-foreground">Failed to generate PDF preview</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Hidden preview for PDF export */}
            <div className="fixed -left-[9999px] top-0">
                <InvoicePreview
                    ref={previewRef}
                    invoice={invoiceData}
                    client={client || null}
                    companyInfo={companyInfo}
                    language={previewLanguage}
                />
            </div>
        </>
    );
}
