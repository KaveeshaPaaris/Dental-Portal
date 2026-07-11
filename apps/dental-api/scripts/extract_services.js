const fs = require('fs');

const lines = fs.readFileSync('C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\b3e8208a-f71d-4186-bc7d-e77a43018eb7\\.system_generated\\logs\\transcript.jsonl', 'utf-8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'VIEW_FILE' && data.content && data.content.includes('export const SERVICES: Service[] = [')) {
      console.log('Found SERVICES in log!');
      
      const content = data.content;
      // Extract the SERVICES array block
      const startIdx = content.indexOf('export const SERVICES: Service[] = [');
      if (startIdx > -1) {
        fs.writeFileSync('C:\\Users\\user\\Documents\\Dental Charming clinic\\Dental-Portal\\apps\\dental-api\\scripts\\extracted_services.ts', content);
        console.log('Saved to extracted_services.ts');
        break;
      }
    }
  } catch (e) {
    // ignore parse error
  }
}
