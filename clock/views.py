from django.shortcuts import render
from django.http import JsonResponse
from .models import PlayerLog

def clock_view(request):
    return render(request, 'clock.html')

def intro_view(request):
    return render(request, 'intro.html')

def log_player_data(request):
    if request.method == 'POST':
        player_name = request.POST.get('player_name')
        correct_answer = request.POST.get('correct_answer')
        player_answer = request.POST.get('player_answer')
        is_correct = request.POST.get('is_correct') == 'true'

        # Save the data to the database
        PlayerLog.objects.create(
            player_name=player_name,
            correct_answer=correct_answer,
            player_answer=player_answer,
            is_correct=is_correct
        )

        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400)