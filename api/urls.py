from django.urls import path
from . import views

urlpatterns = [
    # User Authentication
    path('signup/', views.signup_user, name='signup'),

    # Scan & History
    path('save-scan/', views.save_scan, name='save_scan'),
    path('get-history/<str:email>/', views.get_history, name='get_history'),

    # Fertilizer Recommendations (YE PATH ZAROORI HAI)
    path('get-recommendation/', views.get_recommendation, name='get_recommendation'),

    # Fertilizer Calculator
    path('get-rates/', views.get_rates, name='get_rates'),
    path('save-calculation/', views.save_calculation, name='save_calculation'),
    path('get-calculations/', views.get_calculations, name='get_calculations'),
    # model
    path('predict/', views.predict_api, name='predict_api'),
]