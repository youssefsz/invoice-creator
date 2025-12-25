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
import { Plus, Settings, MessageSquare } from "lucide-react";

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
    <div className={`relative min-h-[100dvh] bg-background transition-opacity duration-150 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
      <PageTransition viewKey="dashboard">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              {/* Left: Message Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <MessageSquare className="h-6 w-6 stroke-[1.5]" />
              </Button>

              {/* Center: Title */}
              <h1 className="font-bold text-2xl text-center flex-1">Invoices</h1>

              {/* Right: Settings Icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Settings className="h-6 w-6 stroke-[1.5]" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 pb-24 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-transparent p-0 mb-6 border-b border-transparent rounded-none">
              <TabsTrigger
                value="unpaid"
                className="flex-1 rounded-none border-b-2 border-transparent bg-transparent pb-3 pt-2 text-base font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent hover:text-foreground/80"
              >
                Unpaid
              </TabsTrigger>
              <TabsTrigger
                value="paid"
                className="flex-1 rounded-none border-b-2 border-transparent bg-transparent pb-3 pt-2 text-base font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent hover:text-foreground/80"
              >
                Paid
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unpaid" className="mt-0 animate-in fade-in-0 duration-200">
              <InvoiceList
                invoices={unpaidInvoices}
                onInvoiceClick={handleInvoiceClick}
                headerTitle="Balance due"
              />
            </TabsContent>

            <TabsContent value="paid" className="mt-0 animate-in fade-in-0 duration-200">
              <InvoiceList
                invoices={paidInvoices}
                onInvoiceClick={handleInvoiceClick}
                headerTitle="Total this year"
              />
            </TabsContent>
          </Tabs>
        </main>

      </PageTransition>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <Button
          onClick={handleCreateNew}
          className="h-14 rounded-full px-8 shadow-lg text-lg font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Create invoice
        </Button>
      </div>

      {/* Company Settings Dialog */}
      <CompanySettings
        open={showSettings}
        onOpenChange={setShowSettings}
        onSave={loadCompanyInfo}
      />
    </div>
  );
}
