"use client";

import { Invoice, Client, CompanyInfo } from "@/lib/types";
import {
    getInvoiceSubtotal,
    getTotalDiscount,
    getTaxAmount,
    getInvoiceTotal,
} from "@/lib/calculations";
import { getTranslations, InvoiceLanguage } from "@/lib/translations";
import { forwardRef } from "react";

interface ReceiptPreviewProps {
    invoice: Invoice;
    client: Client | null;
    companyInfo?: CompanyInfo;
    language?: InvoiceLanguage;
}

export const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(
    function ReceiptPreview({ invoice, client, companyInfo, language = "en" }, ref) {
        const t = getTranslations(language);
        const currencyCode = invoice.currency;
        const subtotal = getInvoiceSubtotal(invoice.items);
        const totalDiscount = getTotalDiscount(invoice.items);
        const tax = getTaxAmount(invoice.items, invoice.taxRate);
        const total = getInvoiceTotal(invoice);

        // Default company name if not set
        const senderName = companyInfo?.name || "Your Company";

        // Format date
        const formatDate = (dateString?: string) => {
            if (!dateString) {
                return new Date().toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                });
            }
            return new Date(dateString).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            });
        };

        // Receipt number from invoice number
        const receiptNum = invoice.invoiceNumber.replace("INV-", "REC-");

        return (
            <div
                ref={ref}
                className="bg-white text-black relative"
                style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    width: "595px",
                    minHeight: "842px",
                    padding: "48px",
                    boxSizing: "border-box",
                }}
            >
                {/* Header - Sender Name & Receipt Info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "48px" }}>
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: "600", margin: 0, color: "#1a1a1a" }}>
                            {senderName}
                        </h1>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <h2 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#1a1a1a" }}>
                            {t.receipt}
                        </h2>
                        <p style={{ fontSize: "14px", color: "#666", margin: "4px 0 0 0" }}>
                            {receiptNum}
                        </p>
                        <p style={{ fontSize: "14px", color: "#666", margin: "2px 0 0 0" }}>
                            {t.paidDate} {formatDate(invoice.updatedAt)}
                        </p>
                        {/* Simple Paid Badge */}
                        <div style={{
                            display: "inline-block",
                            marginTop: "8px",
                            padding: "4px 12px",
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                            fontSize: "12px",
                            fontWeight: "600",
                            borderRadius: "4px",
                        }}>
                            {t.paidInFull}
                        </div>
                    </div>
                </div>

                {/* FROM / RECEIVED FROM Section */}
                <div style={{ display: "flex", gap: "80px", marginBottom: "48px" }}>
                    <div>
                        <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0" }}>
                            {t.from}
                        </p>
                        <p style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0", color: "#1a1a1a" }}>
                            {senderName}
                        </p>
                        {companyInfo?.phone && (
                            <p style={{ fontSize: "14px", color: "#666", margin: "2px 0" }}>
                                {companyInfo.phone}
                            </p>
                        )}
                        {companyInfo?.email && (
                            <p style={{ fontSize: "14px", color: "#666", margin: "2px 0" }}>
                                {companyInfo.email}
                            </p>
                        )}
                        {companyInfo?.address && (
                            <p style={{ fontSize: "14px", color: "#666", margin: "2px 0" }}>
                                {companyInfo.address}
                            </p>
                        )}
                    </div>
                    <div>
                        <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0" }}>
                            {t.receivedFrom}
                        </p>
                        {client ? (
                            <div>
                                <p style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0", color: "#1a1a1a" }}>
                                    {client.name}
                                </p>
                                {client.phone && (
                                    <p style={{ fontSize: "14px", color: "#666", margin: "2px 0" }}>
                                        {client.phone}
                                    </p>
                                )}
                                {client.email && (
                                    <p style={{ fontSize: "14px", color: "#666", margin: "2px 0" }}>
                                        {client.email}
                                    </p>
                                )}
                                {client.address && (
                                    <p style={{ fontSize: "14px", color: "#666", margin: "2px 0" }}>
                                        {client.address}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p style={{ fontSize: "14px", color: "#999", fontStyle: "italic" }}>
                                {t.noClientSelected}
                            </p>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div style={{ marginBottom: "24px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5" }}>
                                <th style={{
                                    textAlign: "left",
                                    padding: "12px 8px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "#666",
                                    width: "45%"
                                }}>
                                    {t.description}
                                </th>
                                <th style={{
                                    textAlign: "center",
                                    padding: "12px 8px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "#666",
                                    width: "10%"
                                }}>
                                    {t.qty}
                                </th>
                                <th style={{
                                    textAlign: "right",
                                    padding: "12px 8px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "#666",
                                    width: "20%"
                                }}>
                                    {t.unitPrice}
                                </th>
                                <th style={{
                                    textAlign: "right",
                                    padding: "12px 8px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "#666",
                                    width: "25%"
                                }}>
                                    {t.amount}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: "24px 8px", textAlign: "center", color: "#999" }}>
                                        {t.noItems}
                                    </td>
                                </tr>
                            ) : (
                                invoice.items.map((item) => {
                                    const originalTotal = item.quantity * item.pricePerUnit;
                                    const discountedTotal = originalTotal * (1 - item.discount / 100);
                                    const hasDiscount = item.discount > 0;

                                    return (
                                        <tr key={item.id} style={{ borderBottom: "1px solid #e5e5e5" }}>
                                            <td style={{
                                                padding: "16px 8px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                color: "#1a1a1a"
                                            }}>
                                                {item.name || "Untitled"}
                                            </td>
                                            <td style={{
                                                padding: "16px 8px",
                                                textAlign: "center",
                                                fontSize: "14px",
                                                color: "#1a1a1a"
                                            }}>
                                                {item.quantity}
                                            </td>
                                            <td style={{
                                                padding: "16px 8px",
                                                textAlign: "right",
                                                fontSize: "14px",
                                                color: "#1a1a1a"
                                            }}>
                                                {currencyCode} {item.pricePerUnit.toFixed(2)}
                                            </td>
                                            <td style={{
                                                padding: "16px 8px",
                                                textAlign: "right",
                                                fontSize: "14px",
                                                color: "#1a1a1a"
                                            }}>
                                                {hasDiscount ? (
                                                    <div>
                                                        {/* Original price struck through */}
                                                        <div style={{
                                                            textDecoration: "line-through",
                                                            color: "#999",
                                                            fontSize: "12px"
                                                        }}>
                                                            {currencyCode} {originalTotal.toFixed(2)}
                                                        </div>
                                                        {/* Discounted price with discount badge */}
                                                        <div style={{
                                                            fontWeight: "600",
                                                            color: "#1a1a1a",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "flex-end",
                                                            gap: "6px"
                                                        }}>
                                                            <span style={{
                                                                fontSize: "10px",
                                                                backgroundColor: "#dcfce7",
                                                                color: "#166534",
                                                                padding: "2px 6px",
                                                                borderRadius: "4px",
                                                                fontWeight: "500"
                                                            }}>
                                                                -{item.discount}%
                                                            </span>
                                                            {currencyCode} {discountedTotal.toFixed(2)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontWeight: "500" }}>
                                                        {currencyCode} {originalTotal.toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Total Section */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                    <div style={{ width: "280px" }}>
                        {/* Always show subtotal if there's discount or tax */}
                        {(totalDiscount > 0 || invoice.taxRate > 0) && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px" }}>
                                <span style={{ color: "#666" }}>{t.subtotal}</span>
                                <span style={{ color: "#1a1a1a" }}>{currencyCode} {subtotal.toFixed(2)}</span>
                            </div>
                        )}
                        {totalDiscount > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px" }}>
                                <span style={{ color: "#666" }}>{t.discount}</span>
                                <span style={{ color: "#dc2626" }}>-{currencyCode} {totalDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        {invoice.taxRate > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px" }}>
                                <span style={{ color: "#666" }}>{t.tax} ({invoice.taxRate}%)</span>
                                <span style={{ color: "#1a1a1a" }}>{currencyCode} {tax.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "12px 0",
                            borderTop: totalDiscount > 0 || invoice.taxRate > 0 ? "1px solid #e5e5e5" : "none",
                            marginTop: totalDiscount > 0 || invoice.taxRate > 0 ? "8px" : "0"
                        }}>
                            <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>{t.amountPaid}</span>
                            <span style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a1a" }}>
                                {currencyCode} {total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Signature Section */}
                <div style={{ marginTop: "48px", display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ textAlign: "center", minWidth: "180px" }}>
                        <img
                            src="/Signature/Signature.png"
                            alt="Company Signature"
                            style={{
                                height: "60px",
                                width: "auto",
                                objectFit: "contain",
                                marginBottom: "-10px",
                                display: "block",
                                marginLeft: "auto",
                                marginRight: "auto"
                            }}
                        />
                        <div style={{
                            borderTop: "1px solid #1a1a1a",
                            paddingTop: "8px",
                            width: "100%"
                        }}>
                            <p style={{
                                fontSize: "12px",
                                color: "#666",
                                margin: 0
                            }}>
                                {t.authorizedSignature}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Note */}
                {invoice.note && (
                    <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e5e5e5" }}>
                        <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0" }}>
                            {t.notes}
                        </p>
                        <p style={{ fontSize: "14px", color: "#666", margin: 0, whiteSpace: "pre-wrap" }}>
                            {invoice.note}
                        </p>
                    </div>
                )}

                {/* Thank You */}
                <div style={{ marginTop: "24px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                        {t.thankYou}
                    </p>
                </div>

                {/* Footer */}
                <div style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "48px",
                    right: "48px",
                    display: "flex",
                    justifyContent: "flex-end"
                }}>
                    <p style={{ fontSize: "12px", color: "#999", margin: 0 }}>
                        {receiptNum} &nbsp; {t.pageOf(1, 1)}
                    </p>
                </div>
            </div>
        );
    }
);
