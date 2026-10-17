import { Category, Market } from '../../types';

interface DirectoryLandingIntroProps {
  category?: Category;
  market?: Market;
  resultCount: number;
}

export function DirectoryLandingIntro({ category, market, resultCount }: DirectoryLandingIntroProps) {
  if (!category && !market) return null;

  const subject = category
    ? `${category.name} wholesale suppliers`
    : `wholesale fabric suppliers in ${market?.name}`;
  const location = market ? `${market.name}, ${market.city}` : 'Azam Market Online';

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6 shadow-xs" aria-labelledby="directory-landing-title">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#C9952A]">Wholesale directory</p>
      <h1 id="directory-landing-title" className="mt-1 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
        {category ? `${category.name} Wholesale Suppliers` : `${market?.name} Wholesale Fabric Directory`}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Find {subject} listed in {location}. Browse {resultCount} active stall{resultCount === 1 ? '' : 's'},
        review available products and catalogues, and contact the stall directly for current wholesale details.
      </p>
    </section>
  );
}
