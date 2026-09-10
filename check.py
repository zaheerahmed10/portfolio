import os
from dotenv import load_dotenv

# .env load karo
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

print("=" * 60)
print("📋 CHECKING CREDENTIALS")
print("=" * 60)
print(f"URL: {SUPABASE_URL}")
print(f"KEY (first 50 chars): {SUPABASE_KEY[:50] if SUPABASE_KEY else 'NONE'}")
print(f"SERVICE KEY (first 50 chars): {SUPABASE_SERVICE_ROLE_KEY[:50] if SUPABASE_SERVICE_ROLE_KEY else 'NONE'}")

print("\n" + "=" * 60)
print("🔌 TESTING CONNECTION")
print("=" * 60)

try:
    from supabase import create_client
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print("✅ Client created")
    
    # Simple query
    response = client.table('profile').select('*').limit(1).execute()
    print(f"✅ Query successful! Found {len(response.data)} rows")
except Exception as e:
    print(f"❌ ERROR: {e}")
    print(f"❌ ERROR TYPE: {type(e).__name__}")