"use client";

import { Terminal } from "lucide-react";
import { SectionTitle } from "@/components/about/section-title";

type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  desc: string;
  tech: string[];
  highlight: string;
};

type AboutExperienceProps = {
  experiences: Experience[];
};

export function AboutExperience({ experiences }: AboutExperienceProps) {
  return (
    <section>
      <SectionTitle title="Execution_Logs (Projects)" icon={<Terminal size={16} />} />
      <div className="relative border-l border-dashed border-border ml-3 md:ml-6 space-y-12 pb-12">
        {experiences.map((exp) => (
          <div key={exp.id} className="relative pl-8 md:pl-12 group">
            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border border-background bg-muted-foreground group-hover:bg-primary group-hover:scale-125 transition-all" />
            <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-2">
              <h3 className="text-2xl font-bold font-sans group-hover:text-primary transition-colors">{exp.company}</h3>
              <span className="font-mono text-xs text-muted-foreground">{exp.period}</span>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded border border-border text-muted-foreground">
                {exp.role}
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-3xl leading-relaxed">{exp.desc}</p>
            <div className="bg-muted/30 rounded-lg p-3 border-l-2 border-primary/50 text-sm text-foreground/80 mb-4">
              <span className="font-bold text-primary mr-2">Impact:</span>
              {exp.highlight}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
