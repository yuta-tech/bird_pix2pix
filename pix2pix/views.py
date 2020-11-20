from django.shortcuts import render
from django.views import generic
from django.http import HttpResponse, JsonResponse
from .models import Pix2Pix
from PIL import Image,ImageOps
import numpy as np
import cv2
from io import BytesIO
import base64
# Create your views here.

class IndexView(generic.TemplateView):
    template_name = 'pix2pix/index.html'

def showGen(request):
    data1 = request.POST.get('imgBase64').split(',')[1]  # POSTで渡された値
    # data1 += "=" * ((4 - len(data1) % 4) % 4)
    # print(data1)
    
    image_string = BytesIO(base64.b64decode(data1))
    image = Image.open(image_string)
    background = Image.new("RGB", image.size, (255, 255, 255))
    background.paste(image, mask=image.split()[3])
    image = background.convert("L")
    image = ImageOps.invert(image)
    if image is None:
        print('error')
    else:
        print('image')
        image.save('pix2pix/media/images/pix2pix/image.png')
    
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue())
    img_str = (b'data:image/jpeg;base64,' + img_str).decode('utf-8')

    context = {'return_img':img_str}
    return JsonResponse(context)

def fill(request):
    data1 = request.POST.get('imgBase64').split(',')[1]  # POSTで渡された値
    x, y = int(request.POST.get('x')), int(request.POST.get('y'))

    image_string = BytesIO(base64.b64decode(data1))
    img = Image.open(image_string)
    background = Image.new("RGB", img.size, (255, 255, 255))
    background.paste(img, mask=img.split()[3])
    background = background.convert("L")
    img = np.array(background)

    retval,img,mask,rect = cv2.floodFill(img, None, (x,y), (0,0,0))
    img = Image.fromarray(img)
    img.save('pix2pix/media/images/pix2pix/fill_image.png')

    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue())
    img_str = (b'data:image/jpeg;base64,' + img_str).decode('utf-8')
    
    context = {'fill_img':img_str}
    return JsonResponse(context)