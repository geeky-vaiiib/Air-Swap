import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import analysis

# Load environment variables
load_dotenv()

app = FastAPI(title="OxygenCredits NDVI Engine", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class PolygonCoordinates(BaseModel):
    coordinates: List[List[List[float]]]
    type: str = "Polygon"

class AnalysisRequest(BaseModel):
    polygon: PolygonCoordinates
    startDate: str = "2023-01-01"
    endDate: str = "2023-12-31"

@app.get("/")
def health_check():
    return {"status": "ok", "service": "NDVI Engine"}

@app.post("/analyze")
async def analyze_ndvi(request: AnalysisRequest):
    try:
        # Convert Pydantic model to GeoJSON dict
        geojson = {
            "type": "Feature",
            "geometry": request.polygon.dict(),
            "properties": {}
        }
        
        result = analysis.compute_ndvi_stats(
            geojson, 
            request.startDate, 
            request.endDate
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
