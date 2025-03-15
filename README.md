# Inventar_SAAS

Ein modernes Inventar-Management-System für kleine und mittelständische Unternehmen.

## Funktionen

- **Produktverwaltung**: Hinzufügen, Bearbeiten und Löschen von Produkten
- **Kategorieverwaltung**: Produkte nach Kategorien organisieren
- **Partnerverwaltung**: Lieferanten und Partner verwalten
- **Bestandsverwaltung**: Bestandsüberwachung und -aktualisierung
- **Responsive Design**: Optimiert für Desktop und mobile Geräte

## Technologien

- React
- TypeScript
- Material-UI
- Supabase (Backend und Datenbank)

## Installation

1. Repository klonen
2. Abhängigkeiten installieren: `npm install`
3. Entwicklungsserver starten: `npm start`

## Umgebungsvariablen

Erstelle eine `.env` Datei im Root-Verzeichnis des Projekts basierend auf der Vorlage in `.env.example`:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

Die Anwendung nutzt Supabase für die Datenbankverwaltung. Die Zugangsdaten werden über Umgebungsvariablen konfiguriert und sind nicht im Code enthalten.

## Deployment

Die Anwendung ist über Netlify deployed und kann unter [URL einfügen] aufgerufen werden.
