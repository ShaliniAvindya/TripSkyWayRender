/**
 * List Available Gemini Models
 * This script calls the ListModels API to see which models are available
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from Server directory
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function listGeminiModels() {
  console.log('\n🔍 Listing Available Gemini Models');
  console.log('============================================================\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ GEMINI_API_KEY not found in .env');
    return;
  }

  const trimmedKey = apiKey.trim();
  console.log(`API Key Preview: ${trimmedKey.substring(0, 10)}...\n`);

  // Try different API versions
  const apiVersions = ['v1', 'v1beta'];

  for (const version of apiVersions) {
    try {
      console.log(`📡 Checking ${version} API...`);
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${trimmedKey}`;
      
      console.log(`URL: ${url.replace(trimmedKey, 'AIzaSy...')}\n`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`Status: ${response.status} ${response.statusText}\n`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Failed: ${errorText.substring(0, 300)}`);
        console.log('\n');
        continue;
      }

      const data = await response.json();
      
      if (data.models && Array.isArray(data.models)) {
        console.log(`✅ Found ${data.models.length} models in ${version}:\n`);
        
        // Filter models that support generateContent
        const generateContentModels = data.models.filter(model => 
          model.supportedGenerationMethods && 
          model.supportedGenerationMethods.includes('generateContent')
        );

        console.log(`📝 Models supporting generateContent (${generateContentModels.length}):`);
        generateContentModels.forEach(model => {
          console.log(`   ✅ ${model.name}`);
          if (model.displayName) {
            console.log(`      Display: ${model.displayName}`);
          }
          if (model.description) {
            console.log(`      Description: ${model.description.substring(0, 100)}...`);
          }
        });
        
        console.log('\n');
        
        // Test the first available model
        if (generateContentModels.length > 0) {
          const testModel = generateContentModels[0];
          const modelName = testModel.name.replace(`models/`, '');
          console.log(`🧪 Testing with model: ${modelName}...`);
          
          const generateUrl = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${trimmedKey}`;
          
          const testResponse = await fetch(generateUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: 'Say hello in one sentence'
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 50,
              }
            }),
          });

          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log(`✅ SUCCESS! Model ${modelName} works!`);
            console.log(`Response: ${testData.candidates[0].content.parts[0].text}`);
            console.log(`\n✅ Use this model: ${modelName}`);
            console.log(`✅ Use this API version: ${version}`);
            console.log('\n');
            return; // Success, exit
          } else {
            const errorText = await testResponse.text();
            console.log(`❌ Test failed: ${errorText.substring(0, 200)}`);
          }
        }
      } else {
        console.log('⚠️  Unexpected response format:', JSON.stringify(data, null, 2).substring(0, 500));
      }
      
      console.log('\n');
    } catch (error) {
      console.log(`❌ Error checking ${version}: ${error.message}`);
      console.log('\n');
    }
  }

  console.log('============================================================\n');
}

listGeminiModels().catch(console.error);
