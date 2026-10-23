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
  phone2: '+91 99873 24798',
  phone2Raw: '9987324798',
  email: 'surupiwal@gmail.com',
  gstin: '27EFDPP3303H1ZL',
  pan: 'EFDPP3303H',
  whatsappNumber: '919867833456',
  whatsappDisplay: '+91 98678 33456',
  whatsappDefaultMsg: 'Hello Blue Bird Enterprises, I would like to enquire about your industrial services.',
  strategicVision: "To serve as India's most dependable and preferred partner for industrial environmental sanitation, vacuum tanker operations, drainage infrastructure maintenance, and specialized civil works by executing reliable, safe, sustainable, and technologically sound solutions.",
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

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    image: ATTACHED_IMAGES.heroSuctionTruck,
    title: 'Mechanized Vacuum Suction Tanker Fleet',
    category: 'suction',
    categoryLabel: 'Vacuum Tanker Operations',
    caption: 'Specialized Eicher heavy-duty suction vehicle (O2Zone 21.C) branded for Blue Bird Enterprises deployed on active industrial project.',
    equipment: 'O2Zone Mechanized Vacuum Tanker (High-lift pump, heavy suction hoses)',
    altText: 'Blue Bird Enterprises yellow suction tanker truck on site at an industrial project in Navi Mumbai'
  },
  {
    id: 'gal-2',
    image: ATTACHED_IMAGES.workerEtpCleaning,
    title: 'ETP / STP Tank Wall Scrubbing & Desludging',
    category: 'etp',
    categoryLabel: 'ETP / STP Cleaning',
    caption: 'Trained technical personnel in full personal protective equipment (PPE) scrubbing industrial effluent sedimentation tanks.',
    equipment: 'Chemical-resistant protective equipment, manual scraping rigs, heavy-duty suction hoses',
    altText: 'Technician wearing hard hat and safety vest cleaning industrial concrete ETP tank'
  },
  {
    id: 'gal-3',
    image: ATTACHED_IMAGES.manholeDechoking,
    title: 'Deep Manhole Blockage Removal & De-Choking',
    category: 'drainage',
    categoryLabel: 'Drainage & Sewer Management',
    caption: 'Mechanized vacuum suction line evacuating deep industrial manhole chamber to remove heavy silt and sludge blockages.',
    equipment: 'Heavy-diameter suction hoses, high-vacuum suction machine, wash lines',
    altText: 'Worker standing over deep manhole chamber operating vacuum extraction hose'
  },
  {
    id: 'gal-4',
    image: ATTACHED_IMAGES.drainJettingWorker,
    title: 'High-Pressure Drain Jetting & Chamber Clearance',
    category: 'drainage',
    categoryLabel: 'High-Pressure Jetting',
    caption: 'Industrial technician with high-pressure water jetting lance clearing clogged underground pipelines and chambers beside commercial building.',
    equipment: 'High-pressure jetting machine nozzle, protective heavy gloves, safety boots, high-vis jacket',
    altText: 'PPE-equipped worker using high pressure water jetting hose on concrete chamber'
  },
  {
    id: 'gal-5',
    image: ATTACHED_IMAGES.domesticTankWork,
    title: 'Water Tank & Chamber Mechanized Servicing',
    category: 'etp',
    categoryLabel: 'Water Tank Cleaning',
    caption: 'Inspection, dewatering, and mechanized cleaning of dedicated water storage tanks with strict safety protocol.',
    equipment: 'Reinforced suction lines, submersible dewatering pumps, safety harnesses',
    altText: 'Worker in green safety helmet inserting suction pipe into domestic water tank'
  },
  {
    id: 'gal-6',
    image: ATTACHED_IMAGES.courtyardVacuumOperation,
    title: 'Factory Courtyard Sludge Evacuation',
    category: 'suction',
    categoryLabel: 'Industrial Sludge Evacuation',
    caption: 'Vacuum tanker parked safely at manufacturing facility with extended suction lines directly accessing underground pits with zero disruption.',
    equipment: 'Long-reach reinforced suction pipes, high-vacuum displacement tanker',
    altText: 'Vacuum tanker truck connected to ground pit at industrial facility courtyard'
  },
  {
    id: 'gal-7',
    image: ATTACHED_IMAGES.stormwaterDrainRig,
    title: 'Storm Water Channel & Underground Drain Upkeep',
    category: 'drainage',
    categoryLabel: 'Storm Water Drain Upkeep',
    caption: 'Mounted suction and de-silting rig tackling heavy silt and monsoon debris accumulation in narrow industrial access lanes.',
    equipment: 'Narrow-access vacuum vehicle rig, heavy debris extraction pipes',
    altText: 'Suction tanker truck parked in lane performing stormwater drain clearance'
  },
  {
    id: 'gal-8',
    image: ATTACHED_IMAGES.suctionTankerProfile,
    title: 'Industrial Suction Vehicle Ready for Deployment',
    category: 'suction',
    categoryLabel: 'Suction Vehicle Operations',
    caption: 'Fleet tanker with integrated side trays and heavy suction coils ready for planned maintenance and rapid response calls.',
    equipment: 'Ozone Suction Tanker unit, rapid deployment coils, operator cabin',
    altText: 'Yellow suction tanker machine vehicle parked at industrial premises'
  }
];

export const SERVICES_DATA: ServiceItem[] = [
  // 1. Industrial Cleaning
  {
    id: 'suction-vehicle-ops',
    category: 'industrial-cleaning',
    categoryTitle: 'Industrial Cleaning',
    title: 'Suction Vehicle Operations',
    shortDesc: 'Mechanized vacuum tanker fleet for extracting heavy industrial sludge, effluents, and liquids.',
    fullDesc: 'Our specialized fleet of vacuum suction tankers provides rapid, high-displacement liquid and semi-solid waste evacuation for manufacturing and process industries across MIDC zones.',
    equipment: 'High-capacity mechanized vacuum suction tankers (O2Zone series), high-lift suction pumps, reinforced suction lines.',
    suitableFor: 'Chemical plants, pharmaceutical factories, engineering units, industrial effluent pits.',
    image: ATTACHED_IMAGES.heroSuctionTruck,
    features: [
      'Rapid high-vacuum displacement for thick sludge and liquids',
      'Leak-proof enclosed transport to authorized disposal points',
      'Trained drivers and safety-certified operators',
      'Zero-spillage on-site operation protocol'
    ]
  },
  {
    id: 'industrial-sludge-evacuation',
    category: 'industrial-cleaning',
    categoryTitle: 'Industrial Cleaning',
    title: 'Industrial Sludge Evacuation',
    shortDesc: 'Complete extraction and evacuation of dense sediments, process residues, and settling pit deposits.',
    fullDesc: 'Systematic evacuation of settled chemical and organic sludge from industrial collection tanks, equalization basins, and settling pits without disrupting surrounding plant routines.',
    equipment: 'Heavy-diameter suction hoses, agitators, vacuum pump systems.',
    suitableFor: 'Process manufacturing, textile processing, paint & coating units, bulk storage yards.',
    image: ATTACHED_IMAGES.courtyardVacuumOperation,
    features: [
      'Handles high-viscosity sludge and heavy sedimentation',
      'Deep pit extraction capability with extended pipeline reach',
      'Compliant with industrial safety guidelines'
    ]
  },
  {
    id: 'etp-stp-cleaning',
    category: 'industrial-cleaning',
    categoryTitle: 'Industrial Cleaning',
    title: 'ETP / STP Tank Cleaning',
    shortDesc: 'Comprehensive desludging, wall washing, and sediment removal for Effluent & Sewage Treatment Plants.',
    fullDesc: 'Periodic desludging and thorough wall scrubbing of aerobic/anaerobic tanks, clarifiers, and filtration sumps to maintain optimal biological and chemical treatment efficiency.',
    equipment: 'High-pressure wash rigs, submersible evacuation units, specialized PPE, gas test meters.',
    suitableFor: 'Pharma manufacturing, chemical complexes, corporate IT parks, logistics parks.',
    image: ATTACHED_IMAGES.workerEtpCleaning,
    features: [
      'Full wall scraping and bio-film sediment removal',
      'Confined space entry safety protocol and PPE compliance',
      'Improves plant processing efficiency and effluent clarity'
    ]
  },
  {
    id: 'liquid-waste-extraction',
    category: 'industrial-cleaning',
    categoryTitle: 'Industrial Cleaning',
    title: 'Liquid Waste Extraction',
    shortDesc: 'Safe pumping and evacuation of neutral and treated industrial wastewater from storage basins.',
    fullDesc: 'Safe, controlled suction and transfer of industrial rinse liquids, floor washings, and treated wastewater holding sumps into vacuum containers.',
    equipment: 'Reinforced industrial suction hoses, chemical-resistant fittings, vacuum tankers.',
    suitableFor: 'Automotive workshops, metal finishing, industrial laundry, warehousing facilities.',
    image: ATTACHED_IMAGES.suctionTankerProfile,
    features: [
      'High pumping rate for minimal operational downtime',
      'Heavy-duty flexible hoses allowing access to confined yards',
      'Flexible scheduling during plant maintenance shutdowns'
    ]
  },
  {
    id: 'water-tank-cleaning',
    category: 'industrial-cleaning',
    categoryTitle: 'Industrial Cleaning',
    title: 'Water Tank Cleaning',
    shortDesc: 'Mechanized dewatering, sludge extraction, and anti-bacterial cleaning for overhead and underground tanks.',
    fullDesc: 'End-to-end cleaning of underground storage reservoirs (UGSR) and overhead tanks (OHT) for commercial and industrial facilities, removing years of accumulated rust, silt, and algae.',
    equipment: 'Submersible dewatering pumps, high-pressure jet washers, industrial scrubbing brushes.',
    suitableFor: 'Industrial colonies, corporate headquarters, factories, commercial complexes.',
    image: ATTACHED_IMAGES.domesticTankWork,
    features: [
      'Multi-stage de-watering, scrubbing, and sanitizing process',
      'Non-toxic and approved cleaning compounds',
      'Minimal water wastage and rapid turnaround'
    ]
  },

  // 2. Drainage & Sewer Management
  {
    id: 'drain-jetting',
    category: 'drainage-management',
    categoryTitle: 'Drainage & Sewer Management',
    title: 'High-Pressure Drain Jetting',
    shortDesc: 'Clearing hardened debris, grease scale, and mineral blockages from underground industrial pipelines.',
    fullDesc: 'High-velocity water jetting penetrates and pulverizes hardened grease, silt, tree roots, and chemical deposits inside buried pipes, restoring maximum hydraulic flow.',
    equipment: 'High-pressure sewer jetting machines with specialized rotating backward/forward nozzles.',
    suitableFor: 'Factory peripheral drains, internal process sewer lines, storm conduits.',
    image: ATTACHED_IMAGES.drainJettingWorker,
    features: [
      'Scours pipe walls completely clean without damaging pipe integrity',
      'Clears stubborn grease traps, scale, and mineral incrustations',
      'Pre-monsoon preventive clearing to avoid plant waterlogging'
    ]
  },
  {
    id: 'sewer-line-dechoking',
    category: 'drainage-management',
    categoryTitle: 'Drainage & Sewer Management',
    title: 'Sewer Line De-Choking',
    shortDesc: 'Urgent and scheduled clearing of blocked main sewer lines, collector pipes, and discharge lines.',
    fullDesc: 'Eliminates sewer backups, foul odors, and overflow emergencies across corporate campuses, factories, and residential worker colonies through mechanized clearing techniques.',
    equipment: 'Combined vacuum suction and jetting lances, mechanized rods, vacuum tanker.',
    suitableFor: 'Industrial manufacturing parks, chemical processing estates, commercial establishments.',
    image: ATTACHED_IMAGES.manholeDechoking,
    features: [
      'Immediate action on critical plant drainage blockages',
      'Removes deep chokes without intrusive excavation where possible',
      'Comprehensive flow verification post-service'
    ]
  },
  {
    id: 'stormwater-drain-upkeep',
    category: 'drainage-management',
    categoryTitle: 'Drainage & Sewer Management',
    title: 'Storm Water Drain Upkeep',
    shortDesc: 'Clearing open stormwater trenches, culverts, and gratings to prevent monsoon industrial waterlogging.',
    fullDesc: 'Thorough removal of accumulated silt, sand, fallen leaves, and industrial debris from storm channels across industrial layouts ahead of and throughout the monsoon season.',
    equipment: 'Mounted vacuum tankers, manual desilting gear, trench cleaning shovels.',
    suitableFor: 'MIDC industrial plots, logistics yards, warehouses, boundary perimeter drains.',
    image: ATTACHED_IMAGES.stormwaterDrainRig,
    features: [
      'Pre-monsoon desilting and post-storm debris clearance',
      'Ensures rapid runoff discharge and prevents compound flooding',
      'Haulage of excavated silt away from operational roadways'
    ]
  },
  {
    id: 'septic-tank-cleaning',
    category: 'drainage-management',
    categoryTitle: 'Drainage & Sewer Management',
    title: 'Septic Tank Mechanized Cleaning',
    shortDesc: 'Hygienic, mechanized emptying and disposal of accumulated sewage and septage.',
    fullDesc: 'Odor-controlled vacuum extraction of sewage from septic tanks, holding pits, and soakaways for residential societies, commercial facilities, and factory staff quarters.',
    equipment: 'Enclosed vacuum tankers with odor-reduction vents and long-distance suction hoses.',
    suitableFor: 'Staff quarters, commercial buildings, industrial canteens, logistics hubs.',
    image: ATTACHED_IMAGES.heroSuctionTruck,
    features: [
      '100% mechanized operation eliminating hazardous manual scavenging',
      'Enclosed vacuum suction preventing offensive odors and spillages',
      'Safe transfer to designated municipal disposal stations'
    ]
  },

  // 3. Civil Engineering
  {
    id: 'civil-repair-reconstruction',
    category: 'civil-engineering',
    categoryTitle: 'Civil Engineering',
    title: 'Civil Repair & Reconstruction',
    shortDesc: 'Structural repairs, concrete flooring, drain trench reconstruction, and industrial masonry.',
    fullDesc: 'Specialized industrial civil repair services including damaged drain re-plastering, concrete slab reconstruction, pavement restoration, and protective chemical-resistant coatings.',
    equipment: 'Concrete mixers, demolition hammers, compaction tools, safety shoring.',
    suitableFor: 'Industrial chemical yards, factory floors, roadway crossings, plant loading docks.',
    image: ATTACHED_IMAGES.workerEtpCleaning,
    features: [
      'High-grade M25/M30 concrete and water-resistant admixtures',
      'Fast-curing repair compounds for quick plant traffic resumption',
      'Structural crack sealing and waterproofing'
    ]
  },
  {
    id: 'manhole-chamber-building',
    category: 'civil-engineering',
    categoryTitle: 'Civil Engineering',
    title: 'Manhole & Chamber Building',
    shortDesc: 'Construction, raising, and renovation of brick and RCC inspection chambers and manholes.',
    fullDesc: 'Building new inspection chambers, repairing damaged brickwork, installing heavy-duty cast iron or ductile iron (CI/DI) covers, and benching chamber inverts for smooth hydraulic flow.',
    equipment: 'Formwork systems, masonry tools, heavy cover lifting cranes.',
    suitableFor: 'Industrial estate roads, facility perimeter drains, newly laid sewer branches.',
    image: ATTACHED_IMAGES.domesticTankWork,
    features: [
      'Standardized civil masonry conforming to municipal engineering codes',
      'Installation of heavy-duty vehicular traffic rated manhole covers',
      'Acid/chemical-resistant mortar benching inside chambers'
    ]
  },
  {
    id: 'concrete-pipeline-laying',
    category: 'civil-engineering',
    categoryTitle: 'Civil Engineering',
    title: 'Concrete Pipeline Laying & Trench Excavation',
    shortDesc: 'Excavation of utility trenches and laying of RCC Hume pipes, HDPE conduits, and stormwater culverts.',
    fullDesc: 'Site survey, gradient setting, trench excavation, pipe bedding, jointing, and backfilling for underground drainage, sewer lines, and industrial utility crossings.',
    equipment: 'Mini excavators, trench compaction rammers, pipe lifting cranes, laser levels.',
    suitableFor: 'Plant expansions, drainage diversions, utility upgrades, civil site development.',
    image: ATTACHED_IMAGES.courtyardVacuumOperation,
    features: [
      'Accurate laser gradient alignment for gravity-flow drainage',
      'Trench shoring and safety barricading in active plant areas',
      'Full compaction and surface reinstatement post installation'
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
    description: 'Meeting stringent safety, hygiene, and environmental protocols with dedicated ETP cleaning, biological tank maintenance, and zero-contamination suction procedures.',
    keyServices: ['ETP Tank Desludging', 'High-Pressure Drain Jetting', 'Neutralized Liquid Extraction', 'Confined Space PPE Compliance'],
    icon: 'FlaskConical'
  },
  {
    id: 'chemicals',
    title: 'Specialty Chemicals & Petrochemicals',
    tagline: 'Heavy Sludge & Hazardous Settling Handling',
    description: 'Expertise in handling chemical settling ponds, acidic/alkaline wash pits, and dense sludge evacuation with heavy suction displacement equipment.',
    keyServices: ['Chemical Pit Evacuation', 'Heavy Silt Removal', 'Vacuum Tanker Logistics', 'Emergency Spill Assistance'],
    icon: 'Flame'
  },
  {
    id: 'manufacturing',
    title: 'Heavy Engineering & Manufacturing',
    tagline: 'Preventive Drainage & Factory Upkeep',
    description: 'Turnkey upkeep for massive industrial compounds: cooling tower basins, machine coolant sumps, stormwater drains, and civil repairs for factory roadways.',
    keyServices: ['Coolant Sump Evacuation', 'Peripheral Storm Drain Upkeep', 'Civil Chamber Building', 'Sewer Line De-Choking'],
    icon: 'Factory'
  },
  {
    id: 'logistics',
    title: 'Logistics Parks & Warehousing Hubs',
    tagline: 'Zero-Disruption Yard Maintenance',
    description: 'Maintaining vast commercial container yards, truck docks, and warehouse drainage channels to eliminate seasonal water stagnation and vehicle hazards.',
    keyServices: ['Storm Drain Jetting', 'Septic Tank Vacuum Cleaning', 'Catch-Basin Desilting', 'Pavement Drainage Repairs'],
    icon: 'Truck'
  },
  {
    id: 'commercial',
    title: 'Commercial & Corporate Facilities',
    tagline: 'Discreet, Odorless & Mechanized Operations',
    description: 'Professional hygiene upkeep for corporate headquarters, IT campuses, and commercial complexes with low noise, odorless suction, and prompt night-shift availability.',
    keyServices: ['Underground & Overhead Water Tanks', 'STP Plant Maintenance', 'Kitchen Grease-Trap Clearing', 'Manhole Cover Repairs'],
    icon: 'Building2'
  }
];

export const FAQS_DATA = [
  {
    q: 'What types of industrial vacuum suction tankers does Blue Bird Enterprises operate?',
    a: 'We operate specialized high-capacity mechanized vacuum tankers (including our O2Zone suction fleet) equipped with heavy-lift vacuum displacement pumps and reinforced long-reach suction hoses capable of evacuating heavy sludge, industrial wastewater, and dense silt from depths up to several meters.'
  },
  {
    q: 'Where are your primary service areas in Maharashtra?',
    a: 'Our central operations base is at Shop No. 403, Pawane Village, Turbhe MIDC, Navi Mumbai. We actively serve all MIDC industrial zones across Navi Mumbai (Turbhe, Pawane, Rabale, Mahape), Taloja MIDC, Thane-Belapur corridor, Panvel, Ambernath, Dombivli, Patalganga, Roha, and industrial clusters across Maharashtra.'
  },
  {
    q: 'Do you provide on-site inspection before sending a quotation?',
    a: 'Yes. For industrial cleaning, ETP/STP desludging, sewer de-choking, and civil engineering projects, our technical supervisor visits your facility to evaluate sludge volume, hose distance, depth, and safety requirements before issuing a formal quotation.'
  },
  {
    q: 'What safety standards and PPE do your field teams follow?',
    a: 'Safety is paramount in all our operations. Our technicians are outfitted with certified industrial safety helmets, high-visibility reflective vests, heavy-duty chemical-resistant gloves, non-slip steel-toe gumboots, and respiratory masks. We adhere to strict confined space safety protocols and never utilize hazardous manual scavenging.'
  },
  {
    q: 'Can you handle urgent or emergency drain blockage and tanker requirements?',
    a: 'Yes, we provide emergency industrial breakdown response for critical plant blockages, overflowing sumps, and post-storm waterlogging. You can reach our operations desk directly via phone at +91 98678 33456 or +91 99873 24798.'
  },
  {
    q: 'Are your invoices and quotations GST compliant?',
    a: 'Yes, Blue Bird Enterprises is a fully registered entity with GSTIN: 27EFDPP3303H1ZL and PAN: EFDPP3303H. All quotations and final tax invoices are prepared in strict accordance with statutory GST norms with detailed service descriptions.'
  }
];
