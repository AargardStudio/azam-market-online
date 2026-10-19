import { PUBLIC_FAQS } from '../../lib/publicFaq';

export function PublicFaq() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs sm:p-7" aria-labelledby="public-faq-title">
      <div className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#C9952A]">Buyer guidance</p>
        <h2 id="public-faq-title" className="mt-1 font-serif text-2xl font-bold text-gray-900">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Quick answers about finding and contacting wholesale fabric stalls through the directory.
        </p>
      </div>

      <div className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
        {PUBLIC_FAQS.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-gray-900">
              <span>{item.question}</span>
              <span aria-hidden="true" className="text-lg text-[#0F5C3A] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-3xl pr-8 text-sm leading-6 text-gray-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
