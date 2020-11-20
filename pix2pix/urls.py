from django.urls import path
from . import views

from django.conf.urls.static import static
from django.conf import settings
app_name = 'pix2pix'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('showGen/', views.showGen, name='showGen'),
    path('fill/', views.fill, name='fill'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)