"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { EncryptedContact } from "@/components/about/encrypted-contact";
import { NeuralLinkModule } from "@/components/about/neural-link-module";

type Contact = {
  email: string;
  phone: string;
  realEmail: string;
  realPhone: string;
};

type Profile = {
  name: string;
  alias: string;
  contact: Contact;
};

type Partner = {
  myAvatar: string;
  partnerAvatar: string;
  daysTogether: number;
  alias1: string;
  alias2: string;
};

type AboutHeroProps = {
  profile: Profile;
  partner: Partner;
  avatarSrc: string;
  isDecrypted: boolean;
  onDecrypt: () => void;
};

export function AboutHero({ profile, partner, avatarSrc, isDecrypted, onDecrypt }: AboutHeroProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      <div className="md:col-span-4 flex flex-col gap-6">
        <div className="relative w-48 h-48 rounded-full border border-border bg-background/50 backdrop-blur-md flex items-center justify-center overflow-hidden group mx-auto md:mx-0">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500" />
          <div className="scale-75 group-hover:scale-90 transition-transform duration-500 text-muted-foreground/50 w-full h-full flex items-center justify-center">
            {imageError ? (
              <User size={64} />
            ) : (
              <img
                src={avatarSrc}
                alt={profile.name}
                className="w-full h-full object-cover rounded-full"
                onError={() => setImageError(true)}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent w-full h-1 animate-scan" />
        </div>

        <NeuralLinkModule partner={partner} />
      </div>

      <div className="md:col-span-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold uppercase border border-primary/20">
            Level 20 // {profile.alias}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <h1 className="text-5xl md:text-7xl font-logo leading-none">{profile.name}</h1>

        <p className="text-lg text-muted-foreground font-light max-w-2xl">
          Full-stack developer obsessed with <span className="text-foreground font-medium">Engineering Quality</span> and{" "}
          <span className="text-foreground font-medium">AI Agents</span>. Contributor to Next.js. Building the future of
          Web3 & Quant tools.
        </p>

        <EncryptedContact contact={profile.contact} isDecrypted={isDecrypted} onDecrypt={onDecrypt} />
      </div>
    </section>
  );
}
