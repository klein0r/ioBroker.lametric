'use strict';

/**
 * The answer of the message "help": what the instance answers and which states an agent uses, written for an AI
 * agent (e.g. ioBroker.pi-agent, or the MCP server with send_to) and for script authors.
 * Keep it in sync with onMessage in main.js.
 */

/** The commands onMessage answers. write: true if the command has an effect on the device */
const COMMANDS = [
    { command: 'help', write: false },
    { command: 'notification', write: true },
    { command: 'sendNotification', write: true },
    { command: 'getPollingUrl', write: false },
];

const HELP = `ioBroker.lametric: controls a LaMetric Time (pixel clock with speaker) over its local API, one instance per
device. An agent can show a notification (text frames, icon, sound, chart), switch apps and set brightness, volume
and the screensaver by states.

Commands (sendTo lametric.0):
- notification {text, icon?, priority?, iconType?, sound?, soundUrl?, lifeTime?, cycles?}: shows a notification;
  answer: the "success" object of the device (e.g. {id}) or {error}.
  text: a string, or a list of frames: each string is a text frame, each list of numbers a chart frame (e.g.
  ["Hello", "World", [1, 5, 3, 8]]). icon: for every text frame, an icon ID of the LaMetric gallery (e.g. "i31820",
  "a123" animated) or "data:image/png;base64,..." (8 x 8 pixels). priority: info, warning or critical. iconType:
  none, info or alert (a sign shown before the notification). sound: a sound ID of the device, e.g. "cat",
  "bicycle", "positive1"; an ID that contains "alarm" (alarm1 ... alarm13) is played as an alarm. soundUrl: an mp3
  to play instead (the device must reach it). lifeTime: how long the notification may wait in the queue of the
  device, in milliseconds. cycles: how often it is shown, 0 = until it is dismissed on the device.
- sendNotification: the notification-manager passes on ioBroker notifications: their messages are shown as a
  critical notification with an alarm sound. Answer as for notification.
- getPollingUrl {webInstance}: the address of "My Data (DIY)" on a web instance, for the settings, not for agents.
A message of the wrong type answers {error: "Incomplete message"}, one without message {error: "Invalid message"}.

States (lametric.0.*), written with ack false:
- meta.display.brightness (%), meta.display.brightnessAuto, meta.audio.volume (%), meta.mode (manual, auto,
  schedule, kiosk), meta.display.screensaver.enabled, meta.bluetooth.active.
- apps.next, apps.prev (true); apps.<app>.activate (true): shows that app now. Special apps have more states below
  apps.<app>: clock.alarm.enabled, clock.alarm.time ("HH:MM"), countdown.configure (seconds), countdown.start,
  countdown.pause, countdown.reset, radio.play, radio.stop, radio.next, radio.prev, stopwatch.start,
  stopwatch.pause, stopwatch.reset, weather.forecast.
- read-only: info.connection, meta.name, meta.wifi.*, meta.display.brightnessMode.

How to talk to the user:
- Each device is an instance (lametric.0, lametric.1 ...). If there are several and the user names none, ask which
  one; do not guess.
- Show notifications and play sounds only on the user's request; alarm sounds, priority critical, a high volume and
  sounds at night (about 22:00 to 07:00) only when the user asks for it explicitly. Use cycles 0 only when the text
  has to stay until dismissed.
- Keep texts short: longer texts scroll.
- The alarm of the clock app, the mode and bluetooth change the device: only on the user's request.`;

module.exports = { COMMANDS, HELP };
