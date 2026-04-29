from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.http import JsonResponse
# views.py ke top par isay change karein
from .models import (
    UserHistory, FertilizerRate, FertilizerPrice, 
    FertilizerCalculation, FertilizerInfo
)

# --- 1. USER AUTHENTICATION ---
@api_view(['POST'])
def signup_user(request):
    data = request.data
    try:
        if User.objects.filter(username=data['email']).exists():
            return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('full_name', '')
        )
        return Response({"message": "User Created Successfully"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- 2. RECOMMENDATION SYSTEM (Multilingual) ---
# --- Updated get_recommendation ---
@api_view(['GET'])
def get_recommendation(request):
    crop = request.GET.get('crop', 'Rice')
    deficiency = request.GET.get('deficiency', 'Nitrogen')

    info_obj = FertilizerInfo.objects.filter(
        crop_name__icontains=crop, 
        deficiency__icontains=deficiency
    ).first()

    # Yahan Fertilizer ki jagah FertilizerPrice use karein
    def_map = {'Nitrogen': 'Urea', 'Phosphorus': 'DAP', 'Potassium': 'SOP'}
    fert_name = def_map.get(deficiency, 'Urea')
    
    price_obj = FertilizerPrice.objects.filter(name=fert_name).first()

    if info_obj:
        return Response({
            'status': 'success',
            'deficiency': info_obj.deficiency.upper(),
            'titles': info_obj.titles,
            'symptoms': info_obj.symptoms,
            'fertilizer_1': fert_name,
            'price1': str(price_obj.current_price) if price_obj else "0",
            'amount': "50kg/acre",
            'category': 'STANDARD'
        })
    
    return Response({'status': 'error', 'message': 'No data found'}, status=404)
# --- 3. SCAN HISTORY MANAGEMENT ---
@api_view(['POST'])
def save_scan(request):
    data = request.data
    try:
        user_email = data.get('uid') 
        if not user_email:
            return Response({"error": "UID (email) is required"}, status=status.HTTP_400_BAD_REQUEST)

        user_obj = User.objects.get(username=user_email)
        
        UserHistory.objects.create(
            user=user_obj,
            farmer_name=data.get('farmer_name', user_obj.first_name or "Farmer"),
            crop_name=data.get('crop'),
            deficiency_found=data.get('result'),
            suggested_fertilizer=data.get('fertilizers', "Consult local expert")
        )
        return Response({"status": "Success", "message": "Scan saved successfully"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_history(request, email):
    try:
        history = UserHistory.objects.filter(user__username=email).order_by('-scanned_date')
        data = [{
            "scan_id": item.scan_id,
            "crop": item.crop_name,
            "result": item.deficiency_found,
            "recom": item.suggested_fertilizer,
            "date": item.scanned_date.strftime("%Y-%m-%d %H:%M")
        } for item in history]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- 4. FERTILIZER CALCULATOR ---
@api_view(['GET'])
def get_rates(request):
    crop = request.GET.get('crop')
    area = request.GET.get('area')
    deficiency = request.GET.get('deficiency')
    
    rate = FertilizerRate.objects.filter(
        crop_name=crop, area_type=area, deficiency_type=deficiency
    ).first()

    if rate:
        return JsonResponse({
            'status': 'success',
            'bags_per_acre': rate.bags_per_acre,
            'fertilizer': rate.fertilizer_name
        })
    return JsonResponse({'status': 'error', 'message': 'No data found'}, status=404)

@api_view(['POST'])
def save_calculation(request):
    data = request.data
    try:
        user_email = data.get('uid')
        FertilizerCalculation.objects.create(
            uid=user_email,
            crop=data.get('crop'),
            area=float(data.get('area')),
            area_type=data.get('area_type'),
            result=data.get('result')
        )
        return Response({"status": "Success"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_calculations(request):
    uid = request.GET.get('uid')
    calcs = FertilizerCalculation.objects.filter(uid=uid).order_by('-id')
    data = [{
        "id": c.id, "crop": c.crop, "area": c.area, 
        "result": c.result, "created_at": c.created_at.strftime("%d %b, %Y")
    } for c in calcs]
    return JsonResponse(data, safe=False)

@api_view(['DELETE'])
def delete_calculation(request, pk):
    try:
        item = FertilizerCalculation.objects.get(pk=pk)
        item.delete()
        return Response({"message": "Deleted"}, status=200)
    except FertilizerCalculation.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    
    # model integrate
    

import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import numpy as np
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage

# 1. Model Load (Global context mein taake load time bache)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'ml_models', 'weights.hdf5')

try:
    model = load_model(MODEL_PATH, compile=False) 
    print("Model Successfully Loaded!")
except Exception as e:
    print(f"Error loading model: {e}")

def predict_deficiency(img_path):
    # 2. Image Preprocessing
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) 
    img_array /= 255.0 

    # 3. Model Prediction
    probabilities = model.predict(img_array)
    
    # Model classes ka sahi order (H.A.R.N source code ke mutabiq)
    # Note: Hum wahi strings use kar rahe hain jo Database mein match hon
    labels = ['Phosphorus', 'Healthy', 'Nitrogen', 'Potassium']
    
    result_index = np.argmax(probabilities)
    confidence_score = float(np.max(probabilities) * 100)
    
    return labels[result_index], round(confidence_score, 2)

@csrf_exempt
def predict_api(request):
    if request.method == 'POST' and request.FILES.get('image'):
        img_file = request.FILES['image']
        file_name = default_storage.save('temp_image.jpg', img_file)
        file_path = default_storage.path(file_name)

        try:
            # Prediction aur Confidence hasil karein
            prediction, confidence = predict_deficiency(file_path)
            
            if os.path.exists(file_path):
                os.remove(file_path)

            # --- LOGIC: Professional Confidence Check ---
            if confidence < 85.0:
                return JsonResponse({
                    "status": "low_confidence",
                    "message": "The system is optimized for Rice leaves only. Please upload a clear image of a Rice leaf only.",
                    "confidence": confidence,
                    "prediction": "Unknown"
                })
            
            # Agar confidence 85+ hai, to success bhejien
            return JsonResponse({
                'status': 'success', 
                'prediction': prediction,
                'confidence': confidence
            })

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
            
    return JsonResponse({'status': 'error', 'message': 'Invalid request'})