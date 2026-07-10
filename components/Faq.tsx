import { ChevronDownIcon } from "@/components/icons";

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="faq-item group rounded-2xl border border-blush bg-white shadow-sm open:shadow-md"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-semibold text-graphite">
            {item.q}
            <ChevronDownIcon className="faq-chevron h-5 w-5 shrink-0 text-magenta transition-transform" />
          </summary>
          <p className="px-5 pb-5 text-sm leading-relaxed text-graphite/75">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
