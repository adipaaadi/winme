import { ChevronDownIcon } from './icons';

export default function FAQ({ items }) {
  return (
    <div className="faq divide-y divide-line rounded-[20px] border border-line bg-cream-50">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-navy transition-colors hover:text-navy-800">
            {item.question}
            <ChevronDownIcon className="h-5 w-5 shrink-0 text-coral-600 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="px-6 pb-5 text-sm leading-relaxed text-navy-500">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
