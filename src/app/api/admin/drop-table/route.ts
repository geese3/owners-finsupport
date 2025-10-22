import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Admin API route to drop duplicate table
// This should be run once and then deleted or secured

export async function DELETE(request: NextRequest) {
  try {
    // Initialize Supabase admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Security check - only allow in development or with special token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (process.env.NODE_ENV === 'production' && token !== process.env.API_SYNC_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin token required' },
        { status: 401 }
      );
    }

    console.log('🗑️ Dropping duplicate table user_government_support_bookmarks...');

    // First, check if the table exists and get count
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from('user_government_support_bookmarks')
      .select('*', { count: 'exact', head: true });

    const recordCount = checkData || 0;
    console.log(`📊 Table has ${recordCount} records`);

    // Drop the table using RPC or direct SQL
    // Since Supabase doesn't provide direct DROP TABLE via SDK, we'll use RPC
    const { data, error } = await supabaseAdmin.rpc('drop_duplicate_bookmark_table', {});

    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Error dropping table:', error);
      return NextResponse.json(
        {
          error: 'Failed to drop table',
          details: error.message,
          suggestion: 'You may need to manually drop the table in Supabase Dashboard'
        },
        { status: 500 }
      );
    }

    console.log('✅ Table successfully dropped or does not exist');

    return NextResponse.json({
      success: true,
      message: 'Table user_government_support_bookmarks has been dropped',
      recordsDeleted: recordCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to drop table:', error);

    return NextResponse.json(
      {
        error: 'Failed to drop table',
        message: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please use Supabase Dashboard SQL Editor to run: DROP TABLE IF EXISTS user_government_support_bookmarks CASCADE;'
      },
      { status: 500 }
    );
  }
}