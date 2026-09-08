from django.db import models


class HomepageContent(models.Model):
    key = models.CharField(max_length=50, unique=True, default='default')
    content = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Homepage content'
        verbose_name_plural = 'Homepage content'

    def __str__(self):
        return self.key
