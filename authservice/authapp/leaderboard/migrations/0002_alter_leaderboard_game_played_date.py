# Generated by Django 4.2.13 on 2024-05-08 12:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leaderboard', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='leaderboard',
            name='game_played_date',
            field=models.DateField(auto_now_add=True),
        ),
    ]