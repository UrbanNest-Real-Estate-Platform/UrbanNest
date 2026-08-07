from django.urls import path
from .views import (
    PredictPriceView,
    HealthCheckView,
    ValidateCSVView,
    BuilderAnalyticsView,
    WhatIfCurveView,
    GeneratePDFReportView
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('predict/', PredictPriceView.as_view(), name='predict-price'),
    path('validate-csv/', ValidateCSVView.as_view(), name='validate-csv'),
    path('builder-analytics/', BuilderAnalyticsView.as_view(), name='builder-analytics'),
    path('what-if-curve/', WhatIfCurveView.as_view(), name='what-if-curve'),
    path('generate-pdf-report/', GeneratePDFReportView.as_view(), name='generate-pdf-report'),
]
