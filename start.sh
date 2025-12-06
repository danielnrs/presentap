#!/bin/bash

export DATABASE_URL="mysql://root:DanielSintia12-@localhost:3306/presentap"

nohup node .output/server/index.mjs > app.log 2>&1 &
