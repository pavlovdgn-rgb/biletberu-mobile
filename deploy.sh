#!/bin/sh
# Публикация на GitHub Pages: сборка под /biletberu-mobile/ → ветка gh-pages.
# Запуск: npm run deploy   (сайт обновится через 1–2 минуты)
set -e
BASE_PATH=/biletberu-mobile/ npm run build
cp dist/index.html dist/404.html   # прямые ссылки (/app/main, /app/event?id=…) открывают приложение
touch dist/.nojekyll
cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C .. config user.name)" -c user.email="$(git -C .. config user.email)" commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git push -f -q "$(git -C .. remote get-url origin)" gh-pages
rm -rf .git
echo "Готово: https://pavlovdgn-rgb.github.io/biletberu-mobile/app/"
