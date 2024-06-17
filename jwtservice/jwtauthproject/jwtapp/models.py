from django.db import models
# from django.contrib.auth.models import User

# Create your models here.
class BlacklistedToken(models.Model):
    token = models.CharField(max_length=500)

    def __str__(self):
        return self.token