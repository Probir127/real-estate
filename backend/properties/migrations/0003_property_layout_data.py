from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0002_propertyimage_external_url_alter_propertyimage_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='layout_data',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Optional 3D layout configuration with room names and dimensions.',
            ),
        ),
    ]
