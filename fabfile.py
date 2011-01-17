#fab -f fabfile.py <command>

from __future__ import with_statement

import os
from fabric.api import *

# I have entries in /etc/hosts which make these names work. 
# If I didn't, I'd just use IP addresses.
env.hosts = ['kaltorak']
env.user = 'webadmin'
env.project_name = 'apluggedinlife'

# paths
env.root = "/var/www/%s" % env.project_name
env.bin_root = os.path.join(env.root, 'bin')
env.mingus_root = os.path.join(env.root, "mingus")
env.pip_requirements_root = os.path.join(env.mingus_root, 'apil-requirements.txt')
env.gunicorn_pid_root = '/var/run/gunicorn.pid'

# commands
env.activate = 'source %s' % os.path.join(env.bin_root, 'activate')
env.export = 'export DJANGO_SETTINGS_MODULE=settings'

def cc():
    with cd(env.mingus_root):
        run(env.export + " && " + env.activate + ' && python -c "from django.core.cache import cache; cache.clear()"')

def reload():
    with cd(env.mingus_root):
        sudo('[ -f %(gunicorn_pid_root)s ] && kill -HUP $(cat %(gunicorn_pid_root)s)' % {
            'gunicorn_pid_root': env.gunicorn_pid_root
        })

def stop():
    with cd(env.mingus_root):
        sudo('[ -f %(gunicorn_pid_root)s ] && kill $(cat %(gunicorn_pid_root)s)' % {
            'gunicorn_pid_root': env.gunicorn_pid_root
        })

def restart():
    with cd(env.mingus_root):
        sudo('sudo sv restart %s' % env.project_name)

def push():
    with cd(env.root):
        run('git pull origin master')

def pip_upgrade():
    with cd(env.mingus_root):
        run(env.export + ' && pip install -U -r %s' % env.pip_requirements_root)

def deploy():
    local('git push origin master')
    push()
    pip_upgrade()
    reload()

def compilemessages():
    with cd(env.root):
        run(env.activate + ' && python django-admin.py compilemessages')

