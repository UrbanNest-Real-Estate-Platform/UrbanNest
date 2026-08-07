from django.urls import path
from .views import PredictPriceView, HealthCheckView, PropertyRecommendationGraphView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('predict/', PredictPriceView.as_view(), name='predict-price'),
    path('recommendations/<str:property_id>/', PropertyRecommendationGraphView.as_view(), name='graph-recommendations'),
]
