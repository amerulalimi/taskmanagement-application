from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserAuthSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class TaskCreateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    status: Optional[str] = "pending"

class TaskUpdateSchema(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    status: Optional[str] = None