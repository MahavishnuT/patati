import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function response(status: number, body: Record<string, boolean | string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getDefaultKey(environmentVariable: string): string | null {
  const rawKeys = Deno.env.get(environmentVariable);
  if (!rawKeys) return null;

  try {
    const keys = JSON.parse(rawKeys) as Record<string, string>;
    return keys.default ?? null;
  } catch (error) {
    console.error(`Invalid ${environmentVariable} configuration:`, error);
    return null;
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return response(405, { error: 'method_not_allowed' });

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return response(401, { error: 'authentication_required' });

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const publishableKey = getDefaultKey('SUPABASE_PUBLISHABLE_KEYS');
  const secretKey = getDefaultKey('SUPABASE_SECRET_KEYS');
  if (!projectUrl || !publishableKey || !secretKey) {
    console.error('Account deletion requires the Supabase URL and default publishable/secret API keys.');
    return response(500, { error: 'server_configuration_error' });
  }

  const userClient = createClient(projectUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error: userError } = await userClient.auth.getUser();
  if (userError || !data.user) {
    if (userError) console.error('Account deletion could not verify the user:', userError.message);
    return response(401, { error: 'invalid_session' });
  }

  const adminClient = createClient(projectUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  while (true) {
    const { data: avatarObjects, error: listError } = await adminClient.storage
      .from('avatars')
      .list(data.user.id, { limit: 1000 });
    if (listError) {
      console.error('Account deletion could not list profile photos:', listError.message);
      return response(500, { error: 'account_deletion_failed' });
    }
    if (avatarObjects.length === 0) break;

    const paths = avatarObjects.map((object) => `${data.user.id}/${object.name}`);
    const { error: removalError } = await adminClient.storage.from('avatars').remove(paths);
    if (removalError) {
      console.error('Account deletion could not remove profile photos:', removalError.message);
      return response(500, { error: 'account_deletion_failed' });
    }
  }

  const { error: deletionError } = await adminClient.auth.admin.deleteUser(data.user.id, false);
  if (deletionError) {
    console.error('Account deletion failed:', deletionError.message);
    return response(500, { error: 'account_deletion_failed' });
  }

  return response(200, { ok: true });
});
