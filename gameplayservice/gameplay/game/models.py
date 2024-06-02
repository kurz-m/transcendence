from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Game(models.Model):
    GAME_TYPE_CHOICES = [
        ('tournament', 'Tournament'),
        ('single', 'Single Play'),
    ]
    game_date = models.DateField(auto_now_add=True, blank=True)
    game_type = models.CharField(max_length=15, choices=GAME_TYPE_CHOICES)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owner')
    class Meta:
        ordering = ['-game_date']
    
    # def save(self, *args, **kwargs):
    #     if self.user_id is None:
    #         if hasattr(self, 'request') and hasattr(self.request, 'user'):
    #             self.user = self.request.user
    #     super().save(*args, **kwargs)


class Score(models.Model):
    game_id = models.ForeignKey(Game, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    opponent = models.CharField(max_length=200)
    own_score = models.IntegerField(default=0)
    win = models.BooleanField(default=False)
    opponent_score = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)
    rank = models.IntegerField(default=0)
    number_of_players = models.IntegerField(default=2)



    def game_type(self):
        return self.game_id.game_type

    def save(self, *args, **kwargs):
        if self.user_id is None:
            if hasattr(self, 'request') and hasattr(self.request, 'user'):
                self.user = self.request.user
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_date']