export type PartnerCategory =
  | 'Development Partners'
  | 'Federal Government & Regulatory Agencies'
  | 'Academic Partners'
  | 'International & Public Diplomacy Partners'
  | 'INGO & Civil Society Partners'
  | 'Educational Institutions'
  | 'Faith-Based & Community Partners';

export interface Partner {
  id: string;
  name: string;
  logo: string;
  logoAlt: string;
  category: PartnerCategory;
  description?: string;
  website?: string;
}

export const partners: Partner[] = [
  // Development Partners - the SEPIN-SUSI Project, under which Toko Academy
  // delivers the MSME Capacity Development Training (see /msme). First, so the
  // homepage strip shows them. Same files as the /msme page.
  {
    id: 'eu',
    name: 'European Union',
    logo: '/images/msme/eu-cofunded.svg',
    logoAlt: 'Co-funded by the European Union',
    category: 'Development Partners',
    description: 'Co-funder of the SEPIN-SUSI Project'
  },
  {
    id: 'german-cooperation',
    name: 'German Cooperation (Deutsche Zusammenarbeit)',
    logo: '/images/msme/german-cooperation.png',
    logoAlt: 'German Cooperation, Deutsche Zusammenarbeit',
    category: 'Development Partners',
    description: 'Co-funder of the SEPIN-SUSI Project'
  },
  {
    id: 'fgn',
    name: 'Federal Government of Nigeria',
    logo: '/images/msme/nigeria-coat-of-arms.png',
    logoAlt: 'Coat of arms of the Federal Republic of Nigeria',
    category: 'Development Partners',
    description: 'Government partner on the SEPIN-SUSI Project'
  },
  {
    id: 'giz',
    name: 'GIZ',
    logo: '/images/msme/giz-logo.svg',
    logoAlt: 'GIZ — Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH',
    category: 'Development Partners',
    description: 'Implementing agency of the SEPIN-SUSI Project'
  },

  // Federal Government & Regulatory Agencies
  {
    id: 'nscdc',
    name: 'Nigeria Security & Civil Defence Corps',
    logo: '/images/Logos/Nigeria Security & Civil Defence Corps Logo.png',
    logoAlt: 'NSCDC Logo',
    category: 'Federal Government & Regulatory Agencies',
    description: 'Federal agency partner for digital literacy and AI training'
  },
  {
    id: 'npf',
    name: 'Nigeria Police Force',
    logo: '/images/Logos/The Nigeria Police Force.jpg',
    logoAlt: 'Nigeria Police Force Logo',
    category: 'Federal Government & Regulatory Agencies',
    description: 'Federal agency partner for digital literacy and AI training'
  },
  {
    id: 'frsc',
    name: 'Federal Road Safety Corps',
    logo: '/images/Logos/Federal Road Safety Corps Logo.png',
    logoAlt: 'FRSC Logo',
    category: 'Federal Government & Regulatory Agencies',
    description: 'Federal agency partner for digital literacy and AI training'
  },
  {
    id: 'nmdpra',
    name: 'Nigerian Midstream & Downstream Petroleum Regulatory Authority',
    logo: '/images/Logos/Midstream and downstream petroleum regulatory authority nmdpra Logo.png',
    logoAlt: 'NMDPRA Logo',
    category: 'Federal Government & Regulatory Agencies',
    description: 'Federal agency partner for digital literacy and AI training'
  },

  // Academic Partners
  {
    id: 'aun',
    name: 'American University of Nigeria',
    logo: '/images/Logos/American University of Nigeria Logo.png',
    logoAlt: 'American University of Nigeria Logo',
    category: 'Academic Partners',
    description: 'Academic collaboration on curriculum design and youth development'
  },

  // International & Public Diplomacy Partners
  {
    id: 'american-space-yola',
    name: 'American Space Yola',
    logo: '/images/Logos/yola window on america logo.jpeg',
    logoAlt: 'American Space Yola Logo',
    category: 'International & Public Diplomacy Partners',
    description: 'U.S. Embassy programme for world-class AI and computer science education'
  },
  {
    id: 'codeorg',
    name: 'Code.org Global Partner Community',
    logo: '/images/Logos/Code.org Global Partner Community logo.jpg',
    logoAlt: 'Code.org Global Partner Community Logo',
    category: 'International & Public Diplomacy Partners',
    description: 'Global partner network for AI and computer science education'
  },

  // INGO & Civil Society Partners
  {
    id: 'tent2school',
    name: 'Tent2School Initiative',
    logo: '/images/Logos/Tent2School Initiative logo.png',
    logoAlt: 'Tent2School Initiative Logo',
    category: 'INGO & Civil Society Partners',
    description: 'Implementing partner for community-facing programming'
  },
  {
    id: 'timothy-initiative',
    name: 'The Timothy Initiative',
    logo: '/images/Logos/The Timothy Initiative logo.webp',
    logoAlt: 'The Timothy Initiative Logo',
    category: 'INGO & Civil Society Partners',
    description: 'Implementing partner for GBV awareness and communications training'
  },

  // Educational Institutions
  {
    id: 'concordia-junior-academy',
    name: 'Concordia Junior Academy Yola',
    logo: '/images/Logos/Concordia Junior Academy Yola logo.jpg',
    logoAlt: 'Concordia Junior Academy Yola Logo',
    category: 'Educational Institutions',
    description: 'Teacher training and school-based technology education partnership'
  },

  // Faith-Based & Community Partners
  // Note: Family Worship Centre Yola logo not yet available
];

export const partnersByCategory = partners.reduce((acc, partner) => {
  if (!acc[partner.category]) {
    acc[partner.category] = [];
  }
  acc[partner.category].push(partner);
  return acc;
}, {} as Record<PartnerCategory, Partner[]>);

export const partnerCategoryDescriptions: Record<PartnerCategory, string> = {
  'Development Partners': 'The SEPIN-SUSI Project, under which Toko Academy delivers the free MSME Capacity Development Training for businesses in Yola North and Yola South: co-funded by the European Union and German Cooperation, and implemented by GIZ with the Federal Government of Nigeria.',
  'Federal Government & Regulatory Agencies': 'Toko Academy delivered structured AI and digital literacy training to officers across these federal agencies in November 2025.',
  'Academic Partners': 'Academic collaboration on curriculum design and youth development programming.',
  'International & Public Diplomacy Partners': 'International public diplomacy and global partner network engagements bringing world-class AI and computer science education to North-East Nigeria.',
  'INGO & Civil Society Partners': 'Implementing partners for community-facing programming, GBV awareness, and communications training.',
  'Educational Institutions': 'Teacher training and school-based technology education partnership.',
  'Faith-Based & Community Partners': 'Community outreach and faith-based engagement on digital skills and inclusion.'
};
