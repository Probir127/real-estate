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


class SiteContent(models.Model):
    """Admin-managed JSON content for any public application surface.

    Keeping content in one small, versionable model lets the frontend request
    navigation, footer, and page-specific copy without coupling the API to
    React's component structure. Missing or inactive keys intentionally return
    an empty object so clients can use their built-in safe defaults.
    """

    key = models.CharField(max_length=100, unique=True)
    content = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["key"]
        verbose_name = "Site content"
        verbose_name_plural = "Site content"

    def __str__(self):
        return self.key
