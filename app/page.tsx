"use client";

import { useState, useEffect, useCallback } from "react";
import { Invoice } from "@/lib/types";
import { getInvoices } from "@/lib/storage";
import { InvoiceList } from "@/components/invoice-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const TAB_STORAGE_KEY = "invoice-app-active-tab";

export default function Home() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState("unpaid");

  // Load tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
    if (savedTab === "paid" || savedTab === "unpaid") {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Save to localStorage
    localStorage.setItem(TAB_STORAGE_KEY, value);
  };

  const loadInvoices = useCallback(() => {
    setInvoices(getInvoices());
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const unpaidInvoices = invoices.filter((inv) => !inv.isPaid);
  const paidInvoices = invoices.filter((inv) => inv.isPaid);

  const handleInvoiceClick = (invoice: Invoice) => {
    router.push(`/invoice/${invoice.id}`);
  };

  const handleCreateNew = () => {
    router.push("/invoice/new");
  };

  return (
    <div className="relative min-h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Left: Settings Icon */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Link href="/settings">
                <Settings className="size-6" />
              </Link>
            </Button>

            {/* Center: Title */}
            <h1 className="font-bold text-2xl text-center flex-1">Invoices</h1>

            {/* Right: Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-24 sm:px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full bg-transparent p-0 mb-6 rounded-none h-auto gap-0">
            <TabsTrigger
              value="unpaid"
              className="relative flex-1 rounded-none bg-transparent py-3 text-lg font-medium text-muted-foreground/60 shadow-none transition-colors data-[state=active]:text-foreground data-[state=active]:font-bold data-[state=active]:shadow-none data-[state=active]:bg-transparent hover:text-muted-foreground after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-12 after:h-[3px] after:rounded-full after:bg-foreground after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100"
            >
              Unpaid
            </TabsTrigger>
            <TabsTrigger
              value="paid"
              className="relative flex-1 rounded-none bg-transparent py-3 text-lg font-medium text-muted-foreground/60 shadow-none transition-colors data-[state=active]:text-foreground data-[state=active]:font-bold data-[state=active]:shadow-none data-[state=active]:bg-transparent hover:text-muted-foreground after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-12 after:h-[3px] after:rounded-full after:bg-foreground after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100"
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

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <Button
          onClick={handleCreateNew}
          className="h-14 rounded-full px-8 shadow-lg text-lg font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Create invoice
        </Button>
      </div>
    </div>
  );
}
