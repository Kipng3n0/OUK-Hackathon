from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from email_service import send_mentor_notification, send_user_confirmation, send_password_reset_email
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionRequest(BaseModel):
    user_name: str
    user_email: str
    mentor_name: str
    mentor_email: str
    message: str

class PasswordResetRequest(BaseModel):
    email: str
    name: str
    temp_password: str

@app.post("/send-connection-notification")
async def send_connection_notification(request: ConnectionRequest):
    """
    Send email notifications for mentor connection requests
    """
    try:
        # Send notification to mentor
        mentor_result = send_mentor_notification(
            request.mentor_email,
            request.user_name,
            request.user_email,
            request.message
        )
        
        # Send confirmation to user
        user_result = send_user_confirmation(
            request.user_email,
            request.user_name,
            request.mentor_name
        )
        
        return {
            "success": True,
            "mentor_notification": mentor_result,
            "user_confirmation": user_result,
            "connection_data": {
                "user_name": request.user_name,
                "user_email": request.user_email,
                "mentor_name": request.mentor_name,
                "mentor_email": request.mentor_email,
                "status": "pending"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send-password-reset")
async def send_password_reset(request: PasswordResetRequest):
    """
    Send password reset email with temporary password
    """
    try:
        result = send_password_reset_email(
            request.email,
            request.name,
            request.temp_password
        )
        
        return {
            "success": True,
            "email_result": result,
            "message": "Password reset email sent successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-mentors")
async def get_mentors():
    """
    Return list of available mentors
    """
    mentors = [
        {
            "mentor_name": "Anna Mentor",
            "expertise": ["Python", "TensorFlow", "Machine Learning"],
            "score": 0.9,
            "overlap": 3,
            "rating": 4.8,
            "availability": 85,
            "email": "codeivan593@gmail.com"
        },
        {
            "mentor_name": "Bob Guide",
            "expertise": ["SQL", "Data Engineering", "Python"],
            "score": 0.85,
            "overlap": 2,
            "rating": 4.6,
            "availability": 70,
            "email": "ipavlo953@gmail.com"
        },
        {
            "mentor_name": "Carol Expert",
            "expertise": ["JavaScript", "React", "Web Development"],
            "score": 0.75,
            "overlap": 1,
            "rating": 4.9,
            "availability": 90,
            "email": "remotasks.karan01@gmail.com"
        },
        {
            "mentor_name": "David Coach",
            "expertise": ["Cloud Architecture", "AWS", "DevOps"],
            "score": 0.65,
            "overlap": 1,
            "rating": 4.7,
            "availability": 60,
            "email": "denniskipngeno60@gmail.com"
        }
    ]
    return mentors

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
