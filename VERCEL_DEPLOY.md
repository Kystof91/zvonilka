# 🚀 Деплой на Vercel

## Быстрый старт

1. Откройте [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "Add New Project"
4. Выберите репозиторий `zvonilka`
5. Vercel автоматически определит:
   - Framework: Next.js
   - Build Command: `npm run build`
6. Нажмите "Deploy"

**Готово!** Ваше приложение будет доступно по адресу `https://your-app.vercel.app`

## Через Vercel CLI (альтернатива)

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите
vercel login

# Деплой
vercel

# Для production
vercel --prod
```

## Примечания

- ✅ PeerJS работает без отдельного сервера
- ✅ WebRTC работает через HTTPS
- ✅ Автоматический деплой при push в main branch
- ✅ Бесплатный hosting

Enjoy! 🎉
