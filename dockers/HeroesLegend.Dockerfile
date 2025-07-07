FROM hub.lumigame.com/base/nginx:brotli-1.20.2-zlib

COPY ./.nginx/game.conf /etc/nginx/conf.d/default.conf
COPY ./build/web-mobile/assets/38 /usr/share/nginx/html/38
COPY ./build/web-mobile/assets/versions.json /usr/share/nginx/html
