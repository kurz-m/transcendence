# Generated by Django 4.2.13 on 2024-05-10 07:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='players',
            name='online_status',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='players',
            name='two_factor',
            field=models.BooleanField(default=False),
        ),
    ]