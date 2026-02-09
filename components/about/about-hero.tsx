import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { NeuralLinkModule } from "@/components/about/neural-link-module";
import type { AboutHeroIntroPart, AboutHeroMeta, AboutPartner, AboutProfile } from "@/lib/data/about";

type AboutHeroProps = {
  profile: AboutProfile;
  partner: AboutPartner;
  avatarSrc: string;
  intro: AboutHeroIntroPart[];
  meta: AboutHeroMeta;
};

export function AboutHero({ profile, partner, avatarSrc, intro, meta }: AboutHeroProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
      <div className="md:col-span-4 flex flex-col gap-6">
        <div className="relative w-56 h-56 border border-border/60 bg-background/50 backdrop-blur-md p-2 mx-auto md:mx-0 group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-full h-full overflow-hidden border border-border/40 bg-muted/20">
            <Image
              src={avatarSrc}
              alt={profile.name}
              width={224}
              height={224}
              className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              priority
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-1 bg-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-scan absolute" />
            </div>
          </div>

          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />
        </div>

        <NeuralLinkModule partner={partner} />
      </div>

      <div className="md:col-span-8 pt-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
            <ShieldCheck size={12} />
            Verified_Identity
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            {profile.alias}
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase italic leading-none mb-8">
          {profile.name}
        </h1>

        <div className="space-y-6 max-w-2xl">
          <p className="text-xl text-muted-foreground font-light leading-relaxed italic border-l-2 border-border/60 pl-6">
            {intro.map((part, index) =>
              part.highlight ? (
                <span
                  key={`${part.text}-${index}`}
                  className="text-foreground font-medium underline decoration-primary/30 underline-offset-4"
                >
                  {part.text}
                </span>
              ) : (
                <span key={`${part.text}-${index}`}>{part.text}</span>
              )
            )}
          </p>

          <div className="flex items-center gap-8 py-6 border-y border-border/40 font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{meta.roleLabel}</span>
              <span className="text-sm font-bold uppercase">{profile.role}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{meta.locationLabel}</span>
              <span className="text-sm font-bold uppercase">{profile.location}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
