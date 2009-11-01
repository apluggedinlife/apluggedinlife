# -*- coding: utf-8 -*-

import os, os.path, sys
from os.path import join, dirname, normpath
import re

PROJECT_ROOT = os.path.dirname(__file__)
MEDIA_ROOT = join(PROJECT_ROOT, 'media')
MEDIA_URL = '/media/'
STATIC_ROOT = join(MEDIA_ROOT, 'static')
STATIC_URL = '/media/static/'
ADMIN_MEDIA_PREFIX = '/admin_media/'

SITE_ID = 1
ROOT_URLCONF = 'mingus.urls'

LANGAGE_CODE = 'fr-fr'

ugettext = lambda s: s
LANGUAGES = (
  ('fr', ugettext('French')),
  ('en', ugettext('English')),
)
TIME_ZONE = 'Europe/Paris'
SECRET_KEY = '+bq@o(jph^-*sfj4j%xukecxb0jae9lci&ysy=609hj@(l$47c'
USE_I18N = True
HONEYPOT_FIELD_NAME = 'fonzie_kungfu'

TEMPLATE_DIRS = (
  [os.path.join(PROJECT_ROOT, "templates")]
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.doc.XViewMiddleware',
    'django.contrib.redirects.middleware.RedirectFallbackMiddleware',
    'sugar.middleware.debugging.UserBasedExceptionMiddleware',
    'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware',
    'djangodblog.DBLogMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.core.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    'django.core.context_processors.i18n',
    "basic.blog.context_processors.blog_settings",
    "mingus.core.context_processors.site_info",
    "navbar.context_processors.navbars",
    "django.core.context_processors.request"
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'django.contrib.sitemaps',
    'django.contrib.flatpages',
    'django.contrib.redirects',
    'django.contrib.comments',
    'django.contrib.markup',
    'template_utils',
    'mptt',
    'mptt_comments',

    'django_extensions',
    'tagging',
    'djangodblog',
    #'disqus',
    'basic.inlines',
    'basic.blog',
    'basic.profiles',
    'basic.bookmarks',
    'basic.media',
    'oembed',
    'flatblocks',
    'south',
    'navbar',
    'sorl.thumbnail',
    'template_utils',
    'django_proxy',

    'django_markup',
    'google_analytics',
    'robots',
    'basic.elsewhere',
    'compressor',
    'debug_toolbar',
    'gravatar',
    'contact_form',
    'honeypot',
    'sugar',
    'quoteme',
    'mingus',
)

MPTT_COMMENTS_OFFSET = 5
GRAVATAR_DEFAULT_IMAGE = MEDIA_URL + 'img/avatar_apluggedinlife.png'

try:
   from local_settings import *
except ImportError:
   pass


