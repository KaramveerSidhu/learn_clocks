from django.shortcuts import render

def clock_view(request):
    return render(request, 'clock.html')
