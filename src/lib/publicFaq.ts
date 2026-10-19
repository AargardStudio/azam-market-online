export interface PublicFaqItem {
  question: string;
  answer: string;
}

export const PUBLIC_FAQS: readonly PublicFaqItem[] = [
  {
    question: 'What is Azam Market Online?',
    answer:
      'Azam Market Online is a wholesale fabric directory. It helps buyers browse listed stalls, products and catalogues, then contact a stall directly.',
  },
  {
    question: 'Can I place an order directly on Azam Market Online?',
    answer:
      'Azam Market Online is a directory rather than the seller. Use the contact options on a stall page to ask that business about ordering, payment and delivery.',
  },
  {
    question: 'How do I confirm current prices and product availability?',
    answer:
      'Contact the listed stall before ordering. Prices, stock, minimum quantities and delivery terms can change and should be confirmed directly with the vendor.',
  },
  {
    question: 'How can I find suppliers for a specific fabric category or market?',
    answer:
      'Open a category or market page, or use the directory filters and search. Each result links to the stall page and its available contact details.',
  },
  {
    question: 'Where can I find a stall catalogue?',
    answer:
      'When a vendor has published a catalogue, it appears on that stall listing. Contact the vendor directly if you need newer designs or additional product details.',
  },
] as const;
