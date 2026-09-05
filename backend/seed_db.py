import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from sync_and_seed_mysql import sync_and_seed

if __name__ == '__main__':
    print('[Database] Running MySQL Seed Routine...')
    sync_and_seed()
