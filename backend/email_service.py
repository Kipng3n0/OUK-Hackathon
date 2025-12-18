import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def send_mentor_notification(mentor_email, user_name, user_email, message):
    """
    Send email notification to mentor when a user requests connection
    """
    try:
        # Email configuration - Using Gmail SMTP
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        
        # You'll need to set these environment variables or use app-specific password
        sender_email = os.getenv("SMTP_EMAIL", "noreply@skillforge.ai")
        sender_password = os.getenv("SMTP_PASSWORD", "")
        
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"New Mentorship Connection Request from {user_name}"
        msg["From"] = sender_email
        msg["To"] = mentor_email
        
        # Create HTML email body
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
              <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #ff8c00; margin-bottom: 20px;">🎯 New Mentorship Request</h2>
                
                <p style="font-size: 16px; margin-bottom: 15px;">
                  Hello! You have received a new mentorship connection request on <strong>SkillForge AI</strong>.
                </p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #ff8c00; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Student Name:</strong> {user_name}</p>
                  <p style="margin: 5px 0;"><strong>Student Email:</strong> {user_email}</p>
                  <p style="margin: 5px 0;"><strong>Message:</strong> {message}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</p>
                </div>
                
                <p style="font-size: 14px; margin-top: 20px;">
                  You can reach out to the student directly at <a href="mailto:{user_email}" style="color: #ff8c00;">{user_email}</a> to discuss mentorship opportunities.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #666; text-align: center;">
                  This is an automated notification from SkillForge AI<br>
                  Smart Career Path Navigator
                </p>
              </div>
            </div>
          </body>
        </html>
        """
        
        # Attach HTML content
        part = MIMEText(html, "html")
        msg.attach(part)
        
        # Send email only if SMTP credentials are configured
        if sender_password:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
            return {"success": True, "message": "Email sent successfully"}
        else:
            # Log the notification instead of sending if no credentials
            print(f"\n{'='*60}")
            print("MENTOR CONNECTION NOTIFICATION")
            print(f"{'='*60}")
            print(f"To: {mentor_email}")
            print(f"From: {user_name} ({user_email})")
            print(f"Message: {message}")
            print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"{'='*60}\n")
            return {"success": True, "message": "Notification logged (SMTP not configured)"}
            
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return {"success": False, "message": str(e)}

def send_user_confirmation(user_email, user_name, mentor_name):
    """
    Send confirmation email to user after requesting connection
    """
    try:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        
        sender_email = os.getenv("SMTP_EMAIL", "noreply@skillforge.ai")
        sender_password = os.getenv("SMTP_PASSWORD", "")
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Connection Request Sent to {mentor_name}"
        msg["From"] = sender_email
        msg["To"] = user_email
        
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
              <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #ff8c00; margin-bottom: 20px;">✓ Connection Request Sent!</h2>
                
                <p style="font-size: 16px; margin-bottom: 15px;">
                  Hi {user_name},
                </p>
                
                <p style="font-size: 16px; margin-bottom: 15px;">
                  Your mentorship connection request has been successfully sent to <strong>{mentor_name}</strong>.
                </p>
                
                <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px;">
                    💡 <strong>What's next?</strong><br>
                    Your mentor will review your request and may reach out to you directly via email.
                  </p>
                </div>
                
                <p style="font-size: 14px; margin-top: 20px;">
                  Continue exploring your learning path on SkillForge Navigator!
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #666; text-align: center;">
                  SkillForge Navigator - Your Smart Career Path Platform
                </p>
              </div>
            </div>
          </body>
        </html>
        """
        
        part = MIMEText(html, "html")
        msg.attach(part)
        
        if sender_password:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
            return {"success": True, "message": "Confirmation email sent"}
        else:
            print(f"Confirmation logged for {user_name}")
            return {"success": True, "message": "Confirmation logged"}
            
    except Exception as e:
        print(f"Error sending confirmation: {str(e)}")
        return {"success": False, "message": str(e)}

def send_password_reset_email(user_email, user_name, temp_password):
    """
    Send password reset email with temporary password
    """
    try:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        
        sender_email = os.getenv("SMTP_EMAIL", "noreply@skillforge.ai")
        sender_password = os.getenv("SMTP_PASSWORD", "")
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Password Reset - SkillForge Navigator"
        msg["From"] = sender_email
        msg["To"] = user_email
        
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
              <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #ff8c00; margin-bottom: 20px;">🔐 Password Reset Request</h2>
                
                <p style="font-size: 16px; margin-bottom: 15px;">
                  Hi {user_name},
                </p>
                
                <p style="font-size: 16px; margin-bottom: 15px;">
                  We received a request to reset your password for your SkillForge Navigator account.
                </p>
                
                <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ff8c00; margin: 20px 0;">
                  <p style="margin: 5px 0; font-size: 14px;"><strong>Your Temporary Password:</strong></p>
                  <p style="margin: 10px 0; font-size: 20px; font-weight: bold; color: #ff8c00; letter-spacing: 2px;">{temp_password}</p>
                </div>
                
                <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px;">
                    ⚠️ <strong>Important:</strong><br>
                    • Use this temporary password to log in<br>
                    • Change your password immediately after logging in<br>
                    • This password will work only once
                  </p>
                </div>
                
                <p style="font-size: 14px; margin-top: 20px;">
                  If you didn't request this password reset, please contact support immediately.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #666; text-align: center;">
                  SkillForge AI - Smart Career Path Navigator<br>
                  This is an automated email. Please do not reply.
                </p>
              </div>
            </div>
          </body>
        </html>
        """
        
        part = MIMEText(html, "html")
        msg.attach(part)
        
        if sender_password:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
            return {"success": True, "message": "Password reset email sent"}
        else:
            print(f"\n{'='*60}")
            print("PASSWORD RESET NOTIFICATION")
            print(f"{'='*60}")
            print(f"To: {user_email}")
            print(f"User: {user_name}")
            print(f"Temporary Password: {temp_password}")
            print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"{'='*60}\n")
            return {"success": True, "message": "Password reset logged"}
            
    except Exception as e:
        print(f"Error sending password reset email: {str(e)}")
        return {"success": False, "message": str(e)}
