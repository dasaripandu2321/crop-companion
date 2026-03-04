import os
import random
import string
from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask_mail import Mail, Message

load_dotenv()

# In-memory OTP storage (in production, use Redis or database)
OTP_STORAGE = {}

# Flask-Mail instance (will be initialized in app.py)
mail = None

def init_mail(app):
    """Initialize Flask-Mail with Flask app"""
    global mail
    mail = Mail(app)

def generate_otp(length=6):
    """Generate a random 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(email: str) -> dict:
    """
    Generate OTP and send it via email using Gmail SMTP
    Falls back to returning OTP in response if Gmail is not configured
    """
    try:
        # Email validation
        if not email or '@' not in email:
            return {'success': False, 'error': 'Invalid email address'}
        
        otp = generate_otp()
        
        # Store OTP with 10-minute expiration
        OTP_STORAGE[email] = {
            'otp': otp,
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(minutes=10),
            'attempts': 0
        }
        
        # Check if Gmail is configured
        gmail_username = os.environ.get('MAIL_USERNAME', '').strip()
        gmail_password = os.environ.get('MAIL_PASSWORD', '').strip()
        
        # Send email via Gmail SMTP if credentials are available
        if gmail_username and gmail_password and mail is not None:
            try:
                msg = Message(
                    subject='Farm Futura AI - Password Reset OTP',
                    recipients=[email],
                    html=f"""
                    <html>
                        <body style="font-family: Arial, sans-serif;">
                            <h2>Farm Futura AI - Password Reset</h2>
                            <p>Your One-Time Password (OTP) for password reset is:</p>
                            <h1 style="color: #2ecc71; letter-spacing: 5px;">{otp}</h1>
                            <p><strong>This OTP will expire in 10 minutes.</strong></p>
                            <p>If you didn't request a password reset, please ignore this email.</p>
                            <hr>
                            <p><small>Farm Futura AI - Smart Agricultural Advisory System</small></p>
                        </body>
                    </html>
                    """
                )
                mail.send(msg)
                print(f"[EMAIL] OTP sent to {email}: {otp}")
                
                return {
                    'success': True,
                    'message': f'OTP sent to {email}',
                    'expires_in': '10 minutes'
                }
            except Exception as email_error:
                print(f"[EMAIL ERROR] Failed to send email: {email_error}")
                # Fall back to console/response
                print(f"[FALLBACK] OTP for {email}: {otp}")
                return {
                    'success': True,
                    'message': f'OTP generated (Gmail not configured)',
                    'otp': otp,  # Temporary for testing
                    'expires_in': '10 minutes'
                }
        else:
            # Gmail not configured, return OTP in response for testing
            print(f"[FALLBACK] Gmail not configured. OTP for {email}: {otp}")
            print(f"[INFO] To enable email sending, configure MAIL_USERNAME and MAIL_PASSWORD in .env")
            
            return {
                'success': True,
                'message': f'OTP generated (configure Gmail in .env to send via email)',
                'otp': otp,  # Temporary for testing - remove when Gmail is configured
                'expires_in': '10 minutes',
                'warning': 'Gmail not configured. Please add MAIL_USERNAME and MAIL_PASSWORD to .env'
            }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def verify_otp(email: str, otp: str) -> dict:
    """Verify if the provided OTP is correct"""
    try:
        if email not in OTP_STORAGE:
            return {'success': False, 'error': 'No OTP request found for this email'}
        
        otp_data = OTP_STORAGE[email]
        
        # Check if OTP has expired
        if datetime.now() > otp_data['expires_at']:
            del OTP_STORAGE[email]
            return {'success': False, 'error': 'OTP has expired'}
        
        # Check attempt limit
        if otp_data['attempts'] >= 3:
            del OTP_STORAGE[email]
            return {'success': False, 'error': 'Too many failed attempts'}
        
        # Verify OTP
        if otp_data['otp'] == otp:
            # OTP is correct, mark as verified
            OTP_STORAGE[email]['verified'] = True
            return {'success': True, 'message': 'OTP verified successfully'}
        else:
            otp_data['attempts'] += 1
            return {'success': False, 'error': f'Invalid OTP ({3 - otp_data["attempts"]} attempts remaining)'}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}

def is_otp_verified(email: str) -> bool:
    """Check if OTP has been verified for this email"""
    return email in OTP_STORAGE and OTP_STORAGE[email].get('verified', False)

def clear_otp(email: str):
    """Clear OTP after successful password reset"""
    if email in OTP_STORAGE:
        del OTP_STORAGE[email]
