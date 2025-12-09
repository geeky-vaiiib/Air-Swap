import ee
import os
import json
import datetime

# --- Authentication Setup ---
# Attempt to initialize Earth Engine.
# Note: For server-side usage, a Service Account is recommended.
# API Key (AIza...) usage with the Python client is limited and requires a specific
# transport setup or passing 'opt_url' to initialize if using the high-volume endpoint.
# However, standard ee.Initialize() usually looks for GOOGLE_APPLICATION_CREDENTIALS.

GEE_INITIALIZED = False

def init_gee():
    global GEE_INITIALIZED
    if GEE_INITIALIZED:
        return

    try:
        # Check for service account file
        sa_file = "service-account.json"
        
        if os.path.exists(sa_file):
            print(f"Loading GEE credentials from {sa_file}")
            # Load the JSON to get the email
            with open(sa_file) as f:
                cred_dict = json.load(f)
            
            credentials = ee.ServiceAccountCredentials(
                cred_dict['client_email'], 
                key_file=sa_file
            )
            ee.Initialize(credentials)
            print("✅ GEE Initialized with Service Account from file")
            GEE_INITIALIZED = True
            return

        # Check for service account credentials in env (Legacy/Fallback)
        sa_key = os.getenv("GEE_SERVICE_ACCOUNT_KEY") 
        if sa_key:
            cred_dict = json.loads(sa_key)
            credentials = ee.ServiceAccountCredentials(
                cred_dict['client_email'], 
                key_data=sa_key
            )
            ee.Initialize(credentials)
            print("✅ GEE Initialized with Service Account from ENV")
        else:
            # Fallback to default
            ee.Initialize()
            print("✅ GEE Initialized with Default Credentials")
            
        GEE_INITIALIZED = True
    except Exception as e:
        print(f"⚠️ GEE Initialization Warning: {e}")
        print("NDVI analysis will return mock data until Auth is configured.")

init_gee()

def compute_ndvi_stats(geojson: dict, start_date: str, end_date: str):
    """
    Computes NDVI statistics for the given area and date range.
    """
    if not GEE_INITIALIZED:
        # Return simul-real mock data if GEE fails (robustness)
        return {
            "areaHectares": 12.5,
            "meanNDVI": 0.45,
            "minNDVI": 0.1,
            "maxNDVI": 0.8,
            "collectionSize": 0,
            "status": "Mock Results (GEE Not Auth)"
        }

    try:
        # Parse Dates
        start = ee.Date(start_date)
        end = ee.Date(end_date)

        # Create Geometry
        geom = ee.Geometry(geojson['geometry'])

        # Filter Sentinel-2 Collection
        # 'COPERNICUS/S2_HARMONIZED' is a good robust dataset
        collection = (ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
            .filterBounds(geom)
            .filterDate(start, end)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            .select(['B8', 'B4'])) # NIR, Red

        count = collection.size().getInfo()
        
        if count == 0:
            return {
                "error": "No images found",
                "collectionSize": 0
            }

        # Function to calculate NDVI
        def addNDVI(image):
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            return image.addBands(ndvi)

        # Add NDVI to collection
        with_ndvi = collection.map(addNDVI)

        # Create Composite (Greenest pixel or Median)
        # We use median for stability against outliers/clouds
        composite = with_ndvi.median().clip(geom)
        
        # Calculate Statistics over the region
        stats = composite.reduceRegion(
            reducer=ee.Reducer.mean().combine(
                reducer2=ee.Reducer.min(), sharedInputs=True
            ).combine(
                reducer2=ee.Reducer.max(), sharedInputs=True
            ),
            geometry=geom,
            scale=10, # Sentinel-2 is 10m
            maxPixels=1e9
        )
        
        # Calculate Area
        area = geom.area().divide(10000) # Square meters to Hectares

        # Execute (getInfo pulls data to client)
        result_stats = stats.getInfo()
        area_ha = area.getInfo()

        return {
            "areaHectares": round(area_ha, 2),
            "meanNDVI": round(result_stats.get('NDVI_mean', 0), 3),
            "minNDVI": round(result_stats.get('NDVI_min', 0), 3),
            "maxNDVI": round(result_stats.get('NDVI_max', 0), 3),
            "collectionSize": count,
            "status": "Success"
        }

    except Exception as e:
        print(f"GEE Computation Error: {e}")
        # Identify common errors
        if "Authentication" in str(e) or "credential" in str(e):
             raise Exception("GEE Authentication Failed")
        raise e
