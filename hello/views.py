from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader


def hello(request):
    return HttpResponse("Hello world!")

def helloworld(request):
    template = loader.get_template('hellotemp.html')
    return HttpResponse(template.render())