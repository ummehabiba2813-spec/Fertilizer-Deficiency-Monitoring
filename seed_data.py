import os
import django

# Django settings ko configure karna
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fertilizerdeficiencymonitoring.settings')
django.setup()

from api.models import FertilizerRate, FertilizerPrice

def seed_database():
    print("Starting to add authentic agricultural data...")

    # 1. Fertilizer Prices create ya update karna
    # Yahan humne fields ko model ke mutabiq 'name' aur 'current_price' kar diya hai
    urea, _ = FertilizerPrice.objects.update_or_create(
        name='Urea', 
        defaults={'current_price': 5000}
    )
    dap, _ = FertilizerPrice.objects.update_or_create(
        name='DAP', 
        defaults={'current_price': 12000}
    )
    sop, _ = FertilizerPrice.objects.update_or_create(
        name='SOP', 
        defaults={'current_price': 15000}
    )

    # 2. Data List (Crop, Area, Deficiency, Fertilizer, Bags/Acre)
    data_list = [
        # --- WHEAT ---
        ('Wheat', 'Plain', 'Nitrogen', 'Urea', 2.5), ('Wheat', 'Plain', 'Phosphorus', 'DAP', 1.5), ('Wheat', 'Plain', 'Potassium', 'SOP', 0.5),
        ('Wheat', 'Barani', 'Nitrogen', 'Urea', 1.5), ('Wheat', 'Barani', 'Phosphorus', 'DAP', 1.0), ('Wheat', 'Barani', 'Potassium', 'SOP', 0.2),
        # --- RICE ---
        ('Rice', 'Plain', 'Nitrogen', 'Urea', 2.0), ('Rice', 'Plain', 'Phosphorus', 'DAP', 1.0), ('Rice', 'Plain', 'Potassium', 'SOP', 1.0),
        ('Rice', 'Barani', 'Nitrogen', 'Urea', 1.5), ('Rice', 'Barani', 'Phosphorus', 'DAP', 0.5), ('Rice', 'Barani', 'Potassium', 'SOP', 0.5),
        # --- COTTON ---
        ('Cotton', 'Plain', 'Nitrogen', 'Urea', 3.0), ('Cotton', 'Plain', 'Phosphorus', 'DAP', 1.5), ('Cotton', 'Plain', 'Potassium', 'SOP', 1.0),
        ('Cotton', 'Barani', 'Nitrogen', 'Urea', 2.0), ('Cotton', 'Barani', 'Phosphorus', 'DAP', 1.0), ('Cotton', 'Barani', 'Potassium', 'SOP', 0.5),
        # --- MAIZE ---
        ('Maize', 'Plain', 'Nitrogen', 'Urea', 3.5), ('Maize', 'Plain', 'Phosphorus', 'DAP', 2.0), ('Maize', 'Plain', 'Potassium', 'SOP', 1.0),
        ('Maize', 'Barani', 'Nitrogen', 'Urea', 1.5), ('Maize', 'Barani', 'Phosphorus', 'DAP', 1.0), ('Maize', 'Barani', 'Potassium', 'SOP', 0.5),
        # --- SUGARCANE ---
        ('Sugarcane', 'Plain', 'Nitrogen', 'Urea', 4.5), ('Sugarcane', 'Plain', 'Phosphorus', 'DAP', 2.5), ('Sugarcane', 'Plain', 'Potassium', 'SOP', 2.0),
        ('Sugarcane', 'Barani', 'Nitrogen', 'Urea', 3.5), ('Sugarcane', 'Barani', 'Phosphorus', 'DAP', 1.5), ('Sugarcane', 'Barani', 'Potassium', 'SOP', 1.0),
        # --- POTATO ---
        ('Potato', 'Plain', 'Nitrogen', 'Urea', 3.0), ('Potato', 'Plain', 'Phosphorus', 'DAP', 2.0), ('Potato', 'Plain', 'Potassium', 'SOP', 2.5),
        ('Potato', 'Barani', 'Nitrogen', 'Urea', 2.0), ('Potato', 'Barani', 'Phosphorus', 'DAP', 1.5), ('Potato', 'Barani', 'Potassium', 'SOP', 1.5),
        # --- MUSTARD ---
        ('Mustard', 'Plain', 'Nitrogen', 'Urea', 1.5), ('Mustard', 'Plain', 'Phosphorus', 'DAP', 1.0), ('Mustard', 'Plain', 'Potassium', 'SOP', 0.5),
        ('Mustard', 'Barani', 'Nitrogen', 'Urea', 1.0), ('Mustard', 'Barani', 'Phosphorus', 'DAP', 0.5), ('Mustard', 'Barani', 'Potassium', 'SOP', 0.2),
        # --- BAJRA ---
        ('Bajra', 'Plain', 'Nitrogen', 'Urea', 1.5), ('Bajra', 'Plain', 'Phosphorus', 'DAP', 1.0), ('Bajra', 'Plain', 'Potassium', 'SOP', 0.5),
        ('Bajra', 'Barani', 'Nitrogen', 'Urea', 1.0), ('Bajra', 'Barani', 'Phosphorus', 'DAP', 0.5), ('Bajra', 'Barani', 'Potassium', 'SOP', 0.2),
        # --- TOMATO ---
        ('Tomato', 'Plain', 'Nitrogen', 'Urea', 2.5), ('Tomato', 'Plain', 'Phosphorus', 'DAP', 1.5), ('Tomato', 'Plain', 'Potassium', 'SOP', 1.5),
        ('Tomato', 'Barani', 'Nitrogen', 'Urea', 1.5), ('Tomato', 'Barani', 'Phosphorus', 'DAP', 1.0), ('Tomato', 'Barani', 'Potassium', 'SOP', 0.8),
        # --- CITRUS ---
        ('Citrus', 'Plain', 'Nitrogen', 'Urea', 2.0), ('Citrus', 'Plain', 'Phosphorus', 'DAP', 1.0), ('Citrus', 'Plain', 'Potassium', 'SOP', 1.0),
        ('Citrus', 'Barani', 'Nitrogen', 'Urea', 1.0), ('Citrus', 'Barani', 'Phosphorus', 'DAP', 0.5), ('Citrus', 'Barani', 'Potassium', 'SOP', 0.5),
    ]

    for crop, area, defic, fert_name, bags in data_list:
        obj, created = FertilizerRate.objects.update_or_create(
            crop_name=crop,
            area_type=area,
            deficiency_type=defic,
            defaults={
                'fertilizer_name': fert_name,
                'bags_per_acre': bags
            }
        )
        status = "Created" if created else "Updated"
        print(f"{status}: {crop} ({area}) - {defic}")

    print(f"\nDone! Total {len(data_list)} entries added/updated successfully.")

if __name__ == '__main__':
    seed_database()