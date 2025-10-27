# Инструкция по деплою на Vercel

## Быстрый деплой

1. **Зайдите на** [vercel.com](https://vercel.com) и войдите через GitHub

2. **Нажмите "Add New Project"**

3. **Подключите ваш репозиторий** с проектом zvonilka

4. **Vercel автоматически определит настройки**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Нажмите "Deploy"**

6. **Готово!** Ваш сайт будет доступен по адресу типа `your-app.vercel.app`

## Важные замечания

⚠️ **Socket.io сервер** (`server.ts`) не будет работать на Vercel без дополнительной настройки.

Vercel использует serverless functions, поэтому нам нужно использовать:
- Временное решение: WebRTC без signaling сервера (peer.js)
- Полноценное решение: Отдельный Socket.io сервер на Railway/Render/Heroku

## Для полноценной работы рекомендуется:

1. **Деплой Socket.io сервера на** [Railway.app](https://railway.app) или [Render.com](https://render.com)
2. **Использовать environment variables** для указания URL Socket.io сервера
3. **Обновить** `lib/socket.ts` для подключения к внешнему серверу

## Альтернативный вариант - PeerJS

Можно использовать библиотеку PeerJS, которая предоставляет свой signaling сервер:

```bash
npm install peerjs
```

Но для production лучше использовать собственный Socket.io сервер.

---

**После деплоя на Vercel:**
- Сайт будет доступен по HTTPS ✅
- WebRTC будет работать ✅  
- Но нужен отдельный сервер для Socket.io ⚠️
