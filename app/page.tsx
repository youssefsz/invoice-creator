"use client";

import { useState, useEffect, useCallback } from "react";
import { Invoice, CompanyInfo } from "@/lib/types";
import { getInvoices, getCompanyInfo } from "@/lib/storage";
import { InvoiceList } from "@/components/invoice-list";
import { InvoiceForm } from "@/components/invoice-form";
import { InvoiceView } from "@/components/invoice-view";
import { CompanySettings } from "@/components/company-settings";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Receipt, Settings } from "lucide-react";

type View = "dashboard" | "create" | "edit" | "view";

// Page transition wrapper component
function PageTransition({ children, viewKey }: { children: React.ReactNode; viewKey: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger the animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      key={viewKey}
      className={`transition-all duration-300 ease-out ${isVisible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-2"
        }`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({ name: "", email: "", phone: "", address: "" });
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState("unpaid");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const loadInvoices = useCallback(() => {
    setInvoices(getInvoices());
  }, []);

  const loadCompanyInfo = useCallback(() => {
    setCompanyInfo(getCompanyInfo());
  }, []);

  useEffect(() => {
    loadInvoices();
    loadCompanyInfo();
  }, [loadInvoices, loadCompanyInfo]);

  const unpaidInvoices = invoices.filter((inv) => !inv.isPaid);
  const paidInvoices = invoices.filter((inv) => inv.isPaid);

  // Smooth view transition handler
  const changeView = (newView: View, invoice?: Invoice | null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(newView);
      if (invoice !== undefined) {
        setSelectedInvoice(invoice);
      }
      setIsTransitioning(false);
    }, 150);
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    changeView("view", invoice);
  };

  const handleCreateNew = () => {
    changeView("create", null);
  };

  const handleEdit = () => {
    changeView("edit");
  };

  const handleClose = () => {
    loadInvoices();
    changeView("dashboard", null);
  };

  const handleSave = () => {
    loadInvoices();
    changeView("dashboard", null);
  };

  const handleStatusChange = () => {
    loadInvoices();
  };

  const handleDelete = () => {
    loadInvoices();
    changeView("dashboard", null);
  };

  // Render invoice form
  if (currentView === "create" || currentView === "edit") {
    return (
      <div className={`min-h-full bg-background transition-opacity duration-150 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
        <PageTransition viewKey={currentView}>
          <InvoiceForm
            existingInvoice={currentView === "edit" ? selectedInvoice ?? undefined : undefined}
            onClose={handleClose}
            onSave={handleSave}
            companyInfo={companyInfo}
          />
        </PageTransition>
      </div>
    );
  }

  // Render invoice view
  if (currentView === "view" && selectedInvoice) {
    return (
      <div className={`min-h-full bg-background transition-opacity duration-150 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
        <PageTransition viewKey={`view-${selectedInvoice.id}`}>
          <InvoiceView
            invoice={selectedInvoice}
            onClose={handleClose}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            companyInfo={companyInfo}
          />
        </PageTransition>
      </div>
    );
  }

  // Render dashboard
  return (
    <div className={`min-h-full bg-background transition-opacity duration-150 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
      <PageTransition viewKey="dashboard">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95">
                  <Receipt className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-xl">Invoices</h1>
                  <p className="text-sm text-muted-foreground">
                    {invoices.length} total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  onClick={handleCreateNew}
                  size="sm"
                  className="transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="unpaid" className="flex-1 gap-2 transition-all duration-200">
                <FileText className="h-4 w-4" />
                Unpaid
                {unpaidInvoices.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                    {unpaidInvoices.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="paid" className="flex-1 gap-2 transition-all duration-200">
                <FileText className="h-4 w-4" />
                Paid
                {paidInvoices.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-muted-foreground/20 text-muted-foreground">
                    {paidInvoices.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unpaid" className="mt-0 animate-in fade-in-0 duration-200">
              <InvoiceList
                invoices={unpaidInvoices}
                onInvoiceClick={handleInvoiceClick}
              />
            </TabsContent>

            <TabsContent value="paid" className="mt-0 animate-in fade-in-0 duration-200">
              <InvoiceList
                invoices={paidInvoices}
                onInvoiceClick={handleInvoiceClick}
              />
            </TabsContent>
          </Tabs>
        </main>
      </PageTransition>

      {/* Company Settings Dialog */}
      <CompanySettings
        open={showSettings}
        onOpenChange={setShowSettings}
        onSave={loadCompanyInfo}
      />
    </div>
  );
}
