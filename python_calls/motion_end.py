#!/usr/bin/env python3

import requests
import json
from types import SimpleNamespace
from os.path import expanduser
home = expanduser("~")

with open(home + '/.local/share/orahsoft/cam-folder-cleaner/db/db.json', 'r') as f:
    datajs = json.load(f)

user = datajs['user']
username = list(user.keys())[0]
paswd = user[username]

r = requests.get('http://localhost:1337/api/motion/end', auth=(username, paswd))

print(r)
