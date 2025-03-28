from django.urls import path
from . import views

urlpatterns = [
    path('', views.intro_view, name='intro'),
    path('clock/', views.clock_view, name='clock'),
    path('log/', views.log_player_data, name='log_player_data'),
]
