## Deployment

### Mit Docker (empfohlen)

> **Bevor du startest:** Kopiere `.env.example` nach `.env` und setze mindestens `JWT_SECRET` und `ENCRYPTION_KEY`.

```bash
git clone https://github.com/Elmontag/Dopamind.git
cd Dopamind

# 1. Umgebungsvariablen vorbereiten
cp .env.example .env

# 2. Secrets setzen (Pflicht!)
#    Secrets generieren: openssl rand -hex 32
$EDITOR .env

# 3. Alle Services starten
docker-compose up --build

# Frontend:  http://localhost:3000
# Backend:   http://localhost:4000
# Nginx:     http://localhost (Port 80)
```

Der **Setup-Assistent** startet automatisch beim ersten Start und führt durch die Einrichtung des Administrator-Kontos.

### Ohne Docker

```bash
# 1. PostgreSQL starten und Datenbank erstellen
createdb dopamind

# 2. Backend
cd backend
npm install
export JWT_SECRET="$(openssl rand -hex 32)"
export ENCRYPTION_KEY="$(openssl rand -hex 32)"
export DATABASE_URL="postgresql://user:pass@localhost:5432/dopamind"
node server.js

# 3. Frontend (neues Terminal)
cd frontend
npm install
npm start
```

### Umgebungsvariablen

```env
# PostgreSQL
POSTGRES_USER=dopamind
POSTGRES_PASSWORD=<sicheres-passwort>
POSTGRES_DB=dopamind

# Backend
DATABASE_URL=postgresql://dopamind:<sicheres-passwort>@postgres:5432/dopamind
JWT_SECRET=<zufälliger-schlüssel-min-32-zeichen>    # PFLICHT
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=<zufälliger-schlüssel-min-32-zeichen> # PFLICHT
CORS_ORIGIN=https://deine-domain.de
```

### Sicherheits-Checkliste

- Starkes `JWT_SECRET` setzen (mindestens 32 zufällige Zeichen)
- Starken `ENCRYPTION_KEY` für verschlüsselte Mail-/CalDAV-Zugangsdaten setzen
- Standard-PostgreSQL-Passwörter ändern
- `CORS_ORIGIN` auf die eigene Domain konfigurieren
- HTTPS mit gültigem Zertifikat verwenden
- PostgreSQL-Backups einrichten
