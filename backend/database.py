from pymongo import MongoClient
from pymongo.errors import PyMongoError
from fastapi import HTTPException, status
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
db = client["ascon_studio"]

def get_db():
    try:
        # Quick ping check to verify MongoDB is running
        client.admin.command('ping')
        yield db
    except PyMongoError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed. Please ensure MongoDB service is running (e.g. `sudo systemctl start mongod` or `mongod`)."
        )

    