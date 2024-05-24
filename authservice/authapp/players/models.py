from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Players(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_img_uri = models.CharField(max_length=200)
    two_factor = models.BooleanField(default=False)
    online_status = models.BooleanField(default=False)
    mfa_secret_key = models.CharField(max_length=50, blank=True)

    friends = models.ManyToManyField('self', blank=True)

    def __str__(self):
        return self.user.username

    def add_friend(self, player):
        self.friends.add(player)
        player.friends.add(self)

    def remove_friend(self, player):
        self.friends.remove(player)
        player.friends.remove(self)


class FriendRequest(models.Model):
    sender = models.ForeignKey(Players, related_name='sent_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(Players, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=(('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')), default='pending')
    created_at = models.DateField(auto_now_add=True, blank=True)

    def __str__(self):
        return f"{self.sender} -> {self.receiver} ({self.status})"