# Deployment met Dockge

Dit project bestaat uit meerdere mappen (`frontend` en `backend`). Omdat we in onze `docker-compose.yml` aangeven dat hij direct uit deze mappen moet bouwen (`context: ./frontend` e.d.), heeft Dockge de **volledige broncode** van GitHub nodig op je server. 

Als je in Dockge simpelweg de inhoud van `docker-compose.yml` plakt zonder de juiste mapstructuur, krijg je de foutmelding: `unable to prepare context: path not found`.

Er zijn **twee oplossingen** om de app perfect te laten draaien in Dockge.

---

## Optie 1: De Map Klonen via de Terminal (Aanbevolen)

Als je toegang hebt tot de terminal via SSH en via de command line mappen kunt aanmaken, is dit de meest robuuste methode.

1. Login op je server via SSH en ga naar de map waar Dockge de bestanden opslaat (bijv. `/opt/stacks`):
   ```bash
   cd /opt/stacks/
   ```
2. Kloon de volledige repository met de naam `moments`:
   ```bash
   git clone https://github.com/monomo71/moments.git moments
   ```
3. Ga naar de webinterface van Dockge.
4. Klik op 'Scan Stacks' (of hij staat er al automatisch tussen als inactieve stack).
5. Je ziet nu de stack `moments`. Klik erop.
6. Druk op **Start**. Dockge zal nu alle mappen probleemloos vinden en de app compileren!

---

## Optie 2: Rechtstreeks vanuit GitHub bouwen (Geen Terminal nodig)

Als je liever **alles via de webinterface van Dockge** wilt doen en geen zin hebt in de terminal, maak dan een nieuwe Stack aan en plak daar onderstaande `.yml` configuratie in!

Door aan te geven dat de `build` direct moet plaatsvinden vanuit GitHub (met `https://github...#main:mapnaam`), hoef je de bestanden niet handmatig op je server te hebben staan. Zorg wél voor de `volumes:` blocks, anders gaan je uploads verloren bij een update!

```yaml
version: '3.8'

services:
  backend:
    build: https://github.com/monomo71/moments.git#main:backend
    ports:
      - "3001:3001"    
    volumes:
      - moments_uploads:/app/uploads
      - moments_db:/app/data
    environment:
      - PORT=3001
      - DATABASE_URL=file:/app/data/dev.db
      - JWT_SECRET=supersecret

  frontend:
    build: https://github.com/monomo71/moments.git#main:frontend
    ports:
      - "3002:80"

volumes:
  moments_uploads:
  moments_db:
```

Plak dit in de configuratie, klik op **Start**, en Dockge haalt het direct bij GitHub op. 

> *Tip: Zodra je updates wilt doorvoeren in de toekomst, druk je in Dockge simpelweg op "Update", waarna hij automatisch de verse code van jouw GitHub repullet!*
