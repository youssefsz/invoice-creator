"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CompanyInfo } from "@/lib/types";
import { getCompanyInfo, saveCompanyInfo } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const router = useRouter();
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        setCompanyInfo(getCompanyInfo());
    }, []);

    const handleSave = () => {
        saveCompanyInfo(companyInfo);
        toast.success("Business profile saved successfully");
    };

    return (
        <div className="min-h-[100dvh] bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="px-4 py-4 sm:px-6 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="-ml-2 text-foreground/80 hover:text-foreground hover:bg-transparent"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="font-bold text-xl flex-1">Settings</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 py-6 sm:px-6 max-w-lg mx-auto space-y-8">
                {/* Business Profile Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-medium pb-2 border-b border-border/50">
                        <Building2 className="h-5 w-5" />
                        <h2>Business Profile</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Business Name *</Label>
                            <Input
                                id="company-name"
                                value={companyInfo.name}
                                onChange={(e) =>
                                    setCompanyInfo({ ...companyInfo, name: e.target.value })
                                }
                                placeholder="Your Company Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-email">Email</Label>
                            <Input
                                id="company-email"
                                type="email"
                                value={companyInfo.email}
                                onChange={(e) =>
                                    setCompanyInfo({ ...companyInfo, email: e.target.value })
                                }
                                placeholder="contact@yourcompany.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-phone">Phone</Label>
                            <Input
                                id="company-phone"
                                value={companyInfo.phone}
                                onChange={(e) =>
                                    setCompanyInfo({ ...companyInfo, phone: e.target.value })
                                }
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-address">Address</Label>
                            <Input
                                id="company-address"
                                value={companyInfo.address}
                                onChange={(e) =>
                                    setCompanyInfo({ ...companyInfo, address: e.target.value })
                                }
                                placeholder="123 Business St, City, Country"
                            />
                        </div>

                        <Button
                            onClick={handleSave}
                            className="w-full mt-6 bg-foreground text-background hover:bg-foreground/90 font-medium"
                            disabled={!companyInfo.name.trim()}
                        >
                            Save Changes
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    );
}
