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
  className: string; // grid span
  image: string;
  position?: string; // object-position for the photo
  topic: string;
}

const TILES: Tile[] = [
  {
    title: 'Talk to vendors',
    note: "Tell them what you're looking for",
    icon: <MessageCircle className="w-5 h-5" />,
    className: 'col-span-2 row-span-2 sm:col-span-2 sm:row-span-2 sm:col-start-1 sm:row-start-1',
    image: '/categories/3pc-unstitched.jpg',
    position: 'center 30%',
    topic: 'Talk to vendors',
  },
  {
    title: 'Export services',
    note: 'Ship wholesale fabric worldwide',
    icon: <Globe2 className="w-5 h-5" />,
    className: 'col-span-2 sm:col-span-2 sm:col-start-3 sm:row-start-1',
    image: '/categories/2pc-unstitched.jpg',
    position: 'center 25%',
    topic: 'Export services',
  },
  {
    title: 'Whitelabel',
    note: 'Your name on ready products',
    icon: <Layers className="w-5 h-5" />,
    className: 'sm:col-span-2 sm:col-start-5 sm:row-start-1',
    image: '/categories/bases.jpg',
    position: 'center 30%',
    topic: 'Whitelabel',
  },
  {
    title: 'Private label service',
    note: 'Made to your spec',
    icon: <Tag className="w-5 h-5" />,
    className: 'sm:col-span-2 sm:col-start-5 sm:row-start-2',
    image: '/categories/brands.jpg',
    position: 'center 30%',
    topic: 'Private label service',
  },
  {
    title: 'Start your own brand',
    note: 'From fabric to finished label',
    icon: <Sparkles className="w-5 h-5" />,
    className: 'col-span-2 sm:col-span-2 sm:col-start-3 sm:row-start-2',
    image: '/hero-banner.jpg',
    position: 'center 35%',
    topic: 'Start your own brand',
  },
];

export const ServicesCollage: React.FC = () => (
  <section aria-label="Services" className="space-y-3">
    <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Services for buyers</h2>
    {/* Same proportions as the slideshow banner above/below it on desktop. */}
    <div className="sm:aspect-[21/8]">
    <div className="grid grid-cols-2 sm:grid-cols-6 sm:grid-rows-2 auto-rows-[120px] sm:auto-rows-auto gap-3 sm:h-full">
      {TILES.map((t) => (
        <button
          key={t.title}
          type="button"
          onClick={() => openWhatsApp(t.topic)}
          className={`group relative text-left rounded-2xl overflow-hidden text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg cursor-pointer bg-gray-800 ${t.className}`}
        >
          <img
            src={t.image}
            alt=""
            loading="lazy"
            style={{ objectPosition: t.position }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Photo missing: hide it so the dark tile background still reads well.
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="relative h-full p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {t.icon}
              </span>
              <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </div>
            <div>
              <div className="font-serif font-bold leading-tight text-base sm:text-lg drop-shadow">{t.title}</div>
              <div className="text-xs opacity-90 mt-0.5 drop-shadow">{t.note}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
    </div>
  </section>
);
