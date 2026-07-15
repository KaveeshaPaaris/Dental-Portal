import 'dotenv/config';
import { supabase } from './src/config/supabase';
import { createArticle } from './src/modules/knowledge-base/knowledge-base.service';

const articles = [
  {
    title: "Clinic Contact Information & Opening Hours",
    category: "Clinic Information",
    status: "PUBLISHED" as const,
    content: `Charming Dental Clinic is located at 97/7 Archbishop Nicholas Marcus Fernando Mawatha, Negombo, Sri Lanka.

**Contact Us:**
- Phone / WhatsApp: +94 71 810 9283
- Landline: +94 31 228 2526
- Email: charmingdental@gmail.com

**Working Hours:**
- Monday – Wednesday: 9:00 AM – 1:00 PM and 5:00 PM – 11:00 PM
- Thursday: 9:00 AM – 1:00 PM
- Friday: 9:00 AM – 5:00 PM
- Saturday: 3:30 PM – 11:00 PM
- Sunday: Call in Advance
- Poya Days (Full Moon): Closed

**How to book:**
Patients can easily book appointments by calling us, sending a WhatsApp message, or using the secure online booking form on our website.`
  },
  {
    title: "About the Doctor: Dr. Chaaminda Paaris",
    category: "Doctor Information",
    status: "PUBLISHED" as const,
    content: `**Dr. Chaaminda Paaris** is the Chief Dentist and founder of Charming Dental Clinic.

**Qualifications:**
- BDS (University of Peradeniya)
- DHDP (University of Colombo)
- SLMC Registration No.: 1634;

**Experience & Approach:**
Dr. Paaris brings 25+ years of clinical excellence to his practice. He is dedicated to delivering trusted, highly ethical, and patient-focused dental care. By combining state-of-the-art modern dentistry with a remarkably gentle and compassionate approach, he ensures every patient feels comfortable, safe, and entirely relaxed during their visits.`
  },
  {
    title: "Pricing Policy & Treatment Costs",
    category: "Pricing Policy",
    status: "PUBLISHED" as const,
    content: `**Cost of Dental Treatments**

At Charming Dental Clinic, we believe in providing personalized, high-quality care tailored to your unique needs. Because every patient's dental condition is completely different, we do not provide fixed prices or cost estimates online.

**How much does treatment cost?**
Treatment costs vary depending on the severity of your condition, the materials used, and the specific procedure required. 

**How to get an accurate price:**
We highly recommend booking a consultation with Dr. Chaaminda Paaris. During your visit, the doctor will perform a proper clinical examination, discuss your options, and provide a clear, accurate, and customized treatment plan along with an exact quotation. 

Please contact us via phone or WhatsApp to schedule your consultation!`
  },
  {
    title: "General Dentistry Services",
    category: "General Dentistry",
    status: "PUBLISHED" as const,
    content: `Comprehensive routine care designed to keep your smile perfectly healthy for life. Our general dentistry focuses on prevention, early detection, and thorough care for the whole family.

**What it includes:**
- Thorough oral examinations
- Professional teeth cleaning (Scaling)
- Cavity detection and prevention
- Personalised long-term treatment planning

**Key Benefits:**
- Early Detection: We catch cavities, gum disease, and oral cancer at the earliest possible stage.
- Professional Cleaning: Expert removal of stubborn tartar and plaque build-up.
- Personalised Care: Tailored treatment plans for every patient's unique mouth.`
  },
  {
    title: "Scaling & Polishing (Professional Teeth Cleaning)",
    category: "Scaling",
    status: "PUBLISHED" as const,
    content: `Professional deep cleaning to remove tartar, prevent gum disease, and restore a fresh, bright smile.

**What is it?**
Scaling uses specialised, gentle ultrasonic instruments to remove calculus (hardened tartar) and plaque deposits from above and below the gum line. Polishing gently sweeps away surface stains caused by coffee, tea, and pigmented foods.

**Key Benefits:**
- Prevents Gum Disease: Reduces inflammation, bleeding gums, and prevents periodontitis.
- Brighter Smile: Removes years of superficial surface staining.
- Fresh Breath: Dramatically improves oral freshness by removing hidden bacteria.`
  },
  {
    title: "Professional Teeth Whitening",
    category: "Whitening",
    status: "PUBLISHED" as const,
    content: `Professionally brighten your smile by several shades — safely, quickly, and highly effectively.

**What is it?**
Professional teeth whitening uses a clinically proven, concentrated gel to break apart deep stain molecules embedded in the enamel. We offer rapid in-office power whitening for immediate results.

**Key Benefits:**
- Dramatic Results: Lighten your teeth by up to 6–10 shades in a single session.
- Clinically Safe: Fully administered and monitored under expert professional supervision, unlike dangerous over-the-counter kits.
- Long-Lasting: With excellent oral hygiene, results can last between 12 to 24 months.`
  },
  {
    title: "Dental Fillings (Composite / Tooth-Coloured)",
    category: "Fillings",
    status: "PUBLISHED" as const,
    content: `Restore decayed, chipped, or damaged teeth with beautiful, natural-looking composite fillings.

**What is it?**
We strictly use composite resin — a highly advanced, tooth-coloured material that bonds seamlessly and directly to your natural tooth structure. It contains absolutely zero metal, meaning it requires far less drilling and preserves more of your healthy tooth.

**Key Benefits:**
- Natural Appearance: Custom shade-matched to perfectly blend with your exact tooth colour.
- Strong & Durable: Bonds chemically directly to the tooth to restore its original strength.
- Safe: 100% mercury-free and metal-free.`
  },
  {
    title: "Dental Crowns & Bridges",
    category: "Crowns & Bridges",
    status: "PUBLISHED" as const,
    content: `Restore heavily damaged teeth and replace missing ones with our precision-crafted ceramic restorations.

**What are they?**
- **Crown:** A protective, custom-made "cap" placed over a heavily decayed, fractured, or root-canal-treated tooth.
- **Bridge:** Uses two crowns on healthy adjacent teeth to securely anchor an artificial tooth in the gap between them. 
Both are custom-fabricated from premium porcelain or high-strength ceramic.

**Key Benefits:**
- Full Restoration: Completely encases, strengthens, and protects a vulnerable damaged tooth.
- Natural Aesthetics: Blends seamlessly with surrounding teeth for an invisible, natural appearance.
- Long-Term Durability: Designed to last 10–15 years or more with proper brushing and flossing.`
  },
  {
    title: "Dental Implants",
    category: "Implants",
    status: "PUBLISHED" as const,
    content: `The modern gold standard for replacing missing teeth — a permanent, entirely natural-feeling, and truly life-changing solution.

**What is it?**
A tiny, biocompatible titanium post is surgically and painlessly inserted into the jawbone to act as an artificial tooth root. Over 3–6 months, it naturally fuses with the bone. A custom porcelain crown is then permanently attached to the top.

**Key Benefits:**
- Permanent Solution: Securely fixed in place and can last a lifetime with good care.
- Bone Preservation: Actively stimulates the jaw and completely prevents the bone loss associated with missing teeth.
- Natural Function: Eat your favourite foods, speak clearly, and smile with absolute confidence.`
  },
  {
    title: "Orthodontic Treatment (Braces & Clear Aligners)",
    category: "Orthodontics",
    status: "PUBLISHED" as const,
    content: `Straighten your teeth, close gaps, and beautifully correct your bite with our modern, highly effective orthodontic treatments.

**What is it?**
We offer high-quality traditional metal braces, ceramic braces, and discreet clear aligner systems. Our treatments accurately correct crowding, spacing, and severe bite issues (overbite, underbite, crossbite) for both growing teenagers and adults.

**Key Benefits:**
- Perfect Alignment: Straighter teeth are significantly easier to clean, drastically reducing the risk of decay and gum disease.
- Better Bite Function: Properly aligned jaws reduce muscular jaw strain, cure headaches, and completely prevent uneven tooth wear.`
  },
  {
    title: "Tooth Extractions & Oral Surgery",
    category: "Extractions",
    status: "PUBLISHED" as const,
    content: `Highly safe, profoundly gentle tooth removal when saving the tooth is simply no longer clinically possible.

**What is it?**
We perform swift simple extractions for visible, unrestorable teeth using potent local anaesthesia, as well as complex surgical extractions for teeth broken below the gum line or painful impacted wisdom teeth.

**Essential Aftercare:**
- Bite firmly on the provided gauze pad for 30–45 minutes to stop bleeding.
- Do NOT rinse your mouth, spit forcefully, or use a drinking straw for at least 24 hours to protect the blood clot.
- Eat only soft, cool foods for the first few days.
- Avoid smoking completely.`
  },
  {
    title: "Dentures (Full & Partial)",
    category: "Dentures",
    status: "PUBLISHED" as const,
    content: `Restore your beautiful smile, facial structure, and chewing ability with our highly comfortable, custom-fitted modern dentures.

**What are they?**
Dentures are high-quality removable prosthetic appliances designed to replace missing teeth and surrounding tissues. Modern dentures are masterfully crafted from advanced acrylic or flexible nylon for a snug, custom fit. We also provide highly secure implant-retained dentures for patients seeking maximum stability without slipping.`
  },
  {
    title: "FAQs: General Dentistry & Appointments",
    category: "Frequently Asked Questions",
    status: "PUBLISHED" as const,
    content: `**Question: Can I book an appointment online?**
Answer: Yes, absolutely! You can easily book an appointment using the secure online form on our website, or by sending us a message on WhatsApp.
Keywords: book online, appointment, schedule, website booking, whatsapp

**Question: How often should I visit the dentist?**
Answer: For optimal oral health, we strongly recommend visiting the dentist for a routine check-up and professional cleaning every 6 months.
Keywords: how often, visit dentist, check-up frequency, 6 months, routine

**Question: Do you accept emergency patients?**
Answer: Yes, we try our best to accommodate dental emergencies. Please call us immediately or send a WhatsApp message so we can arrange to see you as soon as possible.
Keywords: emergency, pain, urgent, broken tooth, accident, walk-in

**Question: Can pregnant women visit the dentist?**
Answer: Yes! Routine dental care is completely safe and actually highly recommended during pregnancy to prevent pregnancy gingivitis. Please inform the doctor that you are pregnant before any X-rays or treatments.
Keywords: pregnant, pregnancy, safe, expecting mother

**Question: Do you treat nervous or anxious patients?**
Answer: Yes, absolutely. Dr. Paaris and our entire team are specially trained to treat highly anxious patients with deep empathy, patience, and a profoundly gentle touch.
Keywords: nervous, anxious, scared, fear, phobia, gentle`
  },
  {
    title: "FAQs: Orthodontics & Braces",
    category: "Frequently Asked Questions",
    status: "PUBLISHED" as const,
    content: `**Question: Do braces hurt?**
Answer: You may experience mild soreness for a few days after your braces are first fitted or tightened, but this is temporary. Braces do not cause sharp pain.
Keywords: braces hurt, pain, soreness, braces pain, tightening

**Question: Can adults get braces?**
Answer: Yes! It is never too late to straighten your teeth. We provide orthodontic treatments for both teenagers and adults, including discreet clear aligner options.
Keywords: adult braces, too old for braces, clear aligners, invisalign alternatives

**Question: How long does orthodontic treatment take?**
Answer: Treatment time varies widely depending on the complexity of your case, but it typically ranges from 12 to 24 months. 
Keywords: how long, duration, braces time, years

**Question: Can I eat normally with braces?**
Answer: You can eat most foods, but you must avoid very hard, sticky, or chewy foods (like hard candy, nuts, or chewing gum) as they can easily break your brackets.
Keywords: eat with braces, food restrictions, diet, break bracket`
  },
  {
    title: "FAQs: Whitening & Cosmetics",
    category: "Frequently Asked Questions",
    status: "PUBLISHED" as const,
    content: `**Question: How long does teeth whitening last?**
Answer: Professional teeth whitening can last anywhere from 12 to 24 months. However, consuming dark liquids like coffee, tea, or red wine, as well as smoking, will stain your teeth faster.
Keywords: whitening duration, how long, fade, stain, last

**Question: Can I drink coffee after teeth whitening?**
Answer: We strongly recommend avoiding coffee, tea, and highly coloured foods for at least 48 hours after your whitening treatment to prevent immediate staining while the enamel pores are open.
Keywords: coffee, tea, after whitening, diet, staining

**Question: What are veneers?**
Answer: Veneers are ultra-thin, custom-made shells of tooth-coloured porcelain or composite resin that are permanently bonded to the front surface of your teeth to instantly improve their appearance, colour, and shape.
Keywords: veneers, cosmetic, smile makeover, front teeth`
  },
  {
    title: "FAQs: Fillings & Extractions",
    category: "Frequently Asked Questions",
    status: "PUBLISHED" as const,
    content: `**Question: Can I eat immediately after a filling?**
Answer: Because we use modern light-cured composite fillings, they are fully hardened instantly! You can eat as soon as the numbness from the anaesthetic wears off (to avoid accidentally biting your lip or tongue).
Keywords: eat after filling, wait, food, numb

**Question: Can I brush my teeth after a tooth extraction?**
Answer: Yes, you should continue brushing your other teeth to keep your mouth clean, but you must strictly avoid brushing directly over the extraction wound for the first few days to protect the healing blood clot.
Keywords: brush after extraction, clean mouth, wound care, hygiene

**Question: What should I do if my filling falls out?**
Answer: Do not panic. Keep the area completely clean by gently brushing and rinsing with warm salt water, and contact the clinic immediately to book an appointment to have it replaced before decay sets in.
Keywords: filling fell out, broken filling, lost filling, emergency

**Question: Can wisdom teeth cause headaches?**
Answer: Yes. Impacted or erupting wisdom teeth can cause severe jaw pain, pressure, and inflammation, which frequently radiates upwards and causes severe headaches.
Keywords: wisdom teeth, headache, jaw pain, third molar, impacted`
  },
  {
    title: "FAQs: Pain, Gums & Oral Hygiene",
    category: "Frequently Asked Questions",
    status: "PUBLISHED" as const,
    content: `**Question: Why are my gums bleeding when I brush?**
Answer: Bleeding gums are the first major sign of Gingivitis (gum disease), usually caused by plaque and tartar buildup. You should book an appointment for a professional scaling and polishing immediately.
Keywords: bleeding gums, blood, brushing, gingivitis, gum disease, swollen

**Question: What causes bad breath?**
Answer: Bad breath (halitosis) is most commonly caused by poor oral hygiene, gum disease, hidden tooth decay, or bacteria on the tongue. A professional cleaning and check-up is the best way to eliminate it.
Keywords: bad breath, halitosis, smell, odour, stink

**Question: Why are my teeth so sensitive to cold water?**
Answer: Tooth sensitivity is usually caused by exposed tooth roots due to receding gums, worn enamel from brushing too hard, or an untreated cavity. Please visit the clinic for a professional diagnosis.
Keywords: sensitive teeth, cold water, hot, pain, ice, sensitivity

**Question: Is flossing really necessary?**
Answer: Yes! A toothbrush absolutely cannot reach the tight spaces between your teeth. Flossing daily is the only way to remove plaque and prevent hidden cavities from forming between your teeth.
Keywords: flossing, floss, necessary, between teeth, clean`
  },
  {
    title: "FAQs: Implants, Crowns & Dentures",
    category: "Frequently Asked Questions",
    status: "PUBLISHED" as const,
    content: `**Question: How long do dental implants last?**
Answer: With excellent oral hygiene and regular dental check-ups, the titanium implant post can last a lifetime. The porcelain crown attached to it may need replacing after 10 to 15 years due to normal wear.
Keywords: implant lifespan, how long, permanent, last, years

**Question: Do dentures feel natural?**
Answer: Modern custom dentures are designed to look highly natural and fit very comfortably. It usually takes 4 to 8 weeks for your mouth muscles to fully adapt to wearing them.
Keywords: dentures feel, natural, comfortable, fake teeth, getting used to

**Question: What is the difference between a crown and a veneer?**
Answer: A veneer is a thin shell that only covers the front surface of a tooth for cosmetic purposes. A crown completely encases the entire tooth, providing structural strength for teeth that are heavily decayed or broken.
Keywords: crown vs veneer, difference, cap, shell, front teeth`
  }
];

async function seedDatabase() {
  console.log('🌱 Starting Knowledge Base Redesign Seed...');

  try {
    // 1. Wipe existing knowledge base
    console.log('🗑️ Deleting old unoptimized articles...');
    const { error: deleteError } = await supabase
      .from('knowledge_base')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

    if (deleteError) {
      throw new Error(`Failed to delete old articles: ${deleteError.message}`);
    }

    // 2. Insert new articles and trigger chunk generation
    console.log(`📝 Inserting ${articles.length} new RAG-optimized articles...`);
    
    for (const article of articles) {
      console.log(`   -> Processing: "${article.title}"`);
      await createArticle(article);
    }

    console.log('✅ Success! The new knowledge base has been seeded.');
    console.log('⏳ Note: Chunk generation happens asynchronously in the background. It may take a minute for embeddings to finish processing.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
