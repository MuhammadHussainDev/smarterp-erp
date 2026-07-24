from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0002_lead_last_name_blank'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='industry',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
