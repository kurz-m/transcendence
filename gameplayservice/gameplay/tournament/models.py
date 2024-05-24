from django.db import models


# Create your models here.
class Tournaments(models.Model):
    tournament_date = models.DateField(auto_now_add=True, blank=True)
    tournament_name = models.CharField(max_length=200)


class Participants(models.Model):
    tournament = models.ForeignKey(Tournaments, on_delete=models.CASCADE)
    player_name = models.CharField(max_length=200)
    score = models.IntegerField(default=0)
