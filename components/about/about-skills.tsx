import { Cpu } from "lucide-react";
import { SectionTitle } from "@/components/about/section-title";
import type { AboutSkillGroup } from "@/lib/data/about";

type AboutSkillsProps = {
  skills: AboutSkillGroup[];
};

export function AboutSkills({ skills }: AboutSkillsProps) {
  return (
    <section>
      <SectionTitle title="Neural_Modules (Skillset)" icon={<Cpu size={16} />} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-border/40 border border-border/40">
        {skills.map((skill) => (
          <div key={skill.category} className="p-6 bg-background group hover:bg-primary/[0.02] transition-colors">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary/60 mb-6 group-hover:text-primary transition-colors">
              {skill.category}
            </h3>
            <div className="flex flex-col gap-3">
              {skill.items.map((item) => (
                <span key={item} className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-2">
                  <span className="h-1 w-1 bg-border group-hover:bg-primary transition-colors" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
