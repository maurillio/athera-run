import { testLLMConnection } from './lib/llm-client';

async function main() {
  console.log('🔍 Testing LLM connection...');
  console.log('Provider:', process.env.LLM_PROVIDER || 'abacusai (default)');
  console.log('Model:', process.env.LLM_MODEL || 'gpt-4o (default)');
  console.log('');
  
  const result = await testLLMConnection();
  
  console.log('Result:', result);
  
  if (result.success) {
    console.log('✅ LLM connection is working!');
  } else {
    console.log('❌ LLM connection failed!');
    console.log('Error:', result.message);
  }
}

main();
