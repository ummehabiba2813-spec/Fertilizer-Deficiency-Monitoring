import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fertilizerdeficiencymonitoring.settings')
django.setup()

from api.models import FertilizerInfo

# Data Source: PARC & FFC Research Guides
crop_data = [
    # WHEAT
    {"crop": "Wheat", "def": "Nitrogen", "f1": "Urea", "p1": "4500", "f2": "CAN", "p2": "4200", "symp": "Lower leaves turning yellow"},
    {"crop": "Wheat", "def": "Phosphorus", "f1": "DAP", "p1": "12000", "f2": "Nitrophos", "p2": "8500", "symp": "Purple leaves"},
    {"crop": "Wheat", "def": "Potassium", "f1": "SOP", "p1": "15000", "f2": "MOP", "p2": "10500", "symp": "Burnt leaf edges"},
    
    # RICE
    {"crop": "Rice", "def": "Nitrogen", "f1": "Urea", "p1": "4500", "f2": "Ammonium Sulfate", "p2": "4800", "symp": "Pale green plant"},
    {"crop": "Rice", "def": "Phosphorus", "f1": "DAP", "p1": "12000", "f2": "SSP", "p2": "3800", "symp": "Erect blue-green leaves"},
    {"crop": "Rice", "def": "Potassium", "f1": "SOP", "p1": "15000", "f2": "MOP", "p2": "10500", "symp": "Brown spots"},

    # COTTON
    {"crop": "Cotton", "def": "Nitrogen", "f1": "Urea", "p1": "4500", "f2": "Liquid N", "p2": "3200", "symp": "Small yellow leaves"},
    {"crop": "Cotton", "def": "Phosphorus", "f1": "DAP", "p1": "12000", "f2": "MAP", "p2": "11500", "symp": "Stunted growth"},
    {"crop": "Cotton", "def": "Potassium", "f1": "SOP", "p1": "15000", "f2": "MOP", "p2": "10500", "symp": "Leaf curling"},

    # SUGARCANE
    {"crop": "Sugarcane", "def": "Nitrogen", "f1": "Urea", "p1": "4500", "f2": "CAN", "p2": "4200", "symp": "Short stalks, yellow leaves"},
    {"crop": "Sugarcane", "def": "Phosphorus", "f1": "DAP", "p1": "12000", "f2": "Nitrophos", "p2": "8500", "symp": "Poor root development"},
    {"crop": "Sugarcane", "def": "Potassium", "f1": "SOP", "p1": "15000", "f2": "MOP", "p2": "10500", "symp": "Drying leaf tips"},

    # CITRUS
    {"crop": "Citrus", "def": "Nitrogen", "f1": "Urea", "p1": "4500", "f2": "N-Spray", "p2": "2500", "symp": "Yellow leaves, small fruit"},
    {"crop": "Citrus", "def": "Phosphorus", "f1": "DAP", "p1": "12000", "f2": "SSP", "p2": "3800", "symp": "Thick peel, sour fruit"},
    {"crop": "Citrus", "def": "Potassium", "f1": "SOP", "p1": "15000", "f2": "Potash Liquid", "p2": "4000", "symp": "Leaf scorching"},

    # POTATO
    {"crop": "Potato", "def": "Nitrogen", "f1": "Urea", "p1": "4500", "f2": "CAN", "p2": "4200", "symp": "General yellowing"},
    {"crop": "Potato", "def": "Phosphorus", "f1": "DAP", "p1": "12000", "f2": "TSP", "p2": "9000", "symp": "Dark green stunted leaves"},
    {"crop": "Potato", "def": "Potassium", "f1": "SOP", "p1": "15000", "f2": "MOP", "p2": "10500", "symp": "Bronzing of leaves"},

    # MAIZE
    {"crop": "Maize", "def": "Nitrogen", "f1": "Urea", "p1": "4500", "f2": "CAN", "p2": "4200", "symp": "V-shaped yellowing"},
    {"crop": "Maize", "def": "Phosphorus", "f1": "DAP", "p1": "12000", "f2": "Nitrophos", "p2": "8500", "symp": "Purple stems"},
    {"crop": "Maize", "def": "Potassium", "f1": "MOP", "p1": "10500", "f2": "SOP", "p2": "15000", "symp": "Marginal leaf burn"},
    
    # TOMATO
    {"crop": "Tomato", "def": "Nitrogen", "f1": "Urea", "p1": "4500", "f2": "CAN", "p2": "4200", "symp": "Lower leaves falling"},
    {"crop": "Tomato", "def": "Phosphorus", "f1": "DAP", "p1": "12000", "f2": "Nitrophos", "p2": "8500", "symp": "Leaves turning purple-red"},
    {"crop": "Tomato", "def": "Potassium", "f1": "SOP", "p1": "15000", "f2": "MOP", "p2": "10500", "symp": "Yellow spots on fruit"},

    # MUSTARD
    {"crop": "Mustard", "def": "Nitrogen", "f1": "Urea", "p1": "4500", "f2": "CAN", "p2": "4200", "symp": "Small plants"},
    {"crop": "Mustard", "def": "Phosphorus", "f1": "DAP", "p1": "12000", "f2": "SSP", "p2": "3800", "symp": "Dull green leaves"},
    {"crop": "Mustard", "def": "Potassium", "f1": "SOP", "p1": "15000", "f2": "MOP", "p2": "10500", "symp": "Small shriveled seeds"},

    # BAJRA
    {"crop": "Bajra", "def": "Nitrogen", "f1": "Urea", "p1": "4500", "f2": "CAN", "p2": "4200", "symp": "Pale mid-rib"},
    {"crop": "Bajra", "def": "Phosphorus", "f1": "DAP", "p1": "12000", "f2": "SSP", "p2": "3800", "symp": "Red leaf tips"},
    {"crop": "Bajra", "def": "Potassium", "f1": "SOP", "p1": "15000", "f2": "MOP", "p2": "10500", "symp": "Poor grain filling"}
]

for item in crop_data:
    FertilizerInfo.objects.get_or_create(
        crop_name=item['crop'],
        deficiency=item['def'],
        defaults={
            'titles': {"en": f"{item['crop']} {item['def']} Deficiency", "ur": f"{item['crop']} mein {item['def']} ki kami"},
            'symptoms': {"en": item['symp'], "ur": "Alamaat check karein"},
            'recommendations': {
                "en": f"Opt 1: {item['f1']} (Rs.{item['p1']}), Opt 2: {item['f2']} (Rs.{item['p2']})",
                "ur": f"Pehli pasand: {item['f1']} (Rs.{item['p1']}), Doosri: {item['f2']} (Rs.{item['p2']})"
            }
        }
    )

print("Mubarak ho! 30 entries successfully add ho gayi hain.")