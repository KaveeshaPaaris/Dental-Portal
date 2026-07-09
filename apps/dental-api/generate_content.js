const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generateContent(serviceData, retries = 3) {
  const prompt = `You are an expert medical writer for a dental clinic in Sri Lanka.
Rewrite the following dental service into a highly educational, neutral, and evidence-based tone.

RULES:
- Do NOT write marketing content, exaggerate benefits, or make promises.
- NO promotional language (Avoid "We use", "Our specialists", "Our technology", "Our clinic provides", etc.)
- Tone: Professional, trustworthy, cautious, and medical-industry-standard (use "typically", "in most cases", "your dentist will assess").
- DO NOT use words like: "guaranteed", "100%", "pain-free", "best in", "no risk", "permanent".
- Do not invent services, mention costs, financing, or offers.
- Target around 900-1500 words across all generated text.

JSON FORMAT REQUIRED:
{
  "intro": "100-150 words introducing what the treatment is, why it is commonly performed, and its general purpose.",
  "about": "A detailed section explaining what it is, how it works, and common conditions it helps manage.",
  "commonSigns": ["Reason 1", "Reason 2", "Reason 3"], // STRICT RULE: Do not use diagnostic language here. Frame these as reasons to book a consultation, NOT definitive symptoms meaning a specific disease.
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"], // Exactly 3-5 plain string bullet points
  "steps": [
    { "title": "Step name", "desc": "General treatment journey step." }
  ],
  "afterCare": [
    "Advice 1", "Advice 2"
  ],
  "faqs": [
    { "q": "Patient question?", "a": "Concise answer without promotional language." }
  ],
  "bottomLine": "2-3 sentence plain-English summary of the treatment"
}
Ensure exactly 3-5 benefits (plain strings), 4-6 FAQs, 4-6 aftercare tips, and 3-6 common signs.

ORIGINAL SERVICE DATA:
${JSON.stringify(serviceData, null, 2)}
`;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error(`API Error (${data.error.status}): ${data.error.message}`);
        if (data.error.code === 429 || data.error.code === 503) {
          console.log(`Retrying in 10 seconds (Attempt ${i + 1}/${retries})...`);
          await sleep(10000);
          continue;
        }
        return null;
      }

      const text = data.candidates[0].content.parts[0].text;
      
      const blocklist = ['guaranteed', '100%', 'pain-free', 'best in', 'no risk', 'permanent'];
      const textLower = text.toLowerCase();
      const blockedWord = blocklist.find(word => textLower.includes(word));
      if (blockedWord) {
        console.warn(`[Blocked] Output contained restricted word: "${blockedWord}". Retrying...`);
        await sleep(10000);
        continue;
      }

      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini response or fetch", e.message);
      await sleep(10000);
    }
  }
  return null;
}

async function main() {
  const file = path.join(__dirname, '..', 'public-web', 'src', 'data', 'services.ts');
  let content = fs.readFileSync(file, 'utf8');

  const blocks = [];
  const parts = content.split("slug: '");
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const slug = part.split("'")[0];
    
    // Find where this object ends (roughly the next 'slug:' or end of array)
    const endIdx = part.lastIndexOf('relatedSlugs:');
    if (endIdx === -1) continue;
    
    // We get the full chunk corresponding to the object
    const chunkEnd = part.indexOf('  },', endIdx) + 4;
    const fullMatch = "slug: '" + part.substring(0, chunkEnd);
    
    blocks.push({ fullMatch, slug });
  }

  console.log(`Found ${blocks.length} services.`);
  
  let newContent = content;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    console.log(`Processing [${i+1}/${blocks.length}] ${block.slug}...`);
    
    // We only need the title and old desc to feed the AI. Let's parse out title, shortDesc, whatIs manually.
    const titleMatch = block.fullMatch.match(/title:\s*'([^']+)'/);
    const whatIsMatch = block.fullMatch.match(/whatIs:\s*'([^']+)'/);
    
    const serviceData = {
      slug: block.slug,
      title: titleMatch ? titleMatch[1] : block.slug,
      whatIs: whatIsMatch ? whatIsMatch[1] : ""
    };

    const newJson = await generateContent(serviceData);
    if (!newJson) continue;

    // Now replace the fields in the block.
    // 1. replace whatIs: '...', with intro and about
    let newBlock = block.fullMatch;
    
    const introStr = JSON.stringify(newJson.intro || "");
    const aboutStr = JSON.stringify(newJson.about || "");
    const commonSignsStr = JSON.stringify(newJson.commonSigns || []);
    const bottomLineStr = JSON.stringify(newJson.bottomLine || "");
    
    const introAboutStr = `intro: ${introStr},\n    about: ${aboutStr},\n    commonSigns: ${commonSignsStr},\n    bottomLine: ${bottomLineStr},\n    whatIs: ${introStr},`;
    
    // replace whatIs
    newBlock = newBlock.replace(/whatIs:\s*'[^']+',/, introAboutStr);
    
    // 2. replace benefits array (now string array)
    const benefitsRegex = /benefits:\s*\[[\s\S]*?\],/;
    
    let benefitsStr = `benefits: [\n`;
    (newJson.benefits || []).forEach((b) => {
      // Handle legacy object just in case the AI messed up
      const benefitText = typeof b === 'string' ? b : (b.desc || b.title);
      benefitsStr += `      ${JSON.stringify(benefitText)},\n`;
    });
    benefitsStr += `    ],`;
    
    if (newBlock.match(benefitsRegex)) {
        newBlock = newBlock.replace(benefitsRegex, benefitsStr);
    }

    // 3. replace steps array
    const stepsRegex = /steps:\s*\[[\s\S]*?\],/;
    let stepsStr = `steps: [\n`;
    (newJson.steps || []).forEach(s => {
      stepsStr += `      { title: ${JSON.stringify(s.title)}, desc: ${JSON.stringify(s.desc)} },\n`;
    });
    stepsStr += `    ],`;
    if (newBlock.match(stepsRegex)) {
        newBlock = newBlock.replace(stepsRegex, stepsStr);
    }
    
    // 4. replace faqs array
    const faqsRegex = /faqs:\s*\[[\s\S]*?\],/;
    let faqsStr = `faqs: [\n`;
    (newJson.faqs || []).forEach(f => {
      faqsStr += `      { q: ${JSON.stringify(f.q)}, a: ${JSON.stringify(f.a)} },\n`;
    });
    faqsStr += `    ],`;
    if (newBlock.match(faqsRegex)) {
        newBlock = newBlock.replace(faqsRegex, faqsStr);
    }

    // 5. replace afterCare array
    const afterCareRegex = /afterCare:\s*\[[\s\S]*?\],/;
    let afterCareStr = `afterCare: [\n`;
    (newJson.afterCare || []).forEach(a => {
      afterCareStr += `      ${JSON.stringify(a)},\n`;
    });
    afterCareStr += `    ],`;
    if (newBlock.match(afterCareRegex)) {
        newBlock = newBlock.replace(afterCareRegex, afterCareStr);
    }

    newContent = newContent.replace(block.fullMatch, newBlock);
    
    // Save incrementally
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Saved ${block.slug}`);
    
    // Wait 10 seconds to avoid API rate limits
    if (i < blocks.length - 1) {
      console.log('Waiting 10s before next request...');
      await sleep(10000);
    }
  }
  console.log("Done updating all services.");
}

main();
