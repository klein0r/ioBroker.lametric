## v1 API

### Request a new user

```bash
curl 'http://10.10.2.125/api/v1/user/request?group=web_admin' -X 'POST' -H 'Content-Length: 0'
```

```json
{
    "challenge": {
        "date": "Fri Sep 6 13:24:53 2024",
        "duration": 60,
        "state": "in-progress",
        "type": "press_key",
        "uuid": "7b34633339356262302d623431352d343831652d613538372d6631356665373963323536627d"
    }
}
```

### Validate (press button in time)

```bash
curl 'http://10.10.2.125/api/v1/user/challenge/7b34633339356262302d623431352d343831652d613538372d6631356665373963323536627d' -X 'GET'
```

```json
{
    "date": "Fri Sep 6 13:24:53 2024",
    "duration": 60,
    "state": "in-progress",
    "type": "press_key",
    "uuid": "7b34633339356262302d623431352d343831652d613538372d6631356665373963323536627d"
}
```

when pressed

```json
{
    "date": "Fri Sep 6 13:28:13 2024",
    "duration": 60,
    "state": "resolved",
    "type": "press_key",
    "uuid" : "7b34633339356262302d623431352d343831652d613538372d6631356665373963323536627d"
}
```

### Exchange

```bash
curl 'http://10.10.2.125/api/v1/user/request/exchange' \
-X 'POST' \
--data-binary '{"challenge_id":"7b34633339356262302d623431352d343831652d613538372d6631356665373963323536627d"}'
```

```json
{
    "user": {
        "group": "web_admin",
        "key" : "7b33623232666536632d313531312d346535392d626530332d3233343463353933346238377d",
        "name" : "",
        "origin": "local",
        "status": "active",
        "uuid" : "7b37316133306532362d646133622d343264362d386464652d6238363461636363383864377d"
    }
}
```

**Use the `user.key` property for further requests!**

## Radio API

### Get access token for cloud

```bash
curl 'http://10.10.2.125/api/v1/apps/com.lametric.radio' \
-X 'GET' \
-H 'Cookie: no-auth-challenge=1; authorization=7b33623232666536632d313531312d346535392d626530332d3233343463353933346238377d:'
```

see `settings_schema.properties.radioSearch.access_token`

Use the token for further requests

```bash
curl 'https://developer.lametric.com/radiodb/api/countries' \
-X 'GET' \
-H 'Authorization: ...'
```

### Search stations

```bash
curl 'https://developer.lametric.com/radiodb/api/stations?q=Hochstift&country=DE&codec=all' \
-X 'GET' \
-H 'Authorization: ...'
```

```json
[
    {
        "id": "af918bd7-a9e6-4e27-a7ef-b7619d88671f",
        "name": "Radio hochstift",
        "url": "https:\/\/developer.lametric.com\/radiodb\/api\/stations\/af918bd7-a9e6-4e27-a7ef-b7619d88671f\/play.m3u",
        "logo": "",
        "tags": "",
        "bitrate": 128,
        "codec": "MP3",
        "hls": 0,
        "countryCode": "DE"
    },
    {
        "id": "c59e4772-9581-4b27-8236-6eb8b4234cb3",
        "name": "Radio Hochstift",
        "url": "https:\/\/developer.lametric.com\/radiodb\/api\/stations\/c59e4772-9581-4b27-8236-6eb8b4234cb3\/play.m3u",
        "logo": "https:\/\/d3cv44cpd8swh9.cloudfront.net\/fileadmin\/ams\/Shared\/Public\/custom\/img\/logo.png",
        "tags": "",
        "bitrate": 128,
        "codec": "MP3",
        "hls": 0,
        "countryCode": "DE"
    },
    {
        "id": "9628cc63-b6e6-4731-b32f-e241b11d8751",
        "name": "Radio Hochstift",
        "url": "https:\/\/developer.lametric.com\/radiodb\/api\/stations\/9628cc63-b6e6-4731-b32f-e241b11d8751\/play.m3u",
        "logo": "https:\/\/www.radiohochstift.de\/icons\/apple-icon-120.png",
        "tags": "",
        "bitrate": 128,
        "codec": "MP3",
        "hls": 0,
        "countryCode": "DE"
    }
]
```

```bash
curl 'https://developer.lametric.com/radiodb/api/genres' \
-X 'GET' \
-H 'Authorization: ...' \
```

```bash
curl 'https://developer.lametric.com/radiodb/api/stations?genre=pop&codec=all' \
-X 'GET' \
-H 'Authorization: ...'
```

### Save settings

```bash
curl 'http://10.10.2.125/api/v1/apps/com.lametric.radio/4_com.lametric.radio/settings' \
-X 'PUT' \
-H 'Cookie: no-auth-challenge=1; authorization=7b33623232666536632d313531312d346535392d626530332d3233343463353933346238377d:' \
--data-binary '{"_title":"Radio","default_stations_loaded":true,"is_show_title_and_artist":true,"is_turn_off_timeout_active":false,"stations":[{"bitrate":128,"bitrateString":"Germany - 128 kb/s","codec":"MP3","countryCode":"DE","hls":0,"icon":"https://www1.wdr.de/radio/1live/resources/img/favicon/apple-touch-icon.png","id":"b2cbd1fd-275d-432a-8b20-37dcb3572315","logo":"https://www1.wdr.de/radio/1live/resources/img/favicon/apple-touch-icon.png","name":"1LIVE","streams":["https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3"],"tags":"ard, pop, public radio, rock, wdr","url":"https://developer.lametric.com/radiodb/api/stations/b2cbd1fd-275d-432a-8b20-37dcb3572315/play.m3u"},{"id":"c59e4772-9581-4b27-8236-6eb8b4234cb3","name":"Radio Hochstift","url":"https://developer.lametric.com/radiodb/api/stations/c59e4772-9581-4b27-8236-6eb8b4234cb3/play.m3u","logo":"https://d3cv44cpd8swh9.cloudfront.net/fileadmin/ams/Shared/Public/custom/img/logo.png","tags":"","bitrate":128,"codec":"MP3","hls":0,"countryCode":"DE","icon":"https://d3cv44cpd8swh9.cloudfront.net/fileadmin/ams/Shared/Public/custom/img/logo.png","bitrateString":"Germany - 128 kb/s","streams":["http://stream.radiohochstift.de/444z9bg"]}],"turn_off_timeout":900,"version":3}'
```

## Weather API

### Get access token for cloud

```bash
curl 'http://10.10.2.125/api/v1/apps/com.lametric.weather' \
-X 'GET' \
-H 'Cookie: no-auth-challenge=1; authorization=7b33623232666536632d313531312d346535392d626530332d3233343463353933346238377d:'
```

see `settings_schema.properties.lametric_city.api_key` (set as `X-LaMetric-Proxy-x-api-key` custom header in further requests)

### Search Cities

```bash
curl 'http://10.10.2.125/api/v1/proxy?url=https:%2F%2Fweather.lametric.com%2Fapi%2Fv1%2Flookup%2Fcity%3Fname%3DPaderborn' \
-X 'GET' \
-H 'Cookie: no-auth-challenge=1; authorization=7b33623232666536632d313531312d346535392d626530332d3233343463353933346238377d:' \
-H 'X-LaMetric-Proxy-x-api-key: ...'
```

```json
[
    {
        "id": 2855745,
        "name": "Paderborn",
        "country": "DE",
        "country_name": "Germany",
        "subdivision1": "North Rhine-Westphalia",
        "subdivision2": "",
        "location": {
            "lon": 8.75439,
            "lat": 51.719051
        },
        "time_zone": "Europe/Berlin"
    }
]
```

### Save settings

```bash
curl 'http://10.10.2.125/api/v1/apps/com.lametric.weather/2_com.lametric.weather/settings' \
-X 'PUT' \
-H 'Cookie: no-auth-challenge=1; authorization=7b33623232666536632d313531312d346535392d626530332d3233343463353933346238377d:' \
--data-binary '{"autodetect":false,"humidity":true,"lametric_city":{"id":2855745,"name":"Paderborn","country":"DE","country_name":"Germany","subdivision1":"North Rhine-Westphalia","subdivision2":"","location":{"lon":8.75439,"lat":51.719051},"time_zone":"Europe/Berlin"},"precipitations_scale":"inches","pressure_scale":"auto","speed":"auto","tempscale":"auto","version":1,"visibility_scale":"auto","windspeed":true,"_title":"Wetter"}'
```
