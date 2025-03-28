from django.contrib import admin
from .models import PlayerLog

@admin.register(PlayerLog)
class PlayerLogAdmin(admin.ModelAdmin):
    list_display = ('player_name', 'correct_answer', 'player_answer', 'is_correct', 'timestamp')
    list_filter = ('is_correct', 'timestamp')
    search_fields = ('player_name',)
