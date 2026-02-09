import { Terminal } from "lucide-react";
import { SectionTitle } from "@/components/about/section-title";
import type { AboutExperience as Experience } from "@/lib/data/about";

type AboutExperienceProps = {
  experiences: Experience[];
};

export function AboutExperience({ experiences }: AboutExperienceProps) {
  return (
    <section>
      <SectionTitle title="Execution_Logs (Experience)" icon={<Terminal size={16} />} />
      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="group relative border border-border/60 p-6 bg-background/40 hover:border-primary/40 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono font-bold text-primary italic">[{exp.id}]</span>
                <h3 className="text-xl font-bold tracking-tight uppercase group-hover:text-primary transition-colors">{exp.company}</h3>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground tracking-widest">{exp.period}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-4 font-light italic">
              {exp.desc}
            </p>
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase bg-primary/10 text-primary px-2 py-0.5 border border-primary/20">
                    {exp.role}
                </span>
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">
                    Impact_Verified
                </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
