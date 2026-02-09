import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PostCoverProps = {
  image: string;
};

export function PostCover({ image }: PostCoverProps) {
  return (
    <div className="relative h-[35vh] md:h-[45vh] w-full overflow-hidden border-b border-border/60">
      <img
        src={image}
        alt="Cover"
        className="h-full w-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

      <div className="absolute top-10 left-6 md:left-20">
        <Link
          href="/posts"
          className="group flex items-center gap-2 px-3 py-1.5 bg-background/60 backdrop-blur-md border border-border/40 text-[10px] font-mono uppercase tracking-[0.2em] text-primary hover:border-primary transition-all"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          cd .. / logs
        </Link>
      </div>
    </div>
  );
}
