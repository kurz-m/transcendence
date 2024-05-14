from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Players(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_img_uri = models.CharField(max_length=200)
    forty_two_student = models.BooleanField(default=False)
    two_factor = models.BooleanField(default=False)
    online_status = models.BooleanField(default=False)
    mfa_secret_key = models.CharField(max_length=50, blank=True)

