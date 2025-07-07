FROM hub.lumigame.com/base/nginx:brotli-1.20.2-zlib

COPY ./.nginx/game.conf /etc/nginx/conf.d/default.conf
COPY ./build/web-mobile/assets/122 /usr/share/nginx/html/122
COPY ./build/web-mobile/assets/versions.json /usr/share/nginx/html
