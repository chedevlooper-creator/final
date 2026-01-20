const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function signUp() {
    console.log('Attempting to create user: isahamid@gmail.com');

    const { data, error } = await supabase.auth.signUp({
        email: 'isahamid@gmail.com',
        password: 'vadalov95',
        options: {
            data: {
                name: 'İsa Hamid',
                role: 'admin' // Trying to set role, though might be overridden by defaults
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        return;
    }

    console.log('User created successfully:', data.user?.id);
    console.log('Is email confirmed?', data.user?.email_confirmed_at ? 'Yes' : 'No');
}

signUp();
