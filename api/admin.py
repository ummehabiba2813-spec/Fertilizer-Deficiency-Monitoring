from django.contrib import admin
from .models import UserHistory, FertilizerInfo, FertilizerRate # FertilizerInfo ko add here
from django.contrib import admin
from .models import ScanHistory, CalculationHistory
admin.site.register(UserHistory)
admin.site.register(FertilizerInfo)
admin.site.register(FertilizerRate)


from django.contrib import admin
from .models import ScanHistory, CalculationHistory

@admin.register(ScanHistory)
class ScanHistoryAdmin(admin.ModelAdmin):
    # Ye columns table ki shakal mein nazar ayenge
    list_display = ('user', 'farmer_name', 'crop_name', 'deficiency_found', 'created_at')
    list_filter = ('crop_name', 'deficiency_found')
    search_fields = ('farmer_name', 'user__username')

@admin.register(CalculationHistory)
class CalculationHistoryAdmin(admin.ModelAdmin):
    # User ke name ke sath puri details
    list_display = ('user', 'crop_name', 'area_acres', 'fertilizer_name', 'quantity_needed', 'created_at')
    list_filter = ('crop_name', 'fertilizer_name')
    search_fields = ('user__username', 'crop_name')