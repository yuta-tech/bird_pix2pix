from django.db import models
import torch
from PIL import Image, ImageDraw


# Create your models here.
class Pix2Pix(models.Model):
    seg_image = models.ImageField(upload_to='images', null=True, blank=True)
    gen_image = models.ImageField(upload_to='images', null=True, blank=True)
    
    
