from pymongo import MongoClient
import os

# Use an environment variable for connection, defaulting to localhost
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI)
db = client["ascon_studio"]

# Dependency handler for FastAPI routes
def get_db():
    try:
        yield db
    finally:
        pass
