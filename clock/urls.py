from django.urls import path
from . import views

urlpatterns = [
    path('', views.clock_view, name='clock'),
]
