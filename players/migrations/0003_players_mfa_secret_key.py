# Generated by Django 4.2.13 on 2024-05-12 14:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0002_players_online_status_players_two_factor'),
    ]

    operations = [
        migrations.AddField(
            model_name='players',
            name='mfa_secret_key',
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
