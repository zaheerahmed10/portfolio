import jwt
import datetime

# Aapka JWT Secret
JWT_SECRET = "nSrUT+6jGRyp3MvdVUh7MFLoa0ZeoeFJAKpfk+RfN6jnTp/++TiG0i6gmw6qa1/xsbAXTJa1mNieJkPOjm5acA=="

# Supabase Project Reference
PROJECT_REF = "grokykbxasqfpduwcmlm"

# ============================================
# ANON KEY
# ============================================
anon_payload = {
    "iss": "supabase",
    "ref": PROJECT_REF,
    "role": "anon",
    "iat": int(datetime.datetime.now().timestamp()),
    "exp": int((datetime.datetime.now() + datetime.timedelta(days=3650)).timestamp())
}
anon_key = jwt.encode(anon_payload, JWT_SECRET, algorithm="HS256")
print("=" * 70)
print("ANON KEY:")
print(anon_key)
print("=" * 70)

# ============================================
# SERVICE ROLE KEY
# ============================================
service_payload = {
    "iss": "supabase",
    "ref": PROJECT_REF,
    "role": "service_role",
    "iat": int(datetime.datetime.now().timestamp()),
    "exp": int((datetime.datetime.now() + datetime.timedelta(days=3650)).timestamp())
}
service_key = jwt.encode(service_payload, JWT_SECRET, algorithm="HS256")
print("SERVICE ROLE KEY:")
print(service_key)
print("=" * 70)

# ============================================
# SAVE TO FILE
# ============================================
with open('.env', 'w') as f:
    f.write(f"SUPABASE_URL=https://{PROJECT_REF}.supabase.co\n")
    f.write(f"SUPABASE_KEY={anon_key}\n")
    f.write(f"SUPABASE_SERVICE_ROLE_KEY={service_key}\n")
    f.write(f"JWT_SECRET=zaheer_super_secret_jwt_key_2026\n")
    f.write(f"FLASK_SECRET_KEY=zaheer_flask_secret_key_2026\n")

print("\n✅ .env file created successfully!")
print("📁 File location: .env")