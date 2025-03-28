from django.db import models

class PlayerLog(models.Model):
    player_name = models.CharField(max_length=100)
    correct_answer = models.CharField(max_length=10)
    player_answer = models.CharField(max_length=10)
    is_correct = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player_name} - {'Correct' if self.is_correct else 'Incorrect'}"
