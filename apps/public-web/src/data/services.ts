import {
  Stethoscope, Sparkles, Shield, Sun, Wand2, Layers,
  HeartPulse, Scissors, Crown, Anchor, Smile, AlignCenter,
  Activity, Baby,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Helper ─────────────────────────────────────────────────


// ─── Types ───────────────────────────────────────────────────
export type ServiceCategory = 'Preventive' | 'Cosmetic' | 'Restorative' | 'Orthodontics';

export interface ServiceBenefit {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface ServiceStep {
  title: string;
  desc: string;
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  title: string;
  category: ServiceCategory;
  icon: LucideIcon;

  // Images
  image: string;           // card thumbnail (home + listing)
  heroImage: string;       // detail page hero (can differ from card image)
  showBeforeAfter: boolean;
  beforeImage?: string;    // only when showBeforeAfter = true
  afterImage?: string;
  standaloneImage?: string;

  // Text
  shortDesc: string;
  listingDesc: string;
  highlights: string[];
  featured: boolean;

  // Detail page
  heroSummary: string;
  whatIs: string;
  whoBenefits: string[];
  benefits: ServiceBenefit[];
  steps: ServiceStep[];
  beforeCare: string[];
  afterCare: string[];
  faqs: ServiceFaq[];
  relatedSlugs: string[];
}

// ─── Services ────────────────────────────────────────────────
export const SERVICES: Service[] = [
  {
    slug: 'general-dentistry',
    title: 'General Dentistry',
    category: 'Preventive',
    icon: Stethoscope,
    image: '/general.png',
    heroImage: '/services/photo-1588776814546-daab30f310ce-1200.jpg',
    showBeforeAfter: false,
    standaloneImage: '/general.png',
    beforeImage: '/services/photo-1664529845836-433c172142ca-800.jpg',
    afterImage: '/services/photo-1489278353717-f64c6ee8a4d2-800.jpg',
    shortDesc: 'Comprehensive routine care to keep your smile healthy for life.',
    listingDesc: 'Our general dentistry services form the foundation of your long-term oral health. We focus on prevention, early detection, and thorough care for patients of all ages.',
    highlights: ['Comprehensive Oral Exams', 'Professional Cleanings', 'Oral Cancer Screening'],
    featured: true,
    heroSummary: 'Complete, compassionate dental care for every stage of life — from routine check-ups to complex diagnosis and treatment planning.',
    whatIs: 'General dentistry covers a wide range of procedures designed to maintain and improve your overall oral health. At Charming Dental Clinic, our general dentistry services include thorough examinations, professional teeth cleaning, cavity detection, and personalised treatment planning. We believe that a healthy smile begins with consistent, preventive care delivered by experienced professionals.',
    whoBenefits: [
      'Patients seeking routine annual or bi-annual check-ups',
      'Adults and children experiencing tooth pain or sensitivity',
      'Anyone who has not seen a dentist in over 12 months',
      'Patients wanting a complete oral health assessment',
      'Those with early signs of gum disease or decay',
    ],
    benefits: [
      { icon: Shield, title: 'Early Detection', desc: 'Catch cavities, gum disease, and oral cancer at the earliest stage when treatment is simplest and least invasive.' },
      { icon: Sparkles, title: 'Professional Cleaning', desc: 'Remove tartar and plaque build-up that regular brushing and flossing cannot eliminate on their own.' },
      { icon: HeartPulse, title: 'Personalised Care', desc: 'Every patient receives a treatment plan tailored to their unique oral health needs, history, and goals.' },
    ],
    steps: [
      { title: 'Initial Examination', desc: 'Our dentist performs a thorough visual inspection of your teeth, gums, bite, and surrounding oral tissues.' },
      { title: 'Professional Cleaning', desc: 'Our hygienist removes plaque, tartar, and surface stains, followed by flossing and polishing.' },
      { title: 'Treatment Planning', desc: 'We review your results and recommend any follow-up treatments, scheduling future visits to maintain your oral health.' },
    ],
    beforeCare: [
      'Brush and floss thoroughly before your appointment',
      'Note any areas of pain, sensitivity, or concern to discuss',
      'Bring a list of any medications you are currently taking',
      'Inform us of any health changes since your last visit',
    ],
    afterCare: [
      'Avoid eating for 30 minutes after a fluoride treatment if applied',
      'Continue your daily brushing and flossing routine',
      'Schedule your next check-up every 6 months as recommended',
      'Contact us promptly if any new sensitivity or pain arises',
    ],
    faqs: [
      { q: 'How often should I have a dental check-up?', a: 'Most patients benefit from visiting every 6 months. However, patients with gum disease or a history of cavities may need more frequent visits. We will advise the best schedule for you.' },
      { q: 'What happens if a cavity is found?', a: 'If a cavity is detected, we will discuss treatment options with you immediately. Small cavities are typically treated with a simple filling, while larger ones may require a crown or root canal.' },
      { q: 'Do you treat patients with dental anxiety?', a: 'Absolutely. Our team is trained to care for anxious patients with patience and empathy. We always explain each step before proceeding and can pause treatment at any time.' },
    ],
    relatedSlugs: ['scaling-polishing', 'preventive-care', 'dental-fillings'],
  },

  {
    slug: 'scaling-polishing',
    title: 'Scaling & Polishing',
    category: 'Preventive',
    icon: Sparkles,
    image: '/services/photo-1606811971618-4486d14f3f99-800.jpg',
    heroImage: '/services/photo-1698749778813-ad5f2814e50f-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/photo-1612736777093-461fb48101d7-800.jpg',
    afterImage: '/services/photo-1606811971618-4486d14f3f99-800.jpg',
    shortDesc: 'Professional deep cleaning to remove tartar and restore a fresh, bright smile.',
    listingDesc: 'Professional scaling and polishing removes hardened tartar deposits and stubborn surface stains that regular brushing cannot address, keeping your gums healthy and your smile radiant.',
    highlights: ['Tartar & Plaque Removal', 'Stain Elimination', 'Gum Health Improvement', 'Fresh Breath Restoration'],
    featured: false,
    heroSummary: 'A professional clean that goes beyond what your toothbrush can achieve — healthier gums, brighter teeth, and a cleaner, fresher feeling.',
    whatIs: 'Scaling and polishing is a professional dental cleaning procedure performed by our skilled dental hygienists. Scaling involves using specialised ultrasonic and hand instruments to remove calculus (hardened tartar) and plaque deposits from above and below the gum line. Polishing then removes surface stains from coffee, tea, and other pigmented foods, leaving your teeth feeling smooth and looking noticeably brighter.',
    whoBenefits: [
      'Anyone with visible tartar build-up or hardened deposits',
      'Patients with bleeding gums or early-stage gum disease',
      'Those with noticeable surface staining from tea, coffee, or tobacco',
      'Patients seeking fresher breath and improved oral hygiene',
      'Anyone due for their regular 6-month cleaning appointment',
    ],
    benefits: [
      { icon: Shield, title: 'Gum Disease Prevention', desc: 'Removing tartar below the gum line reduces inflammation and prevents the progression to periodontitis.' },
      { icon: Sun, title: 'Brighter Smile', desc: 'Professional polishing removes years of surface staining, giving your teeth a noticeably cleaner, more vibrant appearance.' },
      { icon: HeartPulse, title: 'Fresh Breath', desc: 'Bacterial deposits are a leading cause of bad breath. A thorough cleaning dramatically improves oral freshness.' },
    ],
    steps: [
      { title: 'Assessment', desc: 'We assess the extent of tartar build-up and any areas of gum inflammation before beginning treatment.' },
      { title: 'Ultrasonic Scaling', desc: 'An ultrasonic scaler uses gentle vibrations to break apart and remove heavy calculus deposits efficiently.' },
      { title: 'Hand Scaling', desc: 'Fine hand instruments are used to carefully clean between teeth and below the gum line for a thorough result.' },
      { title: 'Polishing', desc: 'A rotating brush with prophylaxis paste removes surface stains and polishes tooth surfaces to a smooth, clean finish.' },
      { title: 'Rinse & Review', desc: 'We rinse away all debris and review your home care routine, offering personalised brushing and flossing advice.' },
    ],
    beforeCare: [
      'Brush and floss as normal before your appointment',
      'Inform us if you have any gum sensitivity or bleeding',
      'Avoid strong-coloured drinks on the day of treatment',
    ],
    afterCare: [
      'Some mild sensitivity is normal for 24–48 hours after scaling',
      'Avoid hot, cold, or very hard foods immediately after treatment',
      'Use a soft-bristled toothbrush and gentle technique',
      'Return every 6 months to maintain results',
    ],
    faqs: [
      { q: 'Does scaling and polishing hurt?', a: 'Most patients experience little to no discomfort. Patients with sensitive gums may feel mild pressure during scaling, which our team minimises with gentle technique and breaks as needed.' },
      { q: 'How long does the procedure take?', a: 'A standard scaling and polishing session typically takes between 30 and 60 minutes depending on the level of tartar build-up.' },
      { q: 'How often should I get my teeth professionally cleaned?', a: 'We recommend every 6 months for most patients. Those with a history of gum disease may benefit from more frequent cleaning every 3–4 months.' },
      { q: 'Will it make my teeth whiter?', a: 'Scaling and polishing removes surface stains and restores the natural brightness of your teeth, but it is not a whitening treatment. For significantly whiter teeth, we recommend our professional teeth whitening service.' },
    ],
    relatedSlugs: ['general-dentistry', 'gum-disease-treatment', 'teeth-whitening'],
  },

  {
    slug: 'preventive-care',
    title: 'Preventive Dental Care',
    category: 'Preventive',
    icon: Shield,
    image: '/services/photo-1606811841689-23dfddce3e95-800.jpg',
    heroImage: '/services/photo-1606811951341-756fdd437682-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/photo-1606811841689-23dfddce3e95-800.jpg',
    afterImage: '/services/photo-1520013573795-38516d2661e4-800.jpg',
    shortDesc: 'Protect your smile before problems arise with our comprehensive preventive programme.',
    listingDesc: 'Our preventive care programme is designed to identify and intercept dental problems before they become costly or complex, helping you maintain excellent oral health long term.',
    highlights: ['Fluoride Treatments', 'Fissure Sealants', 'Mouthguard Fabrication', 'Dietary Counselling'],
    featured: false,
    heroSummary: 'The best dental treatment is the one you never need. Our preventive programme keeps your teeth and gums healthy for decades.',
    whatIs: 'Preventive dental care is a proactive approach to oral health focused on stopping problems before they start. Our preventive services include fluoride treatments to strengthen enamel, fissure sealants to protect the grooves of back teeth from decay, custom mouthguard fabrication for sports and teeth grinding, risk assessments, and dietary counselling. Prevention saves you time, money, and discomfort in the long run.',
    whoBenefits: [
      'Children and teenagers at high risk of tooth decay',
      'Athletes requiring custom sports mouthguards',
      'Patients who grind or clench their teeth at night',
      'Anyone with a history of frequent cavities',
      'Patients wanting to take a proactive approach to oral health',
    ],
    benefits: [
      { icon: Shield, title: 'Decay Prevention', desc: 'Fluoride and sealants provide a protective barrier that significantly reduces your risk of developing cavities.' },
      { icon: HeartPulse, title: 'Gum Health', desc: 'Regular preventive visits keep gums healthy and catch the earliest signs of periodontitis before irreversible damage occurs.' },
      { icon: Sparkles, title: 'Cost Savings', desc: 'Investing in prevention is far less expensive than restorative treatment — a filling costs a fraction of what a crown or implant does.' },
    ],
    steps: [
      { title: 'Risk Assessment', desc: 'We evaluate your individual risk factors for cavities, gum disease, and oral cancer based on your health history and lifestyle.' },
      { title: 'Preventive Treatments', desc: 'We apply fluoride varnish and place sealants on at-risk teeth to create a strong protective layer against decay.' },
      { title: 'Custom Appliances', desc: 'If needed, we take impressions for a custom nightguard or sports mouthguard for optimal protection and fit.' },
      { title: 'Home Care Education', desc: 'We provide personalised advice on brushing technique, flossing, diet, and products to maximise your preventive routine at home.' },
    ],
    beforeCare: [
      'Keep a note of any new symptoms, habits, or dietary changes to discuss',
      'Bring any existing mouthguards or appliances for assessment',
      'Inform us of any medications that cause dry mouth, as this increases cavity risk',
    ],
    afterCare: [
      'Avoid eating or drinking for 30 minutes after fluoride treatment',
      'Follow the personalised home care plan recommended by your dentist',
      'Return for regular check-ups to monitor effectiveness',
      'Replace your mouthguard annually or if it becomes worn or ill-fitting',
    ],
    faqs: [
      { q: 'At what age should children start preventive dental care?', a: 'We recommend a first dental visit by age 1, or when the first tooth appears. Early visits establish good habits and allow us to monitor development closely.' },
      { q: 'Do fissure sealants work for adults?', a: 'Yes, sealants can be applied to adult teeth that have deep grooves and no existing decay or fillings. They are particularly effective for premolars and molars.' },
      { q: 'How long does a nightguard last?', a: 'A well-maintained custom nightguard typically lasts 3–5 years. We can check the fit at each visit and reline or replace it when necessary.' },
    ],
    relatedSlugs: ['general-dentistry', 'scaling-polishing', 'pediatric-dentistry'],
  },

  {
    slug: 'teeth-whitening',
    title: 'Teeth Whitening',
    category: 'Cosmetic',
    icon: Sun,
    image: '/services/Gemini_Generated_Image_8st2s88st2s88st2 (1).png',
    heroImage: '/services/photo-1617812191081-2a24e3f30e45-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/Gemini_Generated_Image_kqvinlkqvinlkqvi.png',
    afterImage: '/services/Gemini_Generated_Image_sdvylwsdvylwsdvy.png',
    shortDesc: 'Professionally brighten your smile by several shades — safely and effectively.',
    listingDesc: 'Our professional teeth whitening treatments use clinically proven bleaching agents to remove deep intrinsic and surface stains, delivering dramatically brighter results than over-the-counter products.',
    highlights: ['In-Office Power Whitening', 'Take-Home Custom Kits', 'Safe for Enamel', 'Lasting 12–24 Months'],
    featured: true,
    heroSummary: 'Achieve a brilliantly bright, confident smile with professional-grade whitening — safe, fast, and far superior to anything available over the counter.',
    whatIs: 'Professional teeth whitening uses a concentrated hydrogen peroxide or carbamide peroxide gel to break apart deep stain molecules embedded in the enamel. Unlike supermarket whitening strips or toothpastes which only affect surface stains, professional whitening penetrates the enamel to lighten the underlying tooth colour by several shades. At Charming Dental Clinic, we offer both in-office power whitening for immediate results and custom take-home kits for gradual whitening at your convenience.',
    whoBenefits: [
      'Adults with staining from coffee, tea, red wine, or tobacco',
      'Patients whose teeth have naturally darkened or yellowed with age',
      'Anyone preparing for a wedding, event, or special occasion',
      'Patients who want a safe, clinically supervised brightening solution',
      'Those who have tried over-the-counter products without satisfying results',
    ],
    benefits: [
      { icon: Sun, title: 'Dramatic Results', desc: 'Professional whitening can lighten teeth by 6–10 shades in a single session, compared to 1–2 shades with supermarket products.' },
      { icon: Shield, title: 'Clinically Safe', desc: 'Our treatments are administered under professional supervision, protecting your gums and ensuring the concentration is appropriate for your enamel.' },
      { icon: Sparkles, title: 'Long-Lasting', desc: 'With proper maintenance and touch-up treatments, professional whitening results can last 12–24 months.' },
    ],
    steps: [
      { title: 'Pre-Whitening Check', desc: 'We examine your teeth and gums to confirm suitability and shade-match your current tooth colour for a clear before-and-after comparison.' },
      { title: 'Gum Protection', desc: 'A protective barrier is carefully applied to your gums to prevent the whitening agent from causing irritation.' },
      { title: 'Gel Application', desc: 'The professional whitening gel is applied to the tooth surfaces and activated. Multiple applications may be used within one session.' },
      { title: 'Results Review', desc: 'We rinse off the gel and compare your new shade to the original. Most patients achieve their target result in one visit.' },
    ],
    beforeCare: [
      'Have a professional cleaning done before whitening for best results',
      'Avoid red wine, coffee, tea, and tobacco for 24 hours before treatment',
      'Inform us of any known tooth sensitivity',
      'Do not use whitening toothpaste in the week before your appointment',
    ],
    afterCare: [
      'Avoid dark-coloured foods and drinks for 48 hours after treatment (the "white diet")',
      'Brush gently with a soft toothbrush and sensitivity toothpaste if needed',
      'Use the touch-up trays provided as directed to maintain results',
      'Return for a top-up treatment after 12–18 months as desired',
    ],
    faqs: [
      { q: 'Is teeth whitening safe?', a: 'Yes, when performed professionally. We use concentrations that are safe for enamel and protect your gums throughout the procedure. We screen for suitability before every treatment.' },
      { q: 'Will it cause sensitivity?', a: 'Some patients experience mild, temporary sensitivity for 24–48 hours after whitening. We recommend sensitivity toothpaste for the days following treatment, which resolves quickly.' },
      { q: 'Does whitening work on crowns or veneers?', a: 'Whitening agents only work on natural tooth enamel. Crowns, veneers, and composite restorations will not change colour. We can advise on managing this in your treatment plan.' },
      { q: 'How long do results last?', a: 'Most patients enjoy noticeably whiter teeth for 12–24 months. Results vary based on diet and lifestyle. We provide take-home trays for convenient touch-ups.' },
    ],
    relatedSlugs: ['aesthetic-treatments', 'scaling-polishing', 'general-dentistry'],
  },

  {
    slug: 'aesthetic-treatments',
    title: 'Aesthetic Dental Treatments',
    category: 'Cosmetic',
    icon: Wand2,
    image: '/services/photo-1567516364473-233c4b6fcfbe-800.jpg',
    heroImage: '/services/photo-1611166819595-ac34987dfa57-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/photo-1607278843240-419b8d83672d-800.jpg',
    afterImage: '/services/photo-1548382131-e0ebb1f0cdea-800.jpg',
    shortDesc: 'Transform your smile with expert cosmetic dentistry tailored to you.',
    listingDesc: 'From porcelain veneers to composite bonding and smile makeovers, our aesthetic dentistry services are designed to create natural-looking, beautiful results that complement your face and personality.',
    highlights: ['Porcelain Veneers', 'Composite Bonding', 'Smile Makeovers', 'Gum Contouring'],
    featured: true,
    heroSummary: 'A beautifully crafted smile can transform the way you look and feel. Our aesthetic treatments combine artistry with clinical precision for stunning, natural results.',
    whatIs: 'Aesthetic dental treatments encompass a range of cosmetic procedures designed to improve the appearance of your teeth, gums, and overall smile. This includes porcelain veneers — ultra-thin ceramic shells bonded to the front surface of teeth — composite bonding to reshape or repair chips and gaps, gum contouring to correct an uneven gum line, and comprehensive smile makeovers that combine multiple treatments into one cohesive plan. Every treatment is crafted with attention to proportion, symmetry, and your natural facial features.',
    whoBenefits: [
      'Patients with chipped, cracked, or worn teeth',
      'Those self-conscious about gaps between teeth or uneven sizing',
      'Patients with permanent staining unresponsive to whitening',
      'Anyone who wants a symmetrical, proportionate smile',
      'Patients preparing for a special occasion or life change',
    ],
    benefits: [
      { icon: Wand2, title: 'Natural-Looking Results', desc: 'Our restorations are crafted from high-quality ceramic and composite to perfectly mimic natural tooth texture and translucency.' },
      { icon: Sparkles, title: 'Minimally Invasive', desc: 'Modern aesthetic techniques preserve as much natural tooth structure as possible while achieving dramatic improvements.' },
      { icon: HeartPulse, title: 'Confidence Boost', desc: 'A smile you love positively impacts your self-confidence, social interactions, and quality of life.' },
    ],
    steps: [
      { title: 'Aesthetic Consultation', desc: 'We discuss your goals, review digital smile design options, and create a personalised treatment plan suited to your face and expectations.' },
      { title: 'Digital Smile Design', desc: 'We use photographs and digital tools to preview your planned result before any treatment begins, ensuring you are fully happy with the proposed outcome.' },
      { title: 'Treatment Delivery', desc: 'Procedures are carried out with precision and care, using high-quality materials and expert technique for beautiful, long-lasting results.' },
      { title: 'Review & Polish', desc: 'We review the completed work, make any fine adjustments, and polish every surface to a natural, flawless finish.' },
    ],
    beforeCare: [
      'Bring reference photos of smiles you admire to your consultation',
      'Have a dental cleaning done prior to aesthetic treatment',
      'Avoid making any irreversible decisions until after your digital smile preview',
    ],
    afterCare: [
      'Avoid biting hard foods with veneered teeth during the first week',
      'Do not use your teeth as tools — avoid opening packages or bottles',
      'Wear a nightguard if you clench or grind teeth to protect restorations',
      'Book a review appointment 4–6 weeks after treatment',
    ],
    faqs: [
      { q: 'How long do veneers last?', a: 'With proper care, porcelain veneers typically last 10–15 years. Composite veneers last 5–7 years. Both can be repaired or replaced when needed.' },
      { q: 'Is the treatment painful?', a: 'Most aesthetic procedures are minimally invasive and performed under local anaesthetic where needed. Patients are comfortable throughout.' },
      { q: 'How do I know if I am a good candidate?', a: 'The best candidates have healthy teeth and gums. We treat any underlying issues first before proceeding with cosmetic work to ensure lasting results.' },
    ],
    relatedSlugs: ['teeth-whitening', 'dental-crowns-bridges', 'orthodontic-treatment'],
  },

  {
    slug: 'dental-fillings',
    title: 'Dental Fillings',
    category: 'Restorative',
    icon: Layers,
    image: '/toot_filling.png',
    heroImage: '/services/photo-1495573020741-8a2f372bbec3-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/cavity.png',
    afterImage: '/filling.png',
    shortDesc: 'Restore decayed or damaged teeth with natural-looking composite fillings.',
    listingDesc: 'Modern tooth-coloured composite fillings restore decayed or damaged teeth to full function and appearance, offering a natural result that blends seamlessly with your existing teeth.',
    highlights: ['Tooth-Coloured Composite', 'Metal-Free Options', 'Single Appointment', 'Strengthens Damaged Teeth'],
    featured: false,
    heroSummary: 'Restore the health and appearance of decayed or damaged teeth with our natural-looking, durable composite fillings — completed in a single visit.',
    whatIs: 'A dental filling is a restorative procedure used to repair a tooth affected by decay, a crack, or a fracture. We use composite resin — a tooth-coloured material that bonds directly to the tooth structure — providing both strength and a natural appearance. Unlike traditional amalgam fillings, composite requires less removal of healthy tooth structure and contains no metal, making it the preferred choice for patients seeking aesthetically pleasing, biocompatible restorations.',
    whoBenefits: [
      'Patients diagnosed with one or more cavities',
      'Those with cracked, chipped, or worn teeth',
      'Patients wishing to replace old metal amalgam fillings',
      'Children and adults with decay identified during routine check-ups',
    ],
    benefits: [
      { icon: Sparkles, title: 'Natural Appearance', desc: 'Composite resin is shade-matched to your tooth colour, making fillings virtually invisible against your natural teeth.' },
      { icon: Shield, title: 'Strong & Durable', desc: 'Modern composites bond directly to tooth structure, restoring strength and providing a tight seal against further decay.' },
      { icon: HeartPulse, title: 'Conservative Treatment', desc: 'Composite fillings require less removal of healthy tooth structure compared to older alternatives, preserving more of your natural tooth.' },
    ],
    steps: [
      { title: 'Detailed Examination', desc: 'We confirm the extent of decay using a thorough examination, then discuss treatment with you before proceeding.' },
      { title: 'Local Anaesthesia', desc: 'A local anaesthetic is administered to ensure complete comfort throughout the procedure.' },
      { title: 'Decay Removal', desc: 'The decayed portion of the tooth is carefully removed, and the cavity is cleaned and prepared for the filling.' },
      { title: 'Filling Placement', desc: 'Composite resin is applied in layers, each cured with a special light, and shaped to restore the natural contour of the tooth.' },
      { title: 'Bite Check & Polish', desc: 'We check your bite and make fine adjustments before polishing the filling to a smooth, natural finish.' },
    ],
    beforeCare: [
      'No special preparation is required for a filling appointment',
      'Inform us if you have any known allergies or are taking blood thinners',
      'Eat a light meal before your appointment if anaesthesia will be used',
    ],
    afterCare: [
      'Avoid eating on the treated side until the anaesthetic wears off',
      'Some mild sensitivity to hot and cold is normal for 1–2 weeks',
      'Contact us if sensitivity persists beyond 2 weeks or if pain increases',
      'Maintain regular brushing, flossing, and check-ups',
    ],
    faqs: [
      { q: 'How long do composite fillings last?', a: 'With good oral hygiene, composite fillings typically last 7–10 years. They can be replaced or repaired as needed.' },
      { q: 'Does the procedure hurt?', a: 'No. Local anaesthetic ensures you are completely comfortable. Some patients feel mild pressure, but not pain.' },
      { q: 'Can I replace my old metal fillings?', a: 'Yes. Old amalgam fillings can be safely removed and replaced with tooth-coloured composite in most cases. We can assess your existing fillings at your next visit.' },
    ],
    relatedSlugs: ['general-dentistry', 'root-canal', 'dental-crowns-bridges'],
  },

  {
    slug: 'root-canal',
    title: 'Root Canal Treatment',
    category: 'Restorative',
    icon: HeartPulse,
    image: '/services/photo-1664529845836-433c172142ca-800.jpg',
    heroImage: '/services/photo-1551190822-a9333d879b1f-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/photo-1602932213623-cc17e9541bb4-800.jpg',
    afterImage: '/services/photo-1609840113564-ab4aba4956c4-800.jpg',
    shortDesc: 'Save an infected tooth and eliminate pain with expert endodontic care.',
    listingDesc: 'Root canal treatment removes infected or inflamed pulp tissue from inside the tooth, relieving pain and saving the natural tooth from extraction. Modern techniques make the procedure far more comfortable than its reputation suggests.',
    highlights: ['Tooth-Saving Procedure', 'Pain-Free Treatment', 'Same-Day Pain Relief', 'Prevents Extraction'],
    featured: true,
    heroSummary: 'Modern root canal treatment is comfortable, effective, and saves your natural tooth. Our skilled team ensures you leave pain-free and on the road to recovery.',
    whatIs: 'Root canal treatment (endodontic therapy) is performed when the soft tissue inside the tooth — the pulp — becomes infected or inflamed due to deep decay, a crack, or trauma. During treatment, the infected pulp is carefully removed, the root canals are cleaned, shaped, and disinfected, and the space is filled with a biocompatible material (gutta-percha). The tooth is then restored with a crown to protect it and return it to full function. Contrary to popular belief, modern root canal treatment is no more uncomfortable than having a standard filling.',
    whoBenefits: [
      'Patients with severe toothache or persistent throbbing pain',
      'Those with prolonged sensitivity to heat or cold',
      'Patients with a visible abscess, swelling, or discoloured tooth',
      'Anyone with a cracked tooth exposing the inner pulp',
      'Those who wish to save a tooth rather than extract it',
    ],
    benefits: [
      { icon: HeartPulse, title: 'Saves Your Natural Tooth', desc: 'Root canal treatment allows you to keep your natural tooth, which is always preferable to an extraction and replacement.' },
      { icon: Shield, title: 'Eliminates Infection', desc: 'By removing infected tissue, the procedure eliminates the source of pain and prevents the spread of infection to surrounding teeth and jaw.' },
      { icon: Sparkles, title: 'Restores Normal Function', desc: 'After treatment and crown placement, the tooth functions normally — you can bite and chew without any discomfort.' },
    ],
    steps: [
      { title: 'Thorough Diagnosis', desc: 'We examine the tooth and surrounding areas to assess the extent of infection and the anatomy of the root canals.' },
      { title: 'Local Anaesthesia', desc: 'A thorough local anaesthetic ensures you are completely comfortable throughout the procedure.' },
      { title: 'Pulp Removal', desc: 'A small opening is made in the crown of the tooth, and the infected pulp tissue is carefully removed from all canals.' },
      { title: 'Canal Cleaning & Shaping', desc: 'The canals are meticulously cleaned, shaped, and disinfected using fine instruments and irrigation.' },
      { title: 'Filling & Sealing', desc: 'The cleaned canals are filled with gutta-percha and sealed. A temporary or permanent restoration is placed.' },
      { title: 'Crown Placement', desc: 'A dental crown is recommended to protect the treated tooth, restore its full strength, and prevent future fracture.' },
    ],
    beforeCare: [
      'Take any prescribed antibiotics as directed before your appointment if infection is present',
      'Avoid eating for 2 hours before if sedation is planned',
      "Get a good night's sleep — a rested body responds better to treatment",
      'Inform us of any medication allergies or blood-thinning drugs',
    ],
    afterCare: [
      'Take prescribed pain relief or anti-inflammatories as directed',
      'Avoid chewing on the treated tooth until the crown is placed',
      'Apply an ice pack to the jaw for the first 24 hours if swelling occurs',
      'Do not ignore increasing pain — contact us immediately if pain worsens after 72 hours',
    ],
    faqs: [
      { q: 'Is root canal treatment painful?', a: 'Root canal treatment is performed under local anaesthesia and should be no more uncomfortable than having a filling. Most patients are pleasantly surprised by how manageable the procedure is.' },
      { q: 'How long does the treatment take?', a: 'Most root canal treatments are completed in 1–2 appointments of 60–90 minutes each, depending on the number of canals and severity of infection.' },
      { q: 'Is it better to extract the tooth instead?', a: 'Whenever possible, saving your natural tooth is the preferred option. Natural teeth function better, look better, and preserve jaw bone better than any replacement option.' },
      { q: 'How long does a root-canal-treated tooth last?', a: 'A properly treated tooth, protected with a crown and maintained with good oral hygiene, can last a lifetime.' },
    ],
    relatedSlugs: ['dental-crowns-bridges', 'dental-fillings', 'tooth-extractions'],
  },

  {
    slug: 'tooth-extractions',
    title: 'Tooth Extractions',
    category: 'Restorative',
    icon: Scissors,
    image: '/extraction.png',
    heroImage: '/services/photo-1588776813941-dcf9c55e84d2-1200.jpg',
    showBeforeAfter: false,
    standaloneImage: '/extraction.png',
    beforeImage: '/services/photo-1664529842504-5743d286ec1b-800.jpg',
    afterImage: '/services/photo-1588776814546-daab30f310ce-800.jpg',
    shortDesc: 'Safe, gentle tooth removal when saving the tooth is no longer possible.',
    listingDesc: 'When a tooth is too severely damaged or infected to save, our experienced team performs extractions with the utmost care to minimise discomfort and support fast healing.',
    highlights: ['Simple & Surgical Extractions', 'Wisdom Tooth Removal', 'Gentle Technique', 'Post-Extraction Guidance'],
    featured: false,
    heroSummary: 'When an extraction is unavoidable, our gentle, experienced approach ensures the procedure is as comfortable and straightforward as possible.',
    whatIs: 'A tooth extraction involves the careful removal of a tooth from its socket in the jawbone. Simple extractions are performed on visible teeth using local anaesthesia, while surgical extractions are required for teeth that are broken below the gum line, impacted, or positioned in a way that prevents straightforward removal. Common reasons for extraction include severe decay, advanced gum disease, overcrowding for orthodontic purposes, and impacted wisdom teeth.',
    whoBenefits: [
      'Patients with severely decayed or broken teeth beyond restoration',
      'Those with impacted or partially erupted wisdom teeth',
      'Patients requiring space creation for orthodontic treatment',
      'Those with advanced gum disease causing tooth loosening',
    ],
    benefits: [],
    steps: [
      { title: 'Clinical Assessment', desc: 'We examine the tooth and surrounding bone to plan the extraction technique and anticipate any complications.' },
      { title: 'Local Anaesthesia', desc: 'The area is thoroughly numbed so you feel only pressure, not pain, throughout the procedure.' },
      { title: 'Tooth Loosening', desc: 'The tooth is gently rocked back and forth using instruments called elevators to widen the socket and loosen the tooth ligament.' },
      { title: 'Extraction', desc: 'The tooth is carefully removed. For surgical extractions, a small incision may be made and the tooth may be sectioned for easier removal.' },
      { title: 'Post-Extraction Care', desc: 'Gauze is placed to control bleeding. We provide full written aftercare instructions and arrange a follow-up review.' },
    ],
    beforeCare: [
      'Inform us of all medications you take, especially blood thinners',
      'Do not smoke for 24 hours before your extraction',
      'Eat a light meal before your appointment unless instructed otherwise',
      'Arrange transport home if sedation or surgical extraction is planned',
    ],
    afterCare: [
      'Bite firmly on gauze for 30–45 minutes after the procedure',
      'Do not rinse, spit forcefully, or use a straw for 24 hours',
      'Apply an ice pack to your cheek for 20-minute intervals to reduce swelling',
      'Avoid smoking and alcohol for at least 48 hours',
      'Eat soft foods only for the first few days',
    ],
    faqs: [
      { q: 'Does the extraction hurt?', a: 'No. Local anaesthetic ensures you feel no pain. You will feel pressure and movement, but not pain. If you feel any discomfort, let us know and we will administer more anaesthetic.' },
      { q: 'How long does healing take?', a: 'The gum typically heals in 1–2 weeks. Underlying bone heals fully over 3–6 months. Most patients return to normal activities the following day.' },
      { q: 'What can I do about the gap left behind?', a: 'We strongly recommend replacing the missing tooth with a dental implant, bridge, or denture to prevent shifting of adjacent teeth and bone loss.' },
    ],
    relatedSlugs: ['dental-implants', 'dental-crowns-bridges', 'dentures'],
  },

  {
    slug: 'dental-crowns-bridges',
    title: 'Dental Crowns & Bridges',
    category: 'Restorative',
    icon: Crown,
    image: '/services/photo-1593022356769-11f762e25ed9-800.jpg',
    heroImage: '/services/photo-1670250721717-889b17349fc4-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/photo-1664530837411-0c2e8a3d4dca-800.jpg',
    afterImage: '/services/photo-1593022356769-11f762e25ed9-800.jpg',
    shortDesc: 'Restore damaged teeth and replace missing ones with precision-crafted restorations.',
    listingDesc: 'Custom-made crowns restore severely damaged teeth to full function and appearance, while dental bridges replace missing teeth by anchoring a pontic between two crowned adjacent teeth.',
    highlights: ['Porcelain & Ceramic Crowns', 'Fixed Dental Bridges', 'Colour-Matched Restorations', 'Long-Lasting Strength'],
    featured: false,
    heroSummary: "Precision-crafted crowns and bridges restore your smile's strength, function, and appearance with restorations that look and feel completely natural.",
    whatIs: 'A dental crown is a cap placed over a damaged, decayed, or root-canal-treated tooth to restore its shape, size, strength, and appearance. A dental bridge uses two crowns on adjacent teeth (abutments) to support one or more artificial teeth (pontics) in between, filling the gap left by a missing tooth. Both are custom-fabricated from high-quality porcelain or ceramic to match your natural tooth colour and are cemented permanently in place.',
    whoBenefits: [
      'Patients with a severely decayed or cracked tooth',
      'Those who have had root canal treatment requiring crown protection',
      'Patients with one or more missing teeth not suitable for implants',
      'Those with significantly worn or broken teeth',
    ],
    benefits: [
      { icon: Crown, title: 'Full Restoration', desc: 'Crowns completely encase and protect a damaged tooth, restoring it to its original shape, size, and function.' },
      { icon: Sparkles, title: 'Natural Aesthetics', desc: 'Porcelain crowns and bridges are colour-matched to your adjacent teeth, blending seamlessly for a natural appearance.' },
      { icon: Shield, title: 'Long-Term Durability', desc: 'With proper care, crowns and bridges last 10–15 years or more, providing reliable, cost-effective restoration.' },
    ],
    steps: [
      { title: 'Consultation & Planning', desc: 'We assess the tooth/teeth, and discuss the best material and design for your crown or bridge.' },
      { title: 'Tooth Preparation', desc: 'The tooth (or abutment teeth for a bridge) is shaped to create space for the restoration to fit accurately.' },
      { title: 'Impressions & Shade Matching', desc: 'Precise impressions are taken and your tooth shade is recorded to guide the fabrication of your custom restoration.' },
      { title: 'Temporary Restoration', desc: 'A temporary crown or bridge is placed to protect the prepared tooth while your permanent restoration is crafted.' },
      { title: 'Fitting & Cementation', desc: 'The finished restoration is checked for fit, bite, and aesthetics before being permanently cemented in place.' },
    ],
    beforeCare: [
      'Continue normal oral hygiene up to your appointment',
      'Discuss any concerns about the colour or shape of the restoration before treatment begins',
      'Avoid very hard or sticky foods immediately before your appointment if a temporary is in place',
    ],
    afterCare: [
      'Avoid very hard or sticky foods for the first 24 hours after cementation',
      'Clean around the crown or bridge carefully with floss threaders or interdental brushes',
      'Report any persistent bite discomfort or sensitivity within the first week',
      'Return for regular check-ups so we can monitor the crown margins and gum health',
    ],
    faqs: [
      { q: 'How long does it take to get a crown?', a: 'Typically, crowns require two appointments approximately 1–2 weeks apart. The first visit prepares the tooth and takes impressions; the second fits and cements the permanent crown.' },
      { q: 'Will the crown look natural?', a: 'Yes. We colour-match all porcelain and ceramic restorations to your existing teeth, ensuring a completely natural appearance.' },
      { q: 'Can I eat normally with a bridge?', a: 'Yes, a well-fitted bridge functions like natural teeth. We advise avoiding extremely hard foods and maintaining proper cleaning under the bridge.' },
    ],
    relatedSlugs: ['dental-implants', 'root-canal', 'dental-fillings'],
  },

  {
    slug: 'dental-implants',
    title: 'Dental Implants',
    category: 'Restorative',
    icon: Anchor,
    image: '/services/photo-1600170311833-c2cf5280ce49-800.jpg',
    heroImage: '/services/photo-1588776814546-1ffcf47267a5-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/photo-1609918438269-9a4c5f8fe3a4-800.jpg',
    afterImage: '/services/photo-1468493858157-0da44aaf1d13-800.jpg',
    shortDesc: 'The gold standard for replacing missing teeth — permanent, natural, and life-changing.',
    listingDesc: 'Dental implants are the most advanced, permanent solution for missing teeth. A titanium implant post is surgically placed in the jaw, then topped with a lifelike crown, functioning just like a natural tooth.',
    highlights: ['Permanent Tooth Replacement', 'Preserves Jaw Bone', 'Full Chewing Function', 'Natural-Looking Result'],
    featured: true,
    heroSummary: 'Dental implants are the closest thing to natural teeth — permanently anchored, beautifully lifelike, and designed to last a lifetime.',
    whatIs: 'A dental implant is a small titanium post surgically inserted into the jawbone to act as an artificial tooth root. Over the course of 3–6 months, the implant fuses with the surrounding bone through a process called osseointegration, creating a stable, permanent foundation. A custom-made porcelain crown is then attached to the implant via an abutment, completing the restoration. Implants preserve bone density, prevent adjacent teeth from shifting, and provide a level of function and aesthetics that no other replacement option can match.',
    whoBenefits: [
      'Adults with one or more missing teeth in generally good health',
      'Patients with sufficient jaw bone density to support an implant',
      'Those who want a permanent, low-maintenance replacement option',
      'Patients dissatisfied with loose or uncomfortable dentures',
      'Anyone who wants to eat, speak, and smile with complete confidence',
    ],
    benefits: [
      { icon: Anchor, title: 'Permanent Solution', desc: 'Unlike bridges or dentures, implants are permanently fixed in your jaw and can last a lifetime with proper care.' },
      { icon: Shield, title: 'Bone Preservation', desc: 'The titanium post stimulates the jawbone like a natural tooth root, preventing the bone loss that occurs after tooth loss.' },
      { icon: Sparkles, title: 'Natural Function', desc: 'Implants allow you to eat, speak, and smile with complete confidence — no slipping, no clicking, no dietary restrictions.' },
    ],
    steps: [
      { title: 'Comprehensive Assessment', desc: 'A full clinical examination assesses your bone density, anatomy, and suitability for implant placement.' },
      { title: 'Implant Placement', desc: 'Under local anaesthesia, the titanium implant post is carefully positioned in the jawbone at a precise angle and depth.' },
      { title: 'Osseointegration (Healing)', desc: 'Over 3–6 months, the implant fuses with the surrounding bone. A temporary restoration may be worn during this period.' },
      { title: 'Abutment Placement', desc: 'Once integration is confirmed, a small connector piece (abutment) is attached to the implant above the gum line.' },
      { title: 'Crown Fitting', desc: 'A custom-fabricated porcelain crown is attached to the abutment, completing your new tooth to a natural, precise fit.' },
    ],
    beforeCare: [
      'Have a thorough dental cleaning before implant surgery',
      'Quit smoking at least 2 weeks before — smoking significantly reduces implant success rates',
      'Inform us of all medical conditions and medications, especially bisphosphonates or blood thinners',
      'Arrange someone to drive you home after the implant placement procedure',
    ],
    afterCare: [
      'Apply ice packs to the cheek for the first 24 hours to reduce swelling',
      'Eat only soft foods for the first week following implant placement',
      'Do not smoke during the healing period — this is critical to success',
      'Brush the implant site gently and use prescribed antibacterial rinse',
      'Attend all follow-up appointments for osseointegration monitoring',
    ],
    faqs: [
      { q: 'Is the implant procedure painful?', a: 'The procedure is performed under local anaesthesia, so you should feel no pain. Post-operative discomfort is typically mild and well-managed with standard pain relief.' },
      { q: 'How long does the whole process take?', a: 'From implant placement to the final crown, the process typically takes 4–8 months to allow for proper healing and osseointegration.' },
      { q: 'What is the success rate of dental implants?', a: 'Dental implants have a success rate of over 95% in healthy patients. Smoking, uncontrolled diabetes, and certain medications can reduce success rates.' },
      { q: 'How do I care for my implant?', a: 'Care for an implant just like a natural tooth — twice-daily brushing, daily flossing, and regular professional check-ups. No special maintenance is required.' },
    ],
    relatedSlugs: ['dental-crowns-bridges', 'tooth-extractions', 'dentures'],
  },

  {
    slug: 'dentures',
    title: 'Dentures',
    category: 'Restorative',
    icon: Smile,
    image: '/services/photo-1566616213894-2d4e1baee5d8-800.jpg',
    heroImage: '/services/photo-1616286608358-0e1b143f7d2f-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/photo-1663182234283-28941e7612da-800.jpg',
    afterImage: '/services/photo-1620775997990-ee3c25938b4c-800.jpg',
    shortDesc: 'Restore your smile and chewing ability with comfortable, well-fitted dentures.',
    listingDesc: 'Custom-fitted full and partial dentures replace multiple missing teeth, restoring appearance and oral function. Modern dentures are more comfortable, natural-looking, and stable than ever before.',
    highlights: ['Full & Partial Dentures', 'Precision Custom Fit', 'Implant-Supported Options', 'Natural Appearance'],
    featured: false,
    heroSummary: 'Modern dentures are lightweight, natural-looking, and precisely fitted for maximum comfort — restoring your ability to eat, speak, and smile with confidence.',
    whatIs: 'Dentures are removable prosthetic appliances that replace missing teeth and the surrounding tissue. Full dentures replace all teeth in the upper or lower jaw, while partial dentures replace some teeth and are secured to remaining natural teeth. Modern dentures are crafted from acrylic or flexible nylon and are custom-fitted to your gum profile for optimal comfort and aesthetics. For greater stability, implant-retained dentures use 2–4 dental implants to anchor the denture firmly in place.',
    whoBenefits: [
      'Patients who have lost all or most of their teeth in one or both arches',
      'Those who require a more affordable alternative to multiple implants',
      'Patients whose existing dentures are ill-fitting, worn, or outdated',
      'Those wanting to restore their ability to eat a full diet with confidence',
    ],
    benefits: [
      { icon: Smile, title: 'Restored Confidence', desc: 'Dentures restore a full, natural-looking smile, improving your appearance and self-confidence significantly.' },
      { icon: HeartPulse, title: 'Improved Function', desc: 'Well-fitted dentures allow you to eat a varied, nutritious diet and speak clearly without difficulty.' },
      { icon: Shield, title: 'Prevents Facial Changes', desc: 'Replacing missing teeth prevents the facial sagging and sunken appearance that occurs with tooth loss over time.' },
    ],
    steps: [
      { title: 'Initial Assessment', desc: 'We examine your remaining teeth, gums, and bone structure and discuss the most appropriate denture type for your situation.' },
      { title: 'Impressions', desc: 'Precise impressions of your gums and any remaining teeth are taken to create custom-fitting dentures.' },
      { title: 'Bite Registration & Shade', desc: 'We record how your jaws relate to each other and select a tooth shade that complements your complexion.' },
      { title: 'Trial Denture', desc: 'A wax trial is assessed in your mouth so you can preview the fit, appearance, and bite before final fabrication.' },
      { title: 'Fitting & Adjustment', desc: 'Your finished dentures are fitted and adjusted for comfort. Follow-up adjustments are common during the settling-in period.' },
    ],
    beforeCare: [
      'Have any remaining teeth that need extraction removed before denture fitting',
      'Allow adequate healing time after extractions before impressions are taken',
      'Discuss your expectations for appearance and function honestly at your consultation',
    ],
    afterCare: [
      'Remove dentures at night and store in water or a denture cleaning solution',
      'Clean dentures daily with a denture brush and non-abrasive cleaner',
      'Rinse your gums with warm water each night after removing dentures',
      'Return for annual reviews — gum and bone changes affect denture fit over time',
    ],
    faqs: [
      { q: 'How long does it take to get used to dentures?', a: 'Most patients adapt within 4–8 weeks. Some speech difficulty and mild soreness are normal initially. Our team will provide follow-up adjustments to ensure optimal comfort.' },
      { q: 'Can I eat normally with dentures?', a: 'Yes, though you may initially need to start with softer foods and build up gradually. Implant-supported dentures provide even greater chewing efficiency.' },
      { q: 'Do dentures look natural?', a: 'Modern dentures are crafted to closely mimic natural teeth and gum tissue. Most people will not notice you are wearing dentures.' },
    ],
    relatedSlugs: ['dental-implants', 'tooth-extractions', 'dental-crowns-bridges'],
  },

  {
    slug: 'orthodontic-treatment',
    title: 'Orthodontic Treatment',
    category: 'Orthodontics',
    icon: AlignCenter,
    image: '/services/photo-1598256989800-fe5f95da9787-800.jpg',
    heroImage: '/services/photo-1609840114035-3c981b782dfe-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/photo-1598256989800-fe5f95da9787-800.jpg',
    afterImage: '/services/photo-1677026010083-78ec7f1b84ed-800.jpg',
    shortDesc: 'Straighten your teeth and correct your bite with modern, discreet orthodontics.',
    listingDesc: 'From traditional braces to clear aligners, our orthodontic treatments correct misaligned teeth and bite issues for both teenagers and adults, improving both aesthetics and long-term oral health.',
    highlights: ['Clear Aligners', 'Traditional Braces', 'Retainers & Maintenance', 'Suitable for All Ages'],
    featured: true,
    heroSummary: 'A straight, well-aligned smile is about more than appearance — it improves oral health, bite function, and long-term dental stability.',
    whatIs: 'Orthodontic treatment uses controlled forces to gradually move teeth into their ideal positions, correcting crowding, spacing, and bite issues. Modern orthodontics offers several approaches: traditional metal braces use brackets and wires affixed to the teeth, while clear aligner systems use a series of removable, virtually invisible plastic trays. Treatment duration varies from 6 months to 2 years depending on complexity. After active treatment, retainers are worn to maintain the results.',
    whoBenefits: [
      'Children, teenagers, and adults with crooked, crowded, or gapped teeth',
      'Patients with overbite, underbite, crossbite, or open bite',
      'Those experiencing jaw discomfort or difficulty chewing due to misalignment',
      'Adults seeking a discreet option like clear aligners',
      'Anyone wanting to improve their smile aesthetics and long-term dental health',
    ],
    benefits: [
      { icon: AlignCenter, title: 'Perfect Alignment', desc: 'Correctly aligned teeth are easier to clean, reducing the lifetime risk of decay, gum disease, and wear.' },
      { icon: Sparkles, title: 'Improved Confidence', desc: 'A straight smile you are proud of positively impacts confidence in social and professional settings.' },
      { icon: HeartPulse, title: 'Better Bite Function', desc: 'Correcting bite issues reduces jaw strain, prevents uneven tooth wear, and can resolve headaches caused by TMJ dysfunction.' },
    ],
    steps: [
      { title: 'Orthodontic Assessment', desc: 'We take photographs and study models to fully analyse your teeth, bite, and jaw relationships.' },
      { title: 'Treatment Planning', desc: 'A detailed treatment plan is created outlining the recommended appliance, expected duration, and anticipated results.' },
      { title: 'Appliance Fitting', desc: 'Braces are bonded to the teeth, or the first clear aligner tray is provided, along with instructions for wear and care.' },
      { title: 'Regular Adjustments', desc: 'You attend regular appointments (every 6–8 weeks) for wire changes, aligner progressions, and progress monitoring.' },
      { title: 'Retention Phase', desc: 'After achieving ideal alignment, braces are removed and custom retainers are provided to maintain your results long-term.' },
    ],
    beforeCare: [
      'Complete any necessary fillings or extractions before orthodontic treatment begins',
      'Have a professional cleaning done immediately before bonding braces',
      'Discuss lifestyle considerations (diet restrictions, sports) with your orthodontist',
    ],
    afterCare: [
      'Wear retainers as instructed — consistent wear is critical to maintaining results',
      'Clean between braces or under aligners meticulously to prevent decay',
      'Avoid hard, chewy, or sticky foods that could damage brackets',
      'Attend all scheduled adjustment appointments',
    ],
    faqs: [
      { q: 'Am I too old for orthodontic treatment?', a: 'Absolutely not. Adults of any age can benefit from orthodontic treatment. Clear aligners are particularly popular among adults for their discreet appearance.' },
      { q: 'How long does treatment take?', a: 'Treatment duration ranges from 6 months for minor corrections to 2 years for complex cases. Clear aligners for mild issues can take as little as 3–6 months.' },
      { q: 'Are clear aligners as effective as braces?', a: 'For many cases, clear aligners are equally effective. More complex cases may require braces for better control. We will recommend the most appropriate option after your assessment.' },
      { q: 'Will orthodontic treatment hurt?', a: 'Some pressure and mild soreness for 2–3 days after each adjustment is normal. Over-the-counter pain relief helps, and the discomfort reduces significantly as treatment progresses.' },
    ],
    relatedSlugs: ['aesthetic-treatments', 'general-dentistry', 'preventive-care'],
  },

  {
    slug: 'gum-disease-treatment',
    title: 'Gum Disease Treatment',
    category: 'Preventive',
    icon: Activity,
    image: '/services/photo-1629909613654-28e377c37b09-800.jpg',
    heroImage: '/services/photo-1522849696084-818b29dfe210-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/photo-1660732205495-f65510d8180e-800.jpg',
    afterImage: '/services/photo-1585909085111-2c2f311643af-800.jpg',
    shortDesc: 'Restore gum health and protect your teeth from the most common dental disease.',
    listingDesc: 'Gum disease affects the majority of adults to some degree. Our periodontal treatments range from deep cleaning to advanced gum therapy, designed to halt disease progression and restore gum health.',
    highlights: ['Deep Scaling & Root Planing', 'Periodontal Assessment', 'Antibiotic Therapy', 'Ongoing Maintenance'],
    featured: false,
    heroSummary: 'Gum disease is the leading cause of adult tooth loss — but with early intervention and expert treatment, it is highly manageable.',
    whatIs: 'Gum disease (periodontal disease) is an infection of the structures surrounding and supporting the teeth — the gums, periodontal ligament, and bone. It begins as gingivitis (inflamed gums) and can progress to periodontitis, which causes irreversible bone loss around the teeth. Treatment depends on the stage of the disease and includes professional deep cleaning (scaling and root planing), antibiotic therapy, and in advanced cases, surgical intervention. With proper treatment and maintenance, the disease can be controlled and its progression halted.',
    whoBenefits: [
      'Patients with bleeding, swollen, or receding gums',
      'Those with persistent bad breath that does not respond to brushing',
      'Patients with loose teeth or spaces opening between teeth',
      'Smokers and diabetics at elevated risk of periodontal disease',
      'Anyone who has not had a professional cleaning in over 12 months',
    ],
    benefits: [
      { icon: Activity, title: 'Disease Control', desc: 'Professional treatment halts the progression of gum disease and prevents further bone and tissue loss.' },
      { icon: Shield, title: 'Tooth Preservation', desc: 'Treating gum disease is the single most effective way to prevent tooth loss in adults.' },
      { icon: HeartPulse, title: 'Systemic Health Benefits', desc: 'Treating gum disease has been linked to improved control of diabetes, heart health, and reduced systemic inflammation.' },
    ],
    steps: [
      { title: 'Periodontal Assessment', desc: 'We measure the depth of the pockets around each tooth using a probe, identifying areas of active disease.' },
      { title: 'Oral Hygiene Instruction', desc: 'Personalised brushing and interdental cleaning techniques are shown and practised to remove plaque effectively at home.' },
      { title: 'Deep Cleaning (SRP)', desc: 'Scaling and root planing removes tartar and bacterial deposits from below the gum line under local anaesthesia.' },
      { title: 'Antibiotic Therapy', desc: 'Topical or systemic antibiotics may be prescribed to eliminate remaining bacteria and reduce pocket depths.' },
      { title: 'Maintenance Programme', desc: 'Regular 3–4 monthly hygiene appointments monitor your gum health and prevent recurrence of active disease.' },
    ],
    beforeCare: [
      'Inform us of any medications you are taking, particularly blood thinners',
      'Note any symptoms — bleeding on brushing, gum recession, or loose teeth',
      'Improve your home oral hygiene routine as much as possible before treatment',
    ],
    afterCare: [
      'Use a prescribed antiseptic mouthwash for 2 weeks after deep cleaning',
      'Brush and floss as directed — good home care is essential to treatment success',
      'Do not smoke — smoking dramatically reduces treatment effectiveness',
      'Attend all maintenance appointments without delay',
    ],
    faqs: [
      { q: 'Can gum disease be cured?', a: 'Gingivitis is fully reversible with professional treatment and improved home care. Advanced periodontitis cannot be completely reversed, but it can be effectively controlled to prevent further progression.' },
      { q: 'Is gum disease linked to other health problems?', a: 'Research increasingly links untreated gum disease to cardiovascular disease, diabetes complications, adverse pregnancy outcomes, and other systemic conditions.' },
      { q: 'Why do my gums bleed when I brush?', a: 'Bleeding gums are the primary early sign of gingivitis. Contrary to popular belief, healthy gums do not bleed with normal brushing. Please book an appointment so we can assess and treat the cause.' },
    ],
    relatedSlugs: ['scaling-polishing', 'general-dentistry', 'preventive-care'],
  },

  {
    slug: 'pediatric-dentistry',
    title: 'Pediatric Dentistry',
    category: 'Preventive',
    icon: Baby,
    image: '/services/photo-1631051103633-24959376b92d-800.jpg',
    heroImage: '/services/photo-1565090568947-7293970ba471-1200.jpg',
    showBeforeAfter: true,
    beforeImage: '/services/photo-1598256989809-394fa4f6cd26-800.jpg',
    afterImage: '/services/photo-1631051103633-24959376b92d-800.jpg',
    shortDesc: 'Gentle, friendly dental care for children that builds positive lifelong habits.',
    listingDesc: 'Our child-friendly dental services create a safe, positive experience for young patients from their very first visit. We focus on prevention, education, and building trust to last a lifetime.',
    highlights: ['Infant & Toddler Check-Ups', 'Fissure Sealants', 'Fluoride Treatments', 'Dental Habit Counselling'],
    featured: false,
    heroSummary: "A child's first dental experience shapes their attitude toward oral health for life. We make every visit positive, gentle, and educational.",
    whatIs: "Pediatric dentistry focuses on the oral health of infants, children, and teenagers. Children's teeth and developing jaws have unique needs that require specialised knowledge and a patient-centred approach. Our services for young patients include first dental visits, comprehensive check-ups, fluoride applications, fissure sealants for decay prevention, guidance on thumb sucking and pacifier habits, management of dental trauma, and preparing teenagers for adult orthodontic care.",
    whoBenefits: [
      'Infants and toddlers from the time the first tooth appears',
      'School-age children for regular check-ups and decay prevention',
      'Teenagers requiring orthodontic assessment or wisdom tooth monitoring',
      'Children with dental anxiety who need a gentle, supportive environment',
    ],
    benefits: [
      { icon: Baby, title: 'Positive Early Experiences', desc: 'A calm, friendly first dental visit builds trust and prevents the dental anxiety that affects many adults.' },
      { icon: Shield, title: 'Decay Prevention', desc: "Fluoride treatments and sealants significantly reduce a child's risk of developing cavities in baby and adult teeth." },
      { icon: HeartPulse, title: 'Healthy Development', desc: 'Regular monitoring ensures correct tooth eruption, jaw development, and early identification of orthodontic needs.' },
    ],
    steps: [
      { title: 'Welcome & Introduction', desc: 'We introduce the child to the dental environment gently, allowing them to explore instruments and ask questions at their own pace.' },
      { title: 'Examination', desc: 'A friendly but thorough examination of the teeth, gums, bite, and oral development is performed in a relaxed, age-appropriate way.' },
      { title: 'Preventive Treatments', desc: 'Fluoride varnish is applied and sealants are placed on permanent back teeth to protect against cavities.' },
      { title: 'Parent Education', desc: 'We discuss findings with parents and provide guidance on diet, brushing technique, pacifier use, and what to expect at each developmental stage.' },
    ],
    beforeCare: [
      'Talk positively about the dentist visit with your child beforehand',
      'Read books about dentist visits to young children to familiarise them',
      'Avoid mentioning pain or needles in conversation — let us introduce procedures in a child-friendly way',
      'Schedule morning appointments when children are typically more cooperative',
    ],
    afterCare: [
      'Praise your child enthusiastically after their visit, regardless of how it went',
      'Implement the brushing and dietary advice given at the appointment',
      'Follow up on any treatments recommended — baby teeth are important',
      'Maintain 6-monthly check-ups to build a consistent, positive dental routine',
    ],
    faqs: [
      { q: 'When should I bring my child for their first dental visit?', a: 'We recommend the first visit when the first baby tooth appears, or by the age of 12 months at the latest. Early visits prevent problems and establish a positive dental relationship.' },
      { q: 'Do baby teeth really matter if they will fall out?', a: 'Yes, absolutely. Baby teeth maintain space for adult teeth, support speech and eating, and a decayed baby tooth can infect the developing adult tooth beneath it.' },
      { q: 'My child is scared of the dentist. What do you recommend?', a: 'Our team is specially trained in child communication and gentle techniques. We build rapport slowly, never force procedures, and use positive reinforcement throughout every visit.' },
    ],
    relatedSlugs: ['preventive-care', 'general-dentistry', 'orthodontic-treatment'],
  },
];

// ─── Exports ─────────────────────────────────────────────────
export const FEATURED_SERVICES = SERVICES.filter((s) => s.featured);

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getRelatedServices(slugs: string[]): Service[] {
  return slugs
    .map((slug) => getServiceBySlug(slug))
    .filter((s): s is Service => s !== undefined);
}

export const CATEGORIES: ServiceCategory[] = ['Preventive', 'Cosmetic', 'Restorative', 'Orthodontics'];
