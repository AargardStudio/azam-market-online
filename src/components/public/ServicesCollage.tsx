import React from 'react';
import { Globe2, Tag, Sparkles, Layers, MessageCircle, ArrowUpRight } from 'lucide-react';

const HELPLINE = '923004211985';

const openWhatsApp = (topic: string) => {
  const msg = encodeURIComponent(`Hello Azam Market Online, I am interested in: ${topic}`);
  window.open(`https://wa.me/${HELPLINE}?text=${msg}`, '_blank', 'noopener');
};

interface Tile {
  title: string;
  note: string;
  icon: React.ReactNode;
  className: string; // grid span + colours
  topic: string;
}

const TILES: Tile[] = [
  {
    title: 'Talk to vendors',
    note: "Tell them what you're looking for",
    icon: <MessageCircle className="w-7 h-7" />,
    className: 'col-span-2 row-span-2 bg-[#0F5C3A] text-white',
    topic: 'Talk to vendors',
  },
  {
    title: 'Export services',
    note: 'Ship wholesale fabric worldwide',
    icon: <Globe2 className="w-6 h-6" />,
    className: 'col-span-2 bg-amber-100 text-amber-950',
    topic: 'Export services',
  },
  {
    title: 'Whitelabel',
    note: 'Your name on ready products',
    icon: <Layers className="w-6 h-6" />,
    className: 'bg-rose-100 text-rose-950',
    topic: 'Whitelabel',
  },
  {
    title: 'Private label service',
    note: 'Made to your spec',
    icon: <Tag className="w-6 h-6" />,
    className: 'bg-sky-100 text-sky-950',
    topic: 'Private label service',
  },
  {
    title: 'Start your own brand',
    note: 'From fabric to finished label',
    icon: <Sparkles className="w-6 h-6" />,
    className: 'col-span-2 bg-gray-900 text-white',
    topic: 'Start your own brand',
  },
];

export const ServicesCollage: React.FC = () => (
  <section aria-label="Services" className="space-y-3">
    <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Services for buyers</h2>
    <div className="grid grid-cols-2 sm:grid-cols-4 auto-rows-[110px] sm:auto-rows-[130px] gap-3">
      {TILES.map((t) => (
        <button
          key={t.title}
          type="button"
          onClick={() => openWhatsApp(t.topic)}
          className={`group relative text-left rounded-2xl p-4 flex flex-col justify-between overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${t.className}`}
        >
          <div className="flex items-start justify-between">
            {t.icon}
            <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100" />
          </div>
          <div>
            <div className="font-serif font-bold leading-tight text-base sm:text-lg">{t.title}</div>
            <div className="text-xs opacity-80 mt-0.5">{t.note}</div>
          </div>
        </button>
      ))}
    </div>
  </section>
);
