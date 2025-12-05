import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Pool } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Resetar quinta 27/11/2025 (running planejado bugado)
    const result = await pool.query(`
      UPDATE "CustomWorkout"
      SET 
        "isCompleted" = false,
        "executedWorkoutId" = NULL,
        "completedWorkoutId" = NULL,
        "wasSubstitution" = false
      WHERE date::date = '2025-11-27'
        AND type = 'running'
        AND "isCompleted" = true
      RETURNING id, type, date;
    `);

    await pool.end();

    return NextResponse.json({
      status: 'success',
      message: 'Quinta 27 (running) resetada!',
      updated: result.rowCount,
      workouts: result.rows
    });
  } catch (error: any) {
    console.error('[Reset Thursday 27] Error:', error);
    return NextResponse.json({ 
      error: 'Internal error', 
      details: error.message 
    }, { status: 500 });
  }
}
