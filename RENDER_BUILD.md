# Render Deployment Configuration

## Build Settings for Render Dashboard

When deploying to Render, use these settings in the dashboard:

### Build Command:
```bash
npm ci --include=dev && npm run build
```

### Start Command:
```bash
node dist/src/index.js
```

### Environment:
- **Node Version**: 18.x or 20.x (recommended)

### Important Notes:
1. **Dev Dependencies**: The build command includes `--include=dev` to ensure TypeScript and type definitions are installed during build
2. **Root Directory**: Make sure the root directory is set to `server/` if deploying from monorepo
3. **Environment Variables**: Add all required env vars in Render dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `PORT` (default: 3000)
   - `CORS_ORIGINS`
   - `NODE_ENV=production`

### Alternative Build Command (if above doesn't work):
```bash
NODE_ENV=production npm install --include=dev && npm run build
```

