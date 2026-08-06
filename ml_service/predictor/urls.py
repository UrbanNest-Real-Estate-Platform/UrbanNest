from django.urls import path
from .views import PredictPriceView, HealthCheckView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('predict/', PredictPriceView.as_view(), name='predict-price'),
]
