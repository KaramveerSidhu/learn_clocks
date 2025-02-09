from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello, name='hello'),
    path('helloworld/', views.helloworld, name='helloworld'),
]