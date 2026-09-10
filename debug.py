import os
from dotenv import load_dotenv

print("=" * 60)
print("🔍 DEBUG: Environment Variables Check")
print("=" * 60)

# Current directory
print(f"\n📁 Current Directory: {os.getcwd()}")

# Check .env file
env_path = os.path.join(os.getcwd(), '.env')
print(f"📄 .env Path: {env_path}")
print(f"✅ .env Exists: {os.path.exists(env_path)}")

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        content = f.read()
        print(f"\n📝 .env Content Preview (first 200 chars):")
        print("-" * 40)
        print(content[:200])
        print("-" * 40)

# Load .env
load_dotenv()

print("\n" + "=" * 60)
print("📋 Environment Variables:")
print("=" * 60)

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
secret = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
jwt_secret = os.getenv('JWT_SECRET')
flask_secret = os.getenv('FLASK_SECRET_KEY')

print(f"SUPABASE_URL: {url if url else '❌ NOT FOUND'}")
print(f"SUPABASE_KEY: {key[:35] + '...' if key else '❌ NOT FOUND'}")
print(f"SUPABASE_SERVICE_ROLE_KEY: {secret[:35] + '...' if secret else '❌ NOT FOUND'}")
print(f"JWT_SECRET: {jwt_secret if jwt_secret else '❌ NOT FOUND'}")
print(f"FLASK_SECRET_KEY: {flask_secret if flask_secret else '❌ NOT FOUND'}")

# Test Supabase connection
print("\n" + "=" * 60)
print("🔌 Testing Supabase Connection:")
print("=" * 60)

if url and secret:
    try:
        from supabase import create_client
        print("📦 supabase package: ✅ installed")
        
        client = create_client(url, secret)
        print("✅ Supabase client created!")
        
        # Test query
        response = client.table('profile').select('*').limit(1).execute()
        print(f"✅ Database query successful!")
        print(f"📊 Found {len(response.data)} rows in profile table")
        
    except ImportError as e:
        print(f"❌ supabase package NOT installed: {e}")
        print("   Run: pip install supabase")
    except Exception as e:
        print(f"❌ Supabase error: {e}")
        print(f"   Error type: {type(e).__name__}")
else:
    print("❌ Cannot test - missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")