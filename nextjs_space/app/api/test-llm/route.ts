import { NextResponse } from 'next/server';
import { testLLMConnection } from '@/lib/llm-client';

export async function GET() {
  try {
    const result = await testLLMConnection();

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Test failed',
      provider: process.env.LLM_PROVIDER || 'unknown',
    }, { status: 500 });
  }
}
