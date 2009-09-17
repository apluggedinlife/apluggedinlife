from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
from django.db.models.signals import post_save

class Profile(models.Model):

    user = models.ForeignKey(User, unique=True, verbose_name=_('user'), related_name=_('profile'))
    twitter_username = models.CharField(_('Twitter username'), max_length=150, null=True, blank=True)
    
    def __unicode__(self):
        """docstring for __unicode__"""
        return str(self.user)
    
    class Meta:
        verbose_name = _('profile')
        verbose_name_plural = _('profiles')

def create_profile(sender, instance=None, **kwargs):
    if instance is None:
        return
    profile, created = Profile.objects.get_or_create(user=instance)

post_save.connect(create_profile, sender=User)