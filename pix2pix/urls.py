from django.urls import path

from . import views

app_name = 'pix2pix'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
]