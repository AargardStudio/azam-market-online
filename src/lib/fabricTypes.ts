// Shared list of fabric / clothing-material types vendors can tag a product
// with. Used to populate the "Fabric Type" dropdown in the vendor product
// form and the admin's stall product manager, with an Urdu label for the
// language toggle. An "Other" option in those forms still allows a vendor
// to type a custom value if their material isn't on this list.

export interface FabricTypeOption {
  slug: string;
  name: string;
  name_ur: string;
}

export const FABRIC_TYPES: FabricTypeOption[] = [
  { slug: 'velvet', name: 'Velvet', name_ur: 'ویلوٹ' },
  { slug: 'cotton', name: 'Cotton', name_ur: 'کاٹن' },
  { slug: 'lawn', name: 'Lawn', name_ur: 'لان' },
  { slug: 'dhanak', name: 'Dhanak', name_ur: 'دھنک' },
  { slug: 'wool', name: 'Wool', name_ur: 'اون' },
  { slug: 'pashmina', name: 'Pashmina', name_ur: 'پشمینہ' },
  { slug: 'shamooz', name: 'Shamooz', name_ur: 'شمعوز' },
  { slug: 'kataan-silk', name: 'Kataan Silk', name_ur: 'کتن سلک' },
  { slug: 'silky', name: 'Silky', name_ur: 'سلکی' },
  { slug: 'chamki', name: 'Chamki', name_ur: 'چمکی' },
  { slug: 'karandi', name: 'Karandi', name_ur: 'کرینڈی' },
  { slug: 'khaddar', name: 'Khaddar', name_ur: 'کھدر' },
  { slug: 'marina', name: 'Marina', name_ur: 'میرینا' },
  { slug: 'lawn-for-slips', name: 'Lawn for Slips', name_ur: 'سلپ لان' },
  { slug: 'linen', name: 'Linen', name_ur: 'لینن' },
  { slug: 'pilachi', name: 'Pilachi', name_ur: 'پلاچی' },
  { slug: 'chiffon', name: 'Chiffon', name_ur: 'شیفون' },
  { slug: 'organza', name: 'Organza', name_ur: 'آرگنزا' },
  { slug: 'net', name: 'Net', name_ur: 'نیٹ' },
];
