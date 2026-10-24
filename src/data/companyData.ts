export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  category: 'suction' | 'drainage' | 'etp' | 'civil';
  categoryLabel: string;
  caption: string;
  equipment: string;
  altText: string;
}

export interface ServiceItem {
  id: string;
  category: 'industrial-cleaning' | 'drainage-management' | 'civil-engineering';
  categoryTitle: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  equipment: string;
  suitableFor: string;
  image: string;
  features: string[];
  isMainService?: boolean;
}

export interface ClientItem {
  name: string;
  sector: string;
  location: string;
}

export interface IndustryItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  keyServices: string[];
  icon: string;
}

export const COMPANY_DETAILS = {
  name: 'BLUE BIRD ENTERPRISES',
  legalName: 'Blue Bird Enterprises',
  founder: 'Sarita Sinod Piwal',
  founderRole: 'Founder & Proprietor',
  tagline: 'Industrial Cleaning • Drainage Management • Civil Engineering',
  experience: '20+ Years Excellence',
  address: 'Pawane Village, Shop No. 403, Turbhe MIDC, Navi Mumbai, Maharashtra - 400705',
  shortAddress: 'Turbhe MIDC, Navi Mumbai, Maharashtra',
  phone1: '+91 98678 33456',
  phone1Raw: '9867833456',
  phone1Tel: 'tel:+919867833456',
  phone2: '+91 99873 24798',
  phone2Raw: '9987324798',
  phone2Tel: 'tel:+919987324798',
  callButtonConfig: {
    label: 'Call Now',
    bgColor: '#E53935',
    hoverBgColor: '#C62828',
    textColor: '#FFFFFF',
  },
  email: 'surupiwal@gmail.com',
  gstin: '27EFDPP3303H1ZL',
  pan: 'EFDPP3303H',
  whatsappNumber: '919867833456',
  whatsappDisplay: '+91 98678 33456',
  whatsappDefaultMsg: 'Hello Blue Bird Enterprises, I would like to enquire about your industrial services.',
  strategicVision: "To serve as India's most dependable and preferred partner for industrial environmental sanitation, suction tanker services, drainage maintenance, and specialized civil works by executing reliable, safe, sustainable, and technologically sound solutions.",
  managementCommitment: 'Delivering Excellence Through Quality, Safety & Unwavering Commitment.',
  businessHours: 'Monday – Saturday: 8:00 AM – 8:00 PM (Emergency Industrial Breakdown Support Available 24/7)',
  serviceRegions: [
    'Turbhe MIDC',
    'Pawane Industrial Area',
    'Rabale & TTC MIDC',
    'Mahape Industrial Hub',
    'Taloja MIDC',
    'Kopar Khairane & Airoli',
    'Vashi & Belapur',
    'Thane-Belapur Corridor',
    'Panvel & Rasayani',
    'Ambernath & Dombivli MIDC',
    'Patalganga & Roha MIDC',
    'Across Maharashtra'
  ]
};

// Attached authentic business photographs provided by the client
const resolveAsset = (assetPath: string): string => {
  const cleanPath = assetPath.replace(/^(\.\/|\/)+/, '');
  if (typeof window !== 'undefined') {
    if ((window as any).__RAW_GH_PAGES__) {
      return `./public/${cleanPath}`;
    }
    const hostname = window.location?.hostname || '';
    const pathname = window.location?.pathname || '/';
    if (
      hostname.endsWith('.github.io') ||
      pathname.includes('/Blue-Bird-Enterprises-') ||
      (pathname !== '/' && !pathname.startsWith('/index.html'))
    ) {
      return `./${cleanPath}`;
    }
  }
  return `/${cleanPath}`;
};

export const ATTACHED_IMAGES = {
  heroSuctionTruck: resolveAsset('/assets/aistudio/WhatsApp_Image_2026-10-23_at_2.37.44_PM_bf3122ef.jpeg'),
  workerEtpCleaning: resolveAsset('/assets/aistudio/WhatsApp_Image_2026-10-23_at_2.37.42_PM__1__e0c1e7a3.jpeg'),
  manholeDechoking: resolveAsset('/assets/aistudio/WhatsApp_Image_2026-10-23_at_2.37.42_PM__2__36252f4c.jpeg'),
  suctionTankerProfile: resolveAsset('/assets/aistudio/WhatsApp_Image_2026-10-23_at_2.37.42_PM_5f6a3ffe.jpeg'),
  drainJettingWorker: resolveAsset('/assets/aistudio/WhatsApp_Image_2026-10-23_at_2.37.43_PM__2__79587862.jpeg'),
  stormwaterDrainRig: resolveAsset('/assets/aistudio/WhatsApp_Image_2026-10-23_at_2.37.43_PM__1__adeef42a.jpeg'),
  domesticTankWork: resolveAsset('/assets/aistudio/WhatsApp_Image_2026-10-23_at_2.37.43_PM_180d0be7.jpeg'),
  courtyardVacuumOperation: resolveAsset('/assets/aistudio/WhatsApp_Image_2026-10-23_at_2.37.43_PM__3__acbfd4d1.jpeg'),
};

/**
 * 1. Exact 8 Main Services in the required order (1 to 8)
 */
export const MAIN_SERVICE_NAMES = [
  'ETP & STP Tank Cleaning',
  'High-Pressure Drain Cleaning',
  'Suction Tanker Services',
  'Domestic & Industrial Water Tank Cleaning',
  'Industrial Sludge Removal',
  'Sewer Line Cleaning & Blockage Removal',
  'Storm Water Drain Cleaning',
  'Concrete Pipeline & Chamber Construction',
] as const;

/**
 * 2. Additional genuine existing services retained in simple customer-friendly English
 */
export const ADDITIONAL_SERVICE_NAMES = [
  'Liquid Waste Removal',
  'Septic Tank Cleaning',
  'Civil Repairs & Reconstruction',
  'Manhole & Chamber Construction',
  'Turnkey Projects',
] as const;

/**
 * All 13 unique customer-friendly service names in order
 */
export const ALL_SERVICE_NAMES: string[] = [
  ...MAIN_SERVICE_NAMES,
  ...ADDITIONAL_SERVICE_NAMES,
];

/**
 * Backward-compatible mapping from previous/technical service names to the new simple service names.
 * Ensures old enquiries, bookings, and quotations stored in Supabase or localStorage continue working cleanly.
 */
const LEGACY_SERVICE_NAME_MAP: Record<string, string> = {
  // 1. ETP & STP Tank Cleaning
  'etp & stp tank cleaning': 'ETP & STP Tank Cleaning',
  'etp & stp tank desludging': 'ETP & STP Tank Cleaning',
  'etp / stp tank cleaning': 'ETP & STP Tank Cleaning',
  'etp/stp tank cleaning': 'ETP & STP Tank Cleaning',
  'etp / stp cleaning': 'ETP & STP Tank Cleaning',
  'etp/stp desludging': 'ETP & STP Tank Cleaning',
  'etp tank desludging': 'ETP & STP Tank Cleaning',
  'industrial cleaning: etp / stp tank cleaning': 'ETP & STP Tank Cleaning',

  // 2. High-Pressure Drain Cleaning
  'high-pressure drain cleaning': 'High-Pressure Drain Cleaning',
  'high-pressure drain jetting': 'High-Pressure Drain Cleaning',
  'high pressure drain jetting': 'High-Pressure Drain Cleaning',
  'high-pressure jetting': 'High-Pressure Drain Cleaning',
  'drain jetting': 'High-Pressure Drain Cleaning',
  'drainage & sewer management: high-pressure drain jetting': 'High-Pressure Drain Cleaning',

  // 3. Suction Tanker Services
  'suction tanker services': 'Suction Tanker Services',
  'mechanized suction tanker operations': 'Suction Tanker Services',
  'suction vehicle operations': 'Suction Tanker Services',
  'vacuum tanker operations': 'Suction Tanker Services',
  'industrial cleaning: suction vehicle operations': 'Suction Tanker Services',

  // 4. Domestic & Industrial Water Tank Cleaning
  'domestic & industrial water tank cleaning': 'Domestic & Industrial Water Tank Cleaning',
  'domestic & industrial water tank wash': 'Domestic & Industrial Water Tank Cleaning',
  'water tank cleaning': 'Domestic & Industrial Water Tank Cleaning',
  'underground & overhead water tanks': 'Domestic & Industrial Water Tank Cleaning',
  'industrial cleaning: water tank cleaning': 'Domestic & Industrial Water Tank Cleaning',

  // 5. Industrial Sludge Removal
  'industrial sludge removal': 'Industrial Sludge Removal',
  'industrial sludge evacuation': 'Industrial Sludge Removal',
  'sludge evacuation': 'Industrial Sludge Removal',
  'industrial cleaning: industrial sludge evacuation': 'Industrial Sludge Removal',

  // 6. Sewer Line Cleaning & Blockage Removal
  'sewer line cleaning & blockage removal': 'Sewer Line Cleaning & Blockage Removal',
  'sewer line de-choking & clearing': 'Sewer Line Cleaning & Blockage Removal',
  'sewer line de-choking': 'Sewer Line Cleaning & Blockage Removal',
  'sewer line dechoking': 'Sewer Line Cleaning & Blockage Removal',
  'drainage & sewer management: sewer line de-choking': 'Sewer Line Cleaning & Blockage Removal',

  // 7. Storm Water Drain Cleaning
  'storm water drain cleaning': 'Storm Water Drain Cleaning',
  'storm water channel upkeep': 'Storm Water Drain Cleaning',
  'storm water drain upkeep': 'Storm Water Drain Cleaning',
  'stormwater drain upkeep': 'Storm Water Drain Cleaning',
  'drainage & sewer management: storm water drain upkeep': 'Storm Water Drain Cleaning',

  // 8. Concrete Pipeline & Chamber Construction
  'concrete pipeline & chamber construction': 'Concrete Pipeline & Chamber Construction',
  'concrete pipeline & chamber works': 'Concrete Pipeline & Chamber Construction',
  'concrete pipeline laying & trench excavation': 'Concrete Pipeline & Chamber Construction',
  'concrete pipeline laying': 'Concrete Pipeline & Chamber Construction',
  'civil engineering: concrete pipeline laying & trench excavation': 'Concrete Pipeline & Chamber Construction',

  // Additional Retained Services
  'liquid waste removal': 'Liquid Waste Removal',
  'liquid waste extraction': 'Liquid Waste Removal',
  'neutralized liquid extraction': 'Liquid Waste Removal',
  'industrial cleaning: liquid waste extraction': 'Liquid Waste Removal',

  'septic tank cleaning': 'Septic Tank Cleaning',
  'septic tank mechanized cleaning': 'Septic Tank Cleaning',
  'septic tank vacuum cleaning': 'Septic Tank Cleaning',
  'drainage & sewer management: septic tank mechanized cleaning': 'Septic Tank Cleaning',

  'civil repairs & reconstruction': 'Civil Repairs & Reconstruction',
  'civil repair & reconstruction': 'Civil Repairs & Reconstruction',
  'civil engineering: civil repair & reconstruction': 'Civil Repairs & Reconstruction',

  'manhole & chamber construction': 'Manhole & Chamber Construction',
  'manhole & chamber building': 'Manhole & Chamber Construction',
  'civil chamber building': 'Manhole & Chamber Construction',
  'civil engineering: manhole & chamber building': 'Manhole & Chamber Construction',

  'turnkey projects': 'Turnkey Projects',
  'turnkey project': 'Turnkey Projects',
  'turnkey drainage / industrial cleaning': 'Turnkey Projects',
  'multiple industrial services': 'Turnkey Projects',
  'multiple services / turnkey project': 'Turnkey Projects',
};

/**
 * Normalizes a single or comma-separated service name string to the current simple English service names.
 * Preserves custom descriptions if not matching a legacy service name.
 */
export function normalizeServiceName(rawService: string | undefined | null): string {
  if (!rawService) return '';
  const trimmed = String(rawService).trim();
  if (!trimmed) return '';

  const directMatch = LEGACY_SERVICE_NAME_MAP[trimmed.toLowerCase()];
  if (directMatch) return directMatch;

  if (trimmed.includes(',')) {
    const parts = trimmed
      .split(',')
      .map((part) => {
        const cleanPart = part.trim();
        return LEGACY_SERVICE_NAME_MAP[cleanPart.toLowerCase()] || cleanPart;
      })
      .filter(Boolean);
    return Array.from(new Set(parts)).join(', ');
  }

  return trimmed;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    image: ATTACHED_IMAGES.heroSuctionTruck,
    title: 'Suction Tanker Fleet on Site',
    category: 'suction',
    categoryLabel: 'Suction Tanker Services',
    caption: 'Specialized Eicher heavy-duty suction vehicle (O2Zone 21.C) branded for Blue Bird Enterprises deployed on an active industrial project.',
    equipment: 'O2Zone Mechanized Vacuum Tanker (High-lift pump, heavy suction hoses)',
    altText: 'Blue Bird Enterprises yellow suction tanker truck on site at an industrial project in Navi Mumbai'
  },
  {
    id: 'gal-2',
    image: ATTACHED_IMAGES.workerEtpCleaning,
    title: 'ETP & STP Tank Wall Scrubbing & Cleaning',
    category: 'etp',
    categoryLabel: 'ETP & STP Tank Cleaning',
    caption: 'Trained technical personnel in full personal protective equipment (PPE) cleaning industrial effluent and sewage treatment tanks.',
    equipment: 'Chemical-resistant protective equipment, manual scraping rigs, heavy-duty suction hoses',
    altText: 'Technician wearing hard hat and safety vest cleaning industrial concrete ETP tank'
  },
  {
    id: 'gal-3',
    image: ATTACHED_IMAGES.manholeDechoking,
    title: 'Deep Manhole & Sewer Line Blockage Removal',
    category: 'drainage',
    categoryLabel: 'Sewer Line Cleaning & Blockage Removal',
    caption: 'Mechanized vacuum suction line clearing a deep industrial manhole chamber to remove heavy silt and sludge blockages.',
    equipment: 'Heavy-diameter suction hoses, high-vacuum suction machine, wash lines',
    altText: 'Worker standing over deep manhole chamber operating vacuum extraction hose'
  },
  {
    id: 'gal-4',
    image: ATTACHED_IMAGES.drainJettingWorker,
    title: 'High-Pressure Drain & Chamber Cleaning',
    category: 'drainage',
    categoryLabel: 'High-Pressure Drain Cleaning',
    caption: 'Industrial technician with high-pressure water jetting hose clearing clogged underground pipelines and chambers.',
    equipment: 'High-pressure jetting machine nozzle, protective heavy gloves, safety boots, high-vis jacket',
    altText: 'PPE-equipped worker using high pressure water jetting hose on concrete chamber'
  },
  {
    id: 'gal-5',
    image: ATTACHED_IMAGES.domesticTankWork,
    title: 'Domestic & Industrial Water Tank Cleaning',
    category: 'etp',
    categoryLabel: 'Domestic & Industrial Water Tank Cleaning',
    caption: 'Inspection, dewatering, and mechanized cleaning of dedicated water storage tanks with strict safety protocols.',
    equipment: 'Reinforced suction lines, submersible dewatering pumps, safety harnesses',
    altText: 'Worker in green safety helmet inserting suction pipe into domestic water tank'
  },
  {
    id: 'gal-6',
    image: ATTACHED_IMAGES.courtyardVacuumOperation,
    title: 'Factory Courtyard Sludge Removal',
    category: 'suction',
    categoryLabel: 'Industrial Sludge Removal',
    caption: 'Suction tanker parked safely at a manufacturing facility with extended suction lines removing sludge from underground pits.',
    equipment: 'Long-reach reinforced suction pipes, high-vacuum displacement tanker',
    altText: 'Vacuum tanker truck connected to ground pit at industrial facility courtyard'
  },
  {
    id: 'gal-7',
    image: ATTACHED_IMAGES.stormwaterDrainRig,
    title: 'Storm Water Drain & Channel Cleaning',
    category: 'drainage',
    categoryLabel: 'Storm Water Drain Cleaning',
    caption: 'Mounted suction and desilting unit clearing heavy silt and monsoon debris in industrial access lanes.',
    equipment: 'Narrow-access vacuum vehicle rig, heavy debris extraction pipes',
    altText: 'Suction tanker truck parked in lane performing stormwater drain clearance'
  },
  {
    id: 'gal-8',
    image: ATTACHED_IMAGES.suctionTankerProfile,
    title: 'Industrial Suction Tanker Ready for Dispatch',
    category: 'suction',
    categoryLabel: 'Suction Tanker Services',
    caption: 'Fleet tanker with integrated side trays and heavy suction coils ready for scheduled maintenance and emergency response calls.',
    equipment: 'O2Zone Suction Tanker unit, rapid deployment coils, operator cabin',
    altText: 'Yellow suction tanker machine vehicle parked at industrial premises'
  }
];

export interface CoreIntroServiceItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: 'Tank & Sludge Cleaning' | 'Drain & Sewer Cleaning' | 'Suction & Civil Works';
}

export const CORE_INTRODUCTION_SERVICES: CoreIntroServiceItem[] = [
  {
    id: 'etp-stp-cleaning',
    code: '01',
    title: 'ETP & STP Tank Cleaning',
    subtitle: 'Safe effluent & sewage plant tank cleaning',
    category: 'Tank & Sludge Cleaning',
  },
  {
    id: 'drain-jetting',
    code: '02',
    title: 'High-Pressure Drain Cleaning',
    subtitle: 'High-pressure water jetting for blocked pipes',
    category: 'Drain & Sewer Cleaning',
  },
  {
    id: 'suction-vehicle-ops',
    code: '03',
    title: 'Suction Tanker Services',
    subtitle: 'High-vacuum O2Zone tanker fleet operations',
    category: 'Suction & Civil Works',
  },
  {
    id: 'water-tank-cleaning',
    code: '04',
    title: 'Domestic & Industrial Water Tank Cleaning',
    subtitle: 'Dewatering, scrubbing & tank sanitization',
    category: 'Tank & Sludge Cleaning',
  },
  {
    id: 'industrial-sludge-evacuation',
    code: '05',
    title: 'Industrial Sludge Removal',
    subtitle: 'Deep pit & heavy sludge extraction',
    category: 'Tank & Sludge Cleaning',
  },
  {
    id: 'sewer-line-dechoking',
    code: '06',
    title: 'Sewer Line Cleaning & Blockage Removal',
    subtitle: '24/7 main sewer & chamber choke clearing',
    category: 'Drain & Sewer Cleaning',
  },
  {
    id: 'stormwater-drain-upkeep',
    code: '07',
    title: 'Storm Water Drain Cleaning',
    subtitle: 'Pre-monsoon drain & trench silt removal',
    category: 'Drain & Sewer Cleaning',
  },
  {
    id: 'concrete-pipeline-laying',
    code: '08',
    title: 'Concrete Pipeline & Chamber Construction',
    subtitle: 'RCC pipeline laying & chamber construction',
    category: 'Suction & Civil Works',
  },
];

export const SERVICES_DATA: ServiceItem[] = [
  // ================= MAIN 8 SERVICES (Exact Order 1 to 8) =================
  {
    id: 'etp-stp-cleaning',
    category: 'industrial-cleaning',
    categoryTitle: 'Industrial Cleaning',
    title: 'ETP & STP Tank Cleaning',
    shortDesc: 'Complete sludge removal, wall washing, and sediment cleaning for Effluent & Sewage Treatment Plants.',
    fullDesc: 'Periodic sludge removal and thorough wall scrubbing of aerobic/anaerobic tanks, clarifiers, and filtration sumps to maintain optimal biological and chemical treatment efficiency.',
    equipment: 'High-pressure wash rigs, submersible pumps, certified confined-space PPE, gas test meters.',
    suitableFor: 'Pharma manufacturing, chemical complexes, corporate IT parks, logistics hubs.',
    image: ATTACHED_IMAGES.workerEtpCleaning,
    isMainService: true,
    features: [
      'Full wall scraping and sediment removal',
      'Confined space entry safety protocol and PPE compliance',
      'Improves treatment plant efficiency and water clarity'
    ]
  },
  {
    id: 'drain-jetting',
    category: 'drainage-management',
    categoryTitle: 'Drainage & Sewer Cleaning',
    title: 'High-Pressure Drain Cleaning',
    shortDesc: 'High-pressure water jetting to clear grease, silt, and hard blockages from underground drain lines.',
    fullDesc: 'High-velocity water jetting breaks down and flushes out hardened grease, silt, tree roots, and chemical deposits inside buried pipes, restoring full drainage flow.',
    equipment: 'High-pressure drain jetting machines with rotating forward and backward nozzles.',
    suitableFor: 'Factory drains, underground process pipelines, commercial & industrial premises.',
    image: ATTACHED_IMAGES.drainJettingWorker,
    isMainService: true,
    features: [
      'Cleans pipe walls thoroughly without damaging pipes',
      'Clears stubborn grease traps, scale, and hard deposits',
      'Preventive cleaning to avoid monsoon waterlogging'
    ]
  },
  {
    id: 'suction-vehicle-ops',
    category: 'industrial-cleaning',
    categoryTitle: 'Industrial Cleaning',
    title: 'Suction Tanker Services',
    shortDesc: 'High-capacity vacuum suction tankers for removing liquid waste, sludge, and industrial wastewater.',
    fullDesc: 'Our specialized fleet of vacuum suction tankers provides fast, leak-proof removal of liquid and semi-solid waste for factories, commercial sites, and MIDC industrial zones.',
    equipment: 'High-capacity mechanized vacuum suction tankers (O2Zone series), high-lift pumps, heavy-duty suction hoses.',
    suitableFor: 'Chemical plants, pharmaceutical factories, engineering units, industrial pits.',
    image: ATTACHED_IMAGES.heroSuctionTruck,
    isMainService: true,
    features: [
      'Fast high-vacuum suction for thick sludge and liquids',
      'Leak-proof enclosed transport to authorized disposal points',
      'Trained drivers and safety-certified operators',
      'Clean, zero-spillage on-site operation'
    ]
  },
  {
    id: 'water-tank-cleaning',
    category: 'industrial-cleaning',
    categoryTitle: 'Industrial Cleaning',
    title: 'Domestic & Industrial Water Tank Cleaning',
    shortDesc: 'Mechanized dewatering, silt removal, and hygienic cleaning for overhead and underground water tanks.',
    fullDesc: 'End-to-end cleaning of underground water sumps and overhead storage tanks for residential societies, commercial buildings, and industrial plants, removing rust, silt, and algae.',
    equipment: 'Submersible dewatering pumps, high-pressure washers, industrial scrubbing brushes.',
    suitableFor: 'Residential complexes, corporate offices, factories, industrial buildings.',
    image: ATTACHED_IMAGES.domesticTankWork,
    isMainService: true,
    features: [
      'Multi-stage dewatering, scrubbing, and sanitizing process',
      'Safe, non-toxic cleaning agents',
      'Minimal water wastage and quick completion'
    ]
  },
  {
    id: 'industrial-sludge-evacuation',
    category: 'industrial-cleaning',
    categoryTitle: 'Industrial Cleaning',
    title: 'Industrial Sludge Removal',
    shortDesc: 'Safe extraction and removal of thick industrial sludge, pit deposits, and settled waste.',
    fullDesc: 'Systematic removal of settled chemical and process sludge from industrial collection tanks, settling pits, and sumps without disrupting daily plant operations.',
    equipment: 'Heavy-diameter suction hoses, agitators, high-vacuum pump systems.',
    suitableFor: 'Manufacturing plants, textile units, paint & chemical factories, storage yards.',
    image: ATTACHED_IMAGES.courtyardVacuumOperation,
    isMainService: true,
    features: [
      'Handles thick sludge and heavy bottom sediments',
      'Deep pit extraction with long-reach suction hoses',
      'Full compliance with industrial safety guidelines'
    ]
  },
  {
    id: 'sewer-line-dechoking',
    category: 'drainage-management',
    categoryTitle: 'Drainage & Sewer Cleaning',
    title: 'Sewer Line Cleaning & Blockage Removal',
    shortDesc: 'Fast clearing of blocked main sewer lines, manholes, and underground drainage pipes.',
    fullDesc: 'Eliminates sewer backups, foul odors, and overflow emergencies across factories, commercial complexes, and housing societies using mechanized suction and jetting.',
    equipment: 'Combined vacuum suction and jetting lances, mechanized rodding tools, suction tanker.',
    suitableFor: 'Industrial estates, manufacturing parks, commercial buildings, residential complexes.',
    image: ATTACHED_IMAGES.manholeDechoking,
    isMainService: true,
    features: [
      'Prompt response for urgent sewer and drain blockages',
      'Clears deep pipe blockages without unnecessary digging',
      'Complete water flow check after cleaning'
    ]
  },
  {
    id: 'stormwater-drain-upkeep',
    category: 'drainage-management',
    categoryTitle: 'Drainage & Sewer Cleaning',
    title: 'Storm Water Drain Cleaning',
    shortDesc: 'Cleaning and desilting of open storm water drains, trenches, and culverts before and during monsoon.',
    fullDesc: 'Thorough removal of accumulated silt, sand, leaves, and debris from storm water channels across industrial plots and commercial premises to prevent flooding.',
    equipment: 'Mounted vacuum tankers, desilting tools, heavy debris suction pipes.',
    suitableFor: 'MIDC industrial plots, logistics yards, warehouses, boundary drains.',
    image: ATTACHED_IMAGES.stormwaterDrainRig,
    isMainService: true,
    features: [
      'Pre-monsoon desilting and post-rain debris clearing',
      'Prevents waterlogging in factory yards and loading bays',
      'Safe removal of excavated silt from site roadways'
    ]
  },
  {
    id: 'concrete-pipeline-laying',
    category: 'civil-engineering',
    categoryTitle: 'Civil Engineering',
    title: 'Concrete Pipeline & Chamber Construction',
    shortDesc: 'Trench excavation, RCC concrete pipeline laying, and drainage chamber construction.',
    fullDesc: 'Complete civil execution including site survey, gradient setting, trench excavation, RCC Hume pipe laying, jointing, chamber construction, and surface restoration.',
    equipment: 'Excavators, trench compactors, pipe lifting rigs, laser levelling tools.',
    suitableFor: 'Plant expansions, drainage line installations, underground utility upgrades.',
    image: ATTACHED_IMAGES.courtyardVacuumOperation,
    isMainService: true,
    features: [
      'Accurate slope alignment for smooth drainage flow',
      'Safe trench barricading inside active plant premises',
      'Proper backfilling and road surface restoration'
    ]
  },

  // ================= ADDITIONAL RETAINED SERVICES (Simple English Names) =================
  {
    id: 'liquid-waste-extraction',
    category: 'industrial-cleaning',
    categoryTitle: 'Industrial Cleaning',
    title: 'Liquid Waste Removal',
    shortDesc: 'Safe pumping and removal of industrial wastewater and liquid waste from holding tanks and sumps.',
    fullDesc: 'Controlled suction and transfer of industrial wash water, coolant water, and treated liquid effluents from storage sumps using enclosed vacuum tankers.',
    equipment: 'Reinforced industrial suction hoses, leak-proof couplings, vacuum tankers.',
    suitableFor: 'Engineering workshops, metal finishing units, warehouses, processing plants.',
    image: ATTACHED_IMAGES.suctionTankerProfile,
    isMainService: false,
    features: [
      'High pumping speed for minimal plant downtime',
      'Long flexible hoses for hard-to-reach sumps',
      'Flexible scheduling during plant maintenance hours'
    ]
  },
  {
    id: 'septic-tank-cleaning',
    category: 'drainage-management',
    categoryTitle: 'Drainage & Sewer Cleaning',
    title: 'Septic Tank Cleaning',
    shortDesc: 'Hygienic, odor-controlled mechanized vacuum cleaning of domestic and industrial septic tanks.',
    fullDesc: '100% mechanized vacuum extraction of sewage and sludge from septic tanks and soak pits for residential societies, commercial buildings, and factory staff quarters.',
    equipment: 'Enclosed vacuum suction tankers with long-reach suction hoses.',
    suitableFor: 'Residential societies, commercial buildings, factory canteens, staff quarters.',
    image: ATTACHED_IMAGES.heroSuctionTruck,
    isMainService: false,
    features: [
      '100% mechanized cleaning with zero manual entry',
      'Enclosed suction to prevent odor and spillage',
      'Safe transport to authorized disposal points'
    ]
  },
  {
    id: 'civil-repair-reconstruction',
    category: 'civil-engineering',
    categoryTitle: 'Civil Engineering',
    title: 'Civil Repairs & Reconstruction',
    shortDesc: 'Industrial drain repairs, concrete flooring, trench reconstruction, and masonry work.',
    fullDesc: 'Reliable civil repair work including damaged drain reconstruction, concrete slab restoration, plastering, waterproofing, and industrial flooring repairs.',
    equipment: 'Concrete mixers, breakers, compaction tools, safety barricades.',
    suitableFor: 'Factory yards, plant floors, drainage channels, loading bays.',
    image: ATTACHED_IMAGES.workerEtpCleaning,
    isMainService: false,
    features: [
      'High-strength concrete and water-resistant mortar',
      'Fast-curing repairs to minimize plant disruption',
      'Crack sealing and protective plastering'
    ]
  },
  {
    id: 'manhole-chamber-building',
    category: 'civil-engineering',
    categoryTitle: 'Civil Engineering',
    title: 'Manhole & Chamber Construction',
    shortDesc: 'Construction, raising, and repair of brick and RCC inspection chambers and heavy-duty manhole covers.',
    fullDesc: 'Building new brick and RCC inspection chambers, repairing damaged manhole walls, and installing heavy-duty cast iron (CI) or ductile iron (DI) covers.',
    equipment: 'Masonry tools, formwork shutters, heavy cover lifting tools.',
    suitableFor: 'Industrial estate roads, factory compound drains, sewer networks.',
    image: ATTACHED_IMAGES.domesticTankWork,
    isMainService: false,
    features: [
      'Durable brick and RCC construction',
      'Heavy-duty vehicle-grade manhole frame and cover fitting',
      'Smooth internal chamber benching for unobstructed flow'
    ]
  },
  {
    id: 'turnkey-projects',
    category: 'civil-engineering',
    categoryTitle: 'Civil Engineering',
    title: 'Turnkey Projects',
    shortDesc: 'End-to-end industrial cleaning, drainage overhaul, and civil infrastructure projects.',
    fullDesc: 'Complete single-window execution combining suction tanker operations, tank cleaning, high-pressure drain cleaning, and new pipeline or chamber construction for large facilities.',
    equipment: 'Full fleet of suction tankers, jetting machines, civil excavation & construction crew.',
    suitableFor: 'Annual maintenance contracts (AMC), plant shutdowns, full factory drainage upgrades.',
    image: ATTACHED_IMAGES.heroSuctionTruck,
    isMainService: false,
    features: [
      'Single point of contact for multi-service plant jobs',
      'Dedicated site supervisor and safety-certified crew',
      'Custom scheduling for plant shutdowns and AMCs'
    ]
  }
];

export const CLIENTS_LIST: ClientItem[] = [
  { name: 'RPG Life Sciences Limited', sector: 'Pharmaceuticals & Healthcare', location: 'Navi Mumbai' },
  { name: 'Balmer Lawrie - Van Leer Ltd.', sector: 'Industrial Packaging & Containers', location: 'Turbhe / Taloja' },
  { name: 'Savita Oil Technologies Ltd.', sector: 'Specialty Petroleum & Lubricants', location: 'Navi Mumbai' },
  { name: 'Zoetis Pharma Research Pvt. Ltd.', sector: 'Animal Health & Life Sciences', location: 'Navi Mumbai' },
  { name: 'Piramal Pharma Limited', sector: 'Pharmaceutical Manufacturing', location: 'Maharashtra' },
  { name: 'Neogen Chemicals Limited', sector: 'Specialty Chemicals & Lithium Chemistry', location: 'Mahape / Navi Mumbai' }
];

export const INDUSTRIES_SERVED: IndustryItem[] = [
  {
    id: 'pharma',
    title: 'Pharmaceuticals & Biotech',
    tagline: 'High Hygiene & Safety Compliance',
    description: 'Meeting strict safety, hygiene, and environmental standards with dedicated ETP & STP tank cleaning, high-pressure drain cleaning, and zero-contamination suction tanker services.',
    keyServices: ['ETP & STP Tank Cleaning', 'High-Pressure Drain Cleaning', 'Liquid Waste Removal', 'Domestic & Industrial Water Tank Cleaning'],
    icon: 'FlaskConical'
  },
  {
    id: 'chemicals',
    title: 'Specialty Chemicals & Petrochemicals',
    tagline: 'Heavy Sludge & Liquid Waste Removal',
    description: 'Experienced in handling chemical settling tanks, wash pits, and thick industrial sludge removal with heavy-duty suction tankers.',
    keyServices: ['Industrial Sludge Removal', 'Suction Tanker Services', 'Liquid Waste Removal', 'ETP & STP Tank Cleaning'],
    icon: 'Flame'
  },
  {
    id: 'manufacturing',
    title: 'Heavy Engineering & Manufacturing',
    tagline: 'Preventive Drainage & Factory Upkeep',
    description: 'Complete maintenance for manufacturing plants: coolant sumps, storm water drains, sewer line cleaning, and civil repairs for factory roadways.',
    keyServices: ['Storm Water Drain Cleaning', 'Sewer Line Cleaning & Blockage Removal', 'Concrete Pipeline & Chamber Construction', 'Civil Repairs & Reconstruction'],
    icon: 'Factory'
  },
  {
    id: 'logistics',
    title: 'Logistics Parks & Warehousing Hubs',
    tagline: 'Zero-Disruption Yard Maintenance',
    description: 'Maintaining commercial container yards, truck bays, and warehouse drainage lines to prevent monsoon waterlogging.',
    keyServices: ['Storm Water Drain Cleaning', 'High-Pressure Drain Cleaning', 'Septic Tank Cleaning', 'Manhole & Chamber Construction'],
    icon: 'Truck'
  },
  {
    id: 'commercial',
    title: 'Commercial & Corporate Facilities',
    tagline: 'Clean, Odorless & Mechanized Operations',
    description: 'Professional hygiene maintenance for corporate offices, IT parks, and residential complexes with mechanized water tank and STP cleaning.',
    keyServices: ['Domestic & Industrial Water Tank Cleaning', 'ETP & STP Tank Cleaning', 'Sewer Line Cleaning & Blockage Removal', 'Turnkey Projects'],
    icon: 'Building2'
  }
];

export const FAQS_DATA = [
  {
    q: 'What types of suction tankers does Blue Bird Enterprises operate?',
    a: 'We operate specialized high-capacity vacuum suction tankers (including our O2Zone fleet) equipped with heavy-duty vacuum pumps and long-reach suction hoses capable of removing thick industrial sludge, liquid waste, and silt from deep tanks and chambers.'
  },
  {
    q: 'Where are your primary service areas in Maharashtra?',
    a: 'Our main office is at Shop No. 403, Pawane Village, Turbhe MIDC, Navi Mumbai. We serve all MIDC industrial areas across Navi Mumbai (Turbhe, Pawane, Rabale, Mahape), Taloja MIDC, Thane-Belapur corridor, Panvel, Ambernath, Dombivli, Patalganga, Roha, and across Maharashtra.'
  },
  {
    q: 'Do you provide on-site inspection before sending a quotation?',
    a: 'Yes. For ETP & STP tank cleaning, industrial sludge removal, sewer line cleaning, and civil construction work, our supervisor visits your site to check tank volume, hose distance, and safety requirements before sharing a formal quotation.'
  },
  {
    q: 'What safety standards and PPE do your teams follow?',
    a: 'Safety comes first in all our work. Our technicians wear safety helmets, reflective vests, chemical-resistant gloves, gumboots, and masks. We strictly follow confined-space safety rules and use 100% mechanized cleaning methods.'
  },
  {
    q: 'Can you handle urgent sewer blockages or emergency suction tanker requests?',
    a: 'Yes, we provide 24/7 emergency response for blocked sewer lines, overflowing sumps, and storm water waterlogging. You can call our operations desk directly at +91 98678 33456 or +91 99873 24798.'
  },
  {
    q: 'Are your invoices and quotations GST compliant?',
    a: 'Yes, Blue Bird Enterprises is registered with GSTIN: 27EFDPP3303H1ZL and PAN: EFDPP3303H. All quotations and tax invoices follow GST rules with clear service descriptions.'
  }
];
