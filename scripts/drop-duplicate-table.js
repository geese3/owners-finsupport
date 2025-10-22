#!/usr/bin/env node

/**
 * Script to drop duplicate user_government_support_bookmarks table
 * Run: node scripts/drop-duplicate-table.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function dropDuplicateTable() {
  try {
    console.log('🚀 Connecting to Supabase...');

    // Initialize Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('📊 Checking if table exists...');

    // Try to query the table to check if it exists
    const { count, error: checkError } = await supabase
      .from('user_government_support_bookmarks')
      .select('*', { count: 'exact', head: true });

    if (checkError) {
      if (checkError.message.includes('does not exist')) {
        console.log('✅ Table does not exist (already dropped or never created)');
        return;
      }
      console.log('⚠️ Table check returned error:', checkError.message);
    } else {
      console.log(`📊 Table exists with ${count || 0} records`);
    }

    console.log('🗑️ Attempting to drop table via SQL...');

    // Execute raw SQL to drop the table
    const { data, error } = await supabase.rpc('exec_sql', {
      query: 'DROP TABLE IF EXISTS user_government_support_bookmarks CASCADE'
    }).catch(async (rpcError) => {
      // If RPC function doesn't exist, try alternative approach
      console.log('ℹ️ RPC function not available, trying alternative method...');

      // Alternative: We can't directly drop tables via Supabase client
      // but we can provide instructions
      return {
        data: null,
        error: 'Direct table drop not supported via Supabase client'
      };
    });

    if (error) {
      console.log('\n❌ Cannot drop table programmatically via Supabase client');
      console.log('\n📋 Please use one of these methods:\n');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Run this SQL command:');
      console.log('   DROP TABLE IF EXISTS user_government_support_bookmarks CASCADE;\n');
      console.log('3. Or use the SQL file we created:');
      console.log('   src/lib/db/drop-duplicate-table.sql\n');
    } else {
      console.log('✅ Table successfully dropped!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Manual deletion required:');
    console.log('1. Go to: https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Run: DROP TABLE IF EXISTS user_government_support_bookmarks CASCADE;');
  }
}

// Run the script
console.log('='.repeat(60));
console.log('Drop Duplicate Table Script');
console.log('='.repeat(60));
dropDuplicateTable();