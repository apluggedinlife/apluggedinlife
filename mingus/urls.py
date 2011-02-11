from django.conf.urls.defaults import *
from django.contrib import admin
from django.views.generic.simple import direct_to_template
from django.conf import settings
from basic.blog import views as blog_views
from basic.blog.feeds import BlogPostsFeed, BlogPostsByCategory
from basic.blog.sitemap import BlogSitemap
from mingus.core.views import springsteen_results, springsteen_firehose, \
                            home_list, springsteen_category, contact_form, \
                            proxy_search, blogroll
from robots.views import rules_list
from mingus.core.feeds import AllEntries, ByTag

from django.views.static import serve
from mingus.utils import serve_download

admin.autodiscover()

feeds = {
    'latest': BlogPostsFeed,
    'all': AllEntries,
    'categories': BlogPostsByCategory,
    'tags': ByTag,
}
#ex: /feeds/latest/
#ex: /feeds/all/
#ex: /feeds/categories/django/

sitemaps = {
    'posts': BlogSitemap,
}

# override the default handler500 so we pass MEDIA_URL (nod to oebfare)
handler500 = "mingus.core.views.server_error"

urlpatterns = patterns('',
    url(r'^admin/password_reset/$', 'django.contrib.auth.views.password_reset', name='password_reset'),
    (r'^password_reset/done/$', 'django.contrib.auth.views.password_reset_done'),
    (r'^reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$', 'django.contrib.auth.views.password_reset_confirm'),
    (r'^reset/done/$', 'django.contrib.auth.views.password_reset_complete'),
    (r'^admin/', include(admin.site.urls)),
)

urlpatterns += patterns('',
    (r'^tinymce/', include('tinymce.urls')),
    url(r'^oops/$', 'mingus.core.views.oops', name='raise_exception'),
    url(r'^quotes/$', 'mingus.core.views.quote_list', name='quote_list'),
    url(r'^quotes/(?P<slug>[-\w]+)/$', 'mingus.core.views.quote_detail', name='quote_detail'),
    url(r'robots.txt$', rules_list, name='robots_rule_list'),
    (r'^sitemap.xml$', 'django.contrib.sitemaps.views.sitemap', {'sitemaps': sitemaps}),
    (r'^feeds/(?P<url>.*)/$', 'django.contrib.syndication.views.feed', {'feed_dict': feeds}),
    (r'^api/springsteen/posts/$', springsteen_results),
    (r'^api/springsteen/firehose/$', springsteen_firehose),
    (r'^api/springsteen/category/(?P<slug>[-\w]+)/$', springsteen_category),
    url(r'^contact/$',
        contact_form,
        name='contact_form'),

    url(r'^contact/sent/$',
        direct_to_template,
        { 'template': 'contact_form/contact_form_sent.html' },
        name='contact_form_sent'),

    url(r'^page/(?P<page>\w)/$',
        view=home_list,
        name='home_paginated'),

    url(r'^$',
        view=home_list,
        name='home_index'),

    url(r'^tags/(?P<slug>[-\w]+)/$',
        'mingus.core.views.tag_detail',
        name='blog_tag_detail'),

    url (r'^search/$',
        view=proxy_search,
        name='proxy_search'),

    (r'', include('basic.blog.urls')),

    # APIL
    url(r'^archives/$',
        direct_to_template,
        {'template': 'blog/archive_list.html'},
        name='archives'),

    url(r'^IE/$',
        direct_to_template,
        {'template': 'IE.html'},
        name='IE'),

    url(r'^about/$',
        direct_to_template,
        {'template': 'about.html'},
        name='about'),

    # url(r'^test/$',
    #     direct_to_template,
    #     {'template': 'test.html'},
    #     name='test'),

    url(r'^404/$',
        direct_to_template,
         {'template': '404.html'},
         name='404'),

    url(r'^500/$',
        direct_to_template,
        {'template': '500.html'},
        name='500'),

    url(r'^social/',
        include('social_bookmarking.urls')),

    url(r'^blogroll/$',
        blogroll,
        name='blogroll'),

    url(r'^tags/$',
        direct_to_template,
        { 'template': 'blog/tag_list.html'},
        name='tag_list'),

    url(r'^download/(?P<path>.*)$',
        serve_download(serve),
        {'document_root': settings.MEDIA_ROOT},
        name='download'),

    url(r'^localeurl/', include('localeurl.urls')),
)

if settings.DEBUG:
    urlpatterns += patterns('',
        (r'', include('staticfiles.urls')),
    )

