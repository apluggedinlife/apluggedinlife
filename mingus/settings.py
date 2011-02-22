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

LANGUAGE_CODE = 'fr' 

ugettext = lambda s: s
LANGUAGES = (
    ('fr', ugettext('Français')),
    ('en', ugettext('English')),
    ('es', ugettext('Español')),
)

LOCALE_PATHS = (
    join(PROJECT_ROOT, 'locale'),
)

TIME_ZONE = 'Europe/Paris'
SECRET_KEY = '+bq@o(jph^-*sfj4j%xukecxb0jae9lci&ysy=609hj@(l$47c'
USE_I18N = True
HONEYPOT_FIELD_NAME = 'fonzie_kungfu'

TEMPLATE_DIRS = (
    [os.path.join(PROJECT_ROOT, 'templates')]
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'localeurl.middleware.LocaleURLMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.doc.XViewMiddleware',
    'django.contrib.redirects.middleware.RedirectFallbackMiddleware',
    'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware',
    'slimmer.middleware.CompressHtmlMiddleware',
    'sugar.middleware.debugging.UserBasedExceptionMiddleware',
    'request.middleware.RequestMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'basic.blog.context_processors.blog_settings',
    'navbar.context_processors.navbars',
    'staticfiles.context_processors.static_url',
    'django.core.context_processors.request'
)

LOCALE_INDEPENDENT_PATHS = (
    re.compile('^/admin/(.*)'),
    re.compile('^/IE/$'),
    re.compile('^/social/(.*)'),
    re.compile('^/sentry/(.*)'),
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

    'localeurl',
    'django_extensions',
    'tagging',
    'basic.inlines',
    'basic.blog',
    'basic.bookmarks',
    'basic.media',
    'oembed',
    'flatblocks',
    'dbtemplates',
    'navbar',
    'sorl.thumbnail',
    'template_utils',
    'django_proxy',

    'django_markup',
    'google_analytics',
    'robots',
    'basic.elsewhere',
    'compressor',
    'contact_form',
    'honeypot',
    'sugar',
    'quoteme',
    'mingus.core',
    'debug_toolbar',

    'django_twitter',
    'django_bitly',
    'staticfiles',
    'tinymce',
    'django_wysiwyg',
    'cropper',
    'memcache_status',
    'request',

    # apil requirements
    'south',
    'indexer',
    'paging',
    'sentry',
    'sentry.client',
    'django.contrib.markup',
    'disqus',
    'social_bookmarking',
    'basic.profiles',
)


MPTT_COMMENTS_OFFSET = 50
MPTT_COMMENTS_CUTOFF = 10

GRAVATAR_DEFAULT_IMAGE = MEDIA_URL + 'img/avatar_apluggedinlife.png'

TINYMCE_JS_ROOT = STATIC_ROOT + '/mingus/js/tiny_mce/'
TINYMCE_COMPRESSOR = True
TINYMCE_JS_URL = STATIC_URL + 'js/tiny_mce/tiny_mce.js'
TINYMCE_DEFAULT_CONFIG = {
    'theme': 'advanced',
    'cleanup_on_startup': True,
    'custom_undo_redo_levels': 10,
    'theme_advanced_toolbar_location': 'top',
}

DJANGO_WYSIWYG_MEDIA_URL = STATIC_URL + 'js/ckeditor/'
DJANGO_WYSIWYG_FLAVOR = 'ckeditor'

OPML_ROOT = join(MEDIA_ROOT, 'OPML_APIL.xml')
BLOGROLL_CSV_ROOT = join(MEDIA_ROOT, 'blogroll.csv')

try:
   from local_settings import *
except ImportError:
   pass
