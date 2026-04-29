from django.db import models
from django.contrib.auth.models import User
import uuid

# 1. PRICING MODEL (Dynamic Prices ke liye)
class FertilizerPrice(models.Model):
    name = models.CharField(max_length=50, unique=True, help_text="e.g., Urea, DAP, SOP")
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - Rs. {self.current_price}"

# 2. CORE INFORMATION MODEL (Symptoms aur Multilingual data)
class FertilizerInfo(models.Model):
    crop_name = models.CharField(max_length=50) 
    deficiency = models.CharField(max_length=50) 
    
    titles = models.JSONField() 
    symptoms = models.JSONField()
    recommendations = models.JSONField() 

    def __str__(self):
        return f"{self.crop_name} - {self.deficiency}"

# 3. USER HISTORY (Original Name Restored)
class UserHistory(models.Model):
    scan_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="old_scans")
    farmer_name = models.CharField(max_length=100)
    crop_name = models.CharField(max_length=50)
    deficiency_found = models.CharField(max_length=100)
    suggested_fertilizer = models.TextField() 
    scanned_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.farmer_name} - {self.deficiency_found}"

# 4. SCAN HISTORY (Original Name Restored)
class ScanHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ai_scans")
    farmer_name = models.CharField(max_length=100)
    crop_name = models.CharField(max_length=100)
    deficiency_found = models.CharField(max_length=100)
    suggested_fertilizer = models.TextField()
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.farmer_name} - {self.deficiency_found}"

# 5. CALCULATOR RATES
class FertilizerRate(models.Model):
    CROP_CHOICES = [
        ('Wheat', 'Wheat'), ('Cotton', 'Cotton'), ('Rice', 'Rice'),
        ('Maize', 'Maize'), ('Sugarcane', 'Sugarcane'), ('Potato', 'Potato'),
    ]
    AREA_CHOICES = [('Barani', 'Rainfed'), ('Plain', 'Irrigated')]
    DEF_CHOICES = [('Nitrogen', 'Nitrogen'), ('Phosphorus', 'Phosphorus'), ('Potassium', 'Potassium')]

    crop_name = models.CharField(max_length=50, choices=CROP_CHOICES)
    area_type = models.CharField(max_length=20, choices=AREA_CHOICES)
    deficiency_type = models.CharField(max_length=20, choices=DEF_CHOICES)
    fertilizer_name = models.CharField(max_length=50)
    bags_per_acre = models.FloatField()

    def __str__(self):
        return f"{self.crop_name} - {self.deficiency_type}"

# 6. CALCULATIONS
class FertilizerCalculation(models.Model):
    uid = models.EmailField()
    crop = models.CharField(max_length=100)
    area = models.FloatField()
    area_type = models.CharField(max_length=50)
    result = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.uid} - {self.crop}"

class CalculationHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_calculations")
    crop_name = models.CharField(max_length=100)
    area_acres = models.FloatField()
    fertilizer_name = models.CharField(max_length=100)
    quantity_needed = models.CharField(max_length=100)
    result_summary = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.crop_name}"