import Link from "next/link";

type Props = {
  id?: string;
  title: string;
  subtitle: string;
  copy: string;
  meta: string;
  image?: string;
};

export default function PackageCard({ id, title, subtitle, copy, meta, image }: Props) {
  const CardContent = (
    <article className="group relative flex flex-col justify-end overflow-hidden rounded-3xl bg-black shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-transform hover:-translate-y-1 h-full min-h-[420px] cursor-pointer">
      {image && (
        <>
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </>
      )}
      
      <div className="relative z-10 space-y-3 p-6 md:p-8">
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#1fb4b4]">
          {meta}
        </p>
        <h3 className="font-serif text-xl uppercase tracking-[0.18em] text-white md:text-2xl">
          {title}
        </h3>
        <p className="text-xs uppercase tracking-[0.26em] text-neutral-300">
          {subtitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-200 line-clamp-3">{copy}</p>
      </div>
      <div className="relative z-10 flex items-center justify-between border-t border-white/20 px-6 py-4 text-[0.65rem] uppercase tracking-[0.26em] text-neutral-300 md:px-8">
        <span>Learn more</span>
        <span className="text-[#1fb4b4] group-hover:translate-x-1 group-hover:text-white transition-all">
          →
        </span>
      </div>
    </article>
  );

  return id ? (
    <Link href={`/travel/${id}`} className="block h-full">
      {CardContent}
    </Link>
  ) : (
    CardContent
  );
}

