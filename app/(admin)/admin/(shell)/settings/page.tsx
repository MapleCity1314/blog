import React from "react";
import { Save, Shield, User, FileText } from "lucide-react";
import { SystemInput } from "@/components/ui/system-input";
import { getAboutData } from "@/lib/data/about";
import { updateAboutRaw } from "./actions";
import { AboutDataForm } from "./components/about-data-form";

export default async function AdminSettingsPage() {
  const aboutData = await getAboutData();
  return (
    <div className="max-w-3xl space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <FileText size={18} />
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest">
            About_Data
          </h3>
        </div>
        <AboutDataForm initialData={aboutData} action={updateAboutRaw} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <User size={18} />
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest">
            Admin_Profile
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SystemInput label="Public_Alias" defaultValue="0xPresto" />
          <SystemInput label="System_Role" defaultValue="Administrator" />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Shield size={18} />
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest">
            Security_Protocols
          </h3>
        </div>
        <div className="space-y-4">
          <SettingToggle
            label="Enable Two-Factor Authentication"
            desc="Requires a security key for system entry."
            active
          />
          <SettingToggle
            label="Stealth Mode"
            desc="Hide admin entry point from search engine crawlers."
          />
          <SettingToggle
            label="Auto-Backup Database"
            desc="Sync logs to IPFS every 24 hours."
            active
          />
        </div>
      </section>

      <div className="pt-8 border-t border-border/60 flex justify-end">
        <button className="flex items-center gap-2 bg-foreground text-background px-8 py-3 text-xs font-mono font-bold uppercase tracking-widest hover:bg-primary transition-all">
          <Save size={16} /> Write_To_Disk
        </button>
      </div>
    </div>
  );
}

type SettingToggleProps = {
  label: string;
  desc: string;
  active?: boolean;
};

function SettingToggle({ label, desc, active = false }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-border/40 bg-background/20">
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[10px] text-muted-foreground uppercase mt-1">
          {desc}
        </p>
      </div>
      <button
        type="button"
        className={`w-12 h-6 flex items-center px-1 transition-colors ${
          active ? "bg-primary" : "bg-muted"
        }`}
      >
        <div
          className={`h-4 w-4 bg-background transition-transform ${
            active ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
