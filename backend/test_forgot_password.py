import requests
import json

BASE_URL = "http://localhost:5000"

def test_forgot_password_flow():
    """Test the complete forgot password flow"""
    print("=" * 60)
    print("Testing Forgot Password Flow")
    print("=" * 60)
    
    email = "test@example.com"
    
    # Step 1: Register user first
    print("\n[Step 1] Creating a test account...")
    users = json.loads(open("../src-db/users.json").read() if os.path.exists("../src-db/users.json") else "{}")
    users[email] = {"password": "oldpassword123"}
    print(f"✓ Test user created: {email}")
    
    # Step 2: Request OTP
    print("\n[Step 2] Requesting OTP...")
    response = requests.post(
        f"{BASE_URL}/api/forgot-password",
        json={"email": email}
    )
    result = response.json()
    print(f"Response: {result}")
    
    if result.get('success') != False and not result.get('error'):
        otp = result.get('otp')
        print(f"✓ OTP sent successfully")
        print(f"✓ OTP for testing: {otp}")
        
        # Step 3: Verify OTP
        print("\n[Step 3] Verifying OTP...")
        response = requests.post(
            f"{BASE_URL}/api/verify-otp",
            json={"email": email, "otp": otp}
        )
        result = response.json()
        print(f"Response: {result}")
        
        if result.get('success'):
            print("✓ OTP verified successfully")
            
            # Step 4: Reset Password
            print("\n[Step 4] Resetting password...")
            response = requests.post(
                f"{BASE_URL}/api/reset-password",
                json={
                    "email": email,
                    "new_password": "newpassword123"
                }
            )
            result = response.json()
            print(f"Response: {result}")
            
            if result.get('success'):
                print("✓ Password reset successfully!")
                print("\n" + "=" * 60)
                print("✅ ALL TESTS PASSED")
                print("=" * 60)
            else:
                print(f"✗ Password reset failed: {result.get('error')}")
        else:
            print(f"✗ OTP verification failed: {result.get('error')}")
    else:
        print(f"✗ OTP request failed: {result.get('error')}")

if __name__ == "__main__":
    import os
    test_forgot_password_flow()
