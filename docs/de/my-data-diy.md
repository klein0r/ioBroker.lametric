![Logo](../../admin/lametric.png)

# ioBroker.lametric

## My Data (DIY) *(version > 1.1.0)*

*LaMetric* bietet (über den integrierten App-Store) eine zusätzliche App an, um eigene Informationen darzustellen. Diese App heißt [My Data DIY](https://apps.lametric.com/apps/my_data__diy_/8942). Dieser Adapter erstellt einen Datenpunkt im erforderlichen Format.

Es können verschiedene API Adapter genutzt werden, um Daten zur *LaMetric Time* zu übertragen:

- REST API Adapter (empfohlen)
- Simple API Adapter

### REST API Adapter

```ioBroker LaMetric Adapter -> State with Frame information <- REST API Adapter <- My Data DIY App <- LaMetric```

#### Konfiguration (mit Authentisierung)

1. Installiere den [REST API ioBroker Adapter](https://github.com/ioBroker/ioBroker.rest-api)
2. Erstelle einen neuen ioBroker-Nutzer mit dem Namen ``lametric`` und einem eigenen Passwort (z.B. ``HhX7dZl3Fe``)
3. Füge den neuen ``lametric``-Nutzer zur Gruppe ``users`` hinzu
4. Installiere die App *My Data DIY* über den App-Store auf deiner *LaMetric Time*
5. Öffne die Einstellungen der *My Data (DIY)* App und konfiguriere die URL des REST API Adapters (siehe unten)
6. Gehe in die Adaptereinstellungen und füge neue Frames mit deinen eigenen Informationen hinzu (siehe nächster Abschnitt)

```
http://lametric:HhX7dZl3Fe@172.16.0.219:8093/v1/state/lametric.0.mydatadiy.obj/plain?extraPlain=true
```

### Simple API Adapter

```ioBroker LaMetric Adapter -> State with Frame information <- Simple API Adapter <- My Data DIY App <- LaMetric```

#### Konfiguration (mit Authentisierung)

1. Installiere den [Simple API ioBroker Adapter](https://github.com/ioBroker/ioBroker.simple-api)
2. Erstelle einen neuen ioBroker-Nutzer mit dem Namen ``lametric`` und einem eigenen Passwort (z.B. ``HhX7dZl3Fe``)
3. Füge den neuen ``lametric``-Nutzer zur Gruppe ``users`` hinzu
4. Installiere die App *My Data DIY* über den App-Store auf deiner *LaMetric Time*
5. Öffne die Einstellungen der *My Data (DIY)* App und konfiguriere die URL des Simple API Adapters (siehe unten)
6. Gehe in die Adaptereinstellungen und füge neue Frames mit deinen eigenen Informationen hinzu (siehe nächster Abschnitt)

```
http://172.16.0.219:8087/getPlainValue/lametric.0.mydatadiy.obj/?json&user=lametric&pass=HhX7dZl3Fe
```

**Wichtig: Nutze das json-Flag des SimpleAPI Adapters (verfügbar seit Version 2.6.2)**

**Stelle sicher, dass die IP, der Port, Benutzername und Passwort in der URL korrekt sind!**

#### Konfiguration (ohne Authentisierung)

1. Installiere den [Simple API ioBroker Adapter](https://github.com/ioBroker/ioBroker.simple-api)
2. Installiere die App *My Data DIY* über den App-Store auf deiner *LaMetric Time*
3. Öffne die Einstellungen der *My Data (DIY)* App und konfiguriere die URL des Simple API Adapters (siehe unten)
4. Gehe in die Adaptereinstellungen und füge neue Frames mit deinen eigenen Informationen hinzu (siehe nächster Abschnitt)

```
http://172.16.0.219:8087/getPlainValue/lametric.0.mydatadiy.obj/?json
```

**Stelle sicher, dass die IP und der Port in der URL korrekt sind!**

### Frame Konfiguration

- Füge mit dem Plus-Button so viele Frames hinzu, wie Du möchtest
- Symbol: Wähle ein Symbol von der [offiziellen Webseite](https://developer.lametric.com/icons) und füge die ID in das Feld ein. **Wichtig: Nutze ein i (für statische Sybole) oder ein a (für animierte Symbole) als Präfix der ID (Beispiel: `i3389`)**
- Text: Tippe einen beliebigen anzuzeigenden Text ein. Du kannst Informatioenn aus Datenpunkten abfragem, indem Du deren ID in geschweifte Klammern angibst. An dieser Stelle wird dann der aktuelle Wert der Datenpunkte eingesetzt. (Beispiel: `{youtube.0.channels.HausAutomatisierungCom.statistics.subscriberCount} Subscribers`)
- Dauer: Legt fest, wie lange der einzelne Frame angezeigt werden soll (Standard = 5 Sekunden)

Beispielkonfiguration von einigen Frames:

![example frame config](./img/my-data-diy.png)

![example config iphone](./img/my-data-diy-iphone.png)