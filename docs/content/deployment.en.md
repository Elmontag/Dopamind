## Deployment

### With Docker (recommended)

> **Before you start:** Copy `.env.example` to `.env` and set at minimum `JWT_SECRET` and `ENCRYPTION_KEY`.

```bash
git clone https://github.com/Elmontag/Dopamind.git
cd Dopamind

# 1. Prepare environment variables
cp .env.example .env

# 2. Set secrets (required!)
#    Generate secrets: openssl rand -hex 32
$EDITOR .env

# 3. Start all services
docker-compose up --build

# Frontend:  http://localhost:3000
# Backend:   http://localhost:4000
# Nginx:     http://localhost (port 80)
```

The **Setup Wizard** runs automatically on first start and guides you through creating the administrator account.

### Without Docker

```bash
# 1. Start PostgreSQL and create the database
createdb dopamind

# 2. Backend
cd backend
npm install
export JWT_SECRET="$(openssl rand -hex 32)"
export ENCRYPTION_KEY="$(openssl rand -hex 32)"
export DATABASE_URL="postgresql://user:pass@localhost:5432/dopamind"
node server.js

# 3. Frontend (new terminal)
cd frontend
npm install
npm start
```

### Environment Variables

```env
# PostgreSQL
POSTGRES_USER=dopamind
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=dopamind

# Backend
DATABASE_URL=postgresql://dopamind:<strong-password>@postgres:5432/dopamind
JWT_SECRET=<random-secret-min-32-chars>          # REQUIRED
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=<random-secret-min-32-chars>      # REQUIRED
CORS_ORIGIN=https://your-domain.com
```

### Security Checklist

- Set a strong `JWT_SECRET` (at least 32 random characters)
- Set a strong `ENCRYPTION_KEY` for encrypted mail/CalDAV credentials
- Change default PostgreSQL passwords
- Configure `CORS_ORIGIN` to your actual domain
- Use HTTPS with a valid certificate
- Set up PostgreSQL backups
