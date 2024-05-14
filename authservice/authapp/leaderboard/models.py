from django.db import models


# Create your models here.
class Leaderboard(models.Model):
    game_name = models.CharField(max_length=200)
    score = models.IntegerField(default=0)
    game_played_date = models.DateField(auto_now_add=True, blank=True)
