'use strict';

if (typeof goog !== 'undefined') {
    goog.provide('Blockly.JavaScript.Sendto');
    goog.require('Blockly.JavaScript');
}

Blockly.Translate =
    Blockly.Translate ||
    function (word, lang) {
        lang = lang || systemLang;
        if (Blockly.Words && Blockly.Words[word]) {
            return Blockly.Words[word][lang] || Blockly.Words[word].en;
        } else {
            return word;
        }
    };

/// --- SendTo lametric --------------------------------------------------
Blockly.Words['lametric'] = { en: 'LaMetric Notification', de: 'LaMetric Notification' };
Blockly.Words['lametric_icon'] = { en: 'icon', de: 'Icon' };
Blockly.Words['lametric_icontype'] = { en: 'icon type', de: 'Icon-Typ' };
Blockly.Words['lametric_lifetime'] = { en: 'life time (ms)', de: 'Lebenszeit (ms)' };
Blockly.Words['lametric_message'] = { en: 'message', de: 'Nachricht' };
Blockly.Words['lametric_sound'] = { en: 'sound', de: 'Ton' };
Blockly.Words['lametric_priority'] = { en: 'priority', de: 'Priorität' };
Blockly.Words['lametric_cycles'] = { en: 'cycles', de: 'Wiederholungen' };

Blockly.Words['lametric_priority_none'] = { en: 'none', de: 'Ohne' };
Blockly.Words['lametric_priority_info'] = { en: 'info', de: 'Info' };
Blockly.Words['lametric_priority_warning'] = { en: 'warning', de: 'Warnung' };
Blockly.Words['lametric_priority_critical'] = { en: 'critical', de: 'Kritisch' };

Blockly.Words['lametric_sound_none'] = { en: 'none', de: 'Ohne' };
Blockly.Words['lametric_sound_bicycle'] = { en: 'bicycle', de: 'Fahrrad' };
Blockly.Words['lametric_sound_car'] = { en: 'car', de: 'Auto' };
Blockly.Words['lametric_sound_cash'] = { en: 'cash', de: 'Bar' };
Blockly.Words['lametric_sound_cat'] = { en: 'cat', de: 'Katze' };
Blockly.Words['lametric_sound_dog'] = { en: 'dog', de: 'Hund' };
Blockly.Words['lametric_sound_dog2'] = { en: 'dog2', de: 'Hund 2' };
Blockly.Words['lametric_sound_energy'] = { en: 'energy', de: 'Energie' };
Blockly.Words['lametric_sound_knock_knock'] = { en: 'knock-knock', de: 'Klopfen' };
Blockly.Words['lametric_sound_letter_email'] = { en: 'letter_email', de: 'Email' };
Blockly.Words['lametric_sound_lose1'] = { en: 'lose1', de: 'lose1' };
Blockly.Words['lametric_sound_lose2'] = { en: 'lose2', de: 'lose2' };
Blockly.Words['lametric_sound_negative1'] = { en: 'negative1', de: 'Negativ 1' };
Blockly.Words['lametric_sound_negative2'] = { en: 'negative2', de: 'Negativ 2' };
Blockly.Words['lametric_sound_negative3'] = { en: 'negative3', de: 'Negativ 3' };
Blockly.Words['lametric_sound_negative4'] = { en: 'negative4', de: 'Negativ 4' };
Blockly.Words['lametric_sound_negative5'] = { en: 'negative5', de: 'Negativ 5' };
Blockly.Words['lametric_sound_notification'] = { en: 'notification', de: 'Benachrichtigung 1' };
Blockly.Words['lametric_sound_notification2'] = { en: 'notification2', de: 'Benachrichtigung 2' };
Blockly.Words['lametric_sound_notification3'] = { en: 'notification3', de: 'Benachrichtigung 3' };
Blockly.Words['lametric_sound_notification4'] = { en: 'notification4', de: 'Benachrichtigung 4' };
Blockly.Words['lametric_sound_open_door'] = { en: 'open_door', de: 'Tür' };
Blockly.Words['lametric_sound_positive1'] = { en: 'positive1', de: 'Positiv 1' };
Blockly.Words['lametric_sound_positive2'] = { en: 'positive2', de: 'Positiv 2' };
Blockly.Words['lametric_sound_positive3'] = { en: 'positive3', de: 'Positiv 3' };
Blockly.Words['lametric_sound_positive4'] = { en: 'positive4', de: 'Positiv 4' };
Blockly.Words['lametric_sound_positive5'] = { en: 'positive5', de: 'Positiv 5' };
Blockly.Words['lametric_sound_positive6'] = { en: 'positive6', de: 'Positiv 6' };
Blockly.Words['lametric_sound_statistic'] = { en: 'statistic', de: 'Statistik' };
Blockly.Words['lametric_sound_thunder'] = { en: 'thunder', de: 'Gewitter' };
Blockly.Words['lametric_sound_water1'] = { en: 'water1', de: 'Wasser 1' };
Blockly.Words['lametric_sound_water2'] = { en: 'water2', de: 'Wasser 2' };
Blockly.Words['lametric_sound_win'] = { en: 'win', de: 'Gewinn 1' };
Blockly.Words['lametric_sound_win2'] = { en: 'win2', de: 'Gewinn 2' };
Blockly.Words['lametric_sound_wind'] = { en: 'wind', de: 'Wind' };
Blockly.Words['lametric_sound_wind_short'] = { en: 'wind_short', de: 'Wind kurz' };
Blockly.Words['lametric_sound_alarm1'] = { en: 'alarm1', de: 'Alarm 1' };
Blockly.Words['lametric_sound_alarm2'] = { en: 'alarm2', de: 'Alarm 2' };
Blockly.Words['lametric_sound_alarm3'] = { en: 'alarm3', de: 'Alarm 3' };
Blockly.Words['lametric_sound_alarm4'] = { en: 'alarm4', de: 'Alarm 4' };
Blockly.Words['lametric_sound_alarm5'] = { en: 'alarm5', de: 'Alarm 5' };
Blockly.Words['lametric_sound_alarm6'] = { en: 'alarm6', de: 'Alarm 6' };
Blockly.Words['lametric_sound_alarm7'] = { en: 'alarm7', de: 'Alarm 7' };
Blockly.Words['lametric_sound_alarm8'] = { en: 'alarm8', de: 'Alarm 8' };
Blockly.Words['lametric_sound_alarm9'] = { en: 'alarm9', de: 'Alarm 9' };
Blockly.Words['lametric_sound_alarm10'] = { en: 'alarm10', de: 'Alarm 10' };
Blockly.Words['lametric_sound_alarm11'] = { en: 'alarm11', de: 'Alarm 11' };
Blockly.Words['lametric_sound_alarm12'] = { en: 'alarm12', de: 'Alarm 12' };
Blockly.Words['lametric_sound_alarm13'] = { en: 'alarm13', de: 'Alarm 13' };

Blockly.Words['lametric_icon_none'] = { en: 'none', de: 'Ohne' };
Blockly.Words['lametric_icon_info'] = { en: 'info', de: 'Information' };
Blockly.Words['lametric_icon_alert'] = { en: 'alert', de: 'Alarm' };

Blockly.Words['lametric_anyInstance'] = { en: 'all instances', de: 'Alle Instanzen' };
Blockly.Words['lametric_tooltip'] = { en: 'Send notification to LaMetric', de: 'Sende eine Benachrichtigung zur LaMetric' };
Blockly.Words['lametric_help'] = { en: 'https://github.com/klein0r/ioBroker.lametric/blob/master/README.md', de: 'https://github.com/klein0r/ioBroker.lametric/blob/master/README.md' };

Blockly.Sendto.blocks['lametric'] =
    '<block type="lametric">' +
    '  <field name="INSTANCE"></field>' +
    '  <field name="SOUND"></field>' +
    '  <field name="PRIORITY"></field>' +
    '  <field name="ICON_TYPE">none</field>' +
    '  <value name="MESSAGE">' +
    '    <shadow type="text">' +
    '      <field name="TEXT">haus-automatisierung.com</field>' +
    '    </shadow>' +
    '  </value>' +
    '  <value name="ICON">' +
    '    <shadow type="text">' +
    '      <field name="TEXT">i31820</field>' +
    '    </shadow>' +
    '  </value>' +
    '  <value name="LIFETIME">' +
    '    <shadow type="math_number">' +
    '      <field name="NUM">1000</field>' +
    '    </shadow>' +
    '  </value>' +
    '  <value name="CYCLES">' +
    '    <shadow type="math_number">' +
    '      <field name="NUM">1</field>' +
    '    </shadow>' +
    '  </value>' +
    '</block>';

Blockly.Blocks['lametric'] = {
    init: function () {
        const options = [];
        if (typeof main !== 'undefined' && main.instances) {
            for (let i = 0; i < main.instances.length; i++) {
                const m = main.instances[i].match(/^system.adapter.lametric.(\d+)$/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    options.push(['lametric.' + n, '.' + n]);
                }
            }
        }

        if (!options.length) {
            for (let k = 0; k <= 4; k++) {
                options.push(['lametric.' + k, '.' + k]);
            }
        }
        options.unshift([Blockly.Translate('lametric_anyInstance'), '']);

        this.appendDummyInput('INSTANCE').appendField(Blockly.Translate('lametric')).appendField(new Blockly.FieldDropdown(options), 'INSTANCE');

        this.appendValueInput('MESSAGE').appendField(Blockly.Translate('lametric_message'));

        this.appendDummyInput('SOUND')
            .appendField(Blockly.Translate('lametric_sound'))
            .appendField(
                new Blockly.FieldDropdown([
                    [Blockly.Translate('lametric_sound_none'), ''],
                    [Blockly.Translate('lametric_sound_bicycle'), 'bicycle'],
                    [Blockly.Translate('lametric_sound_car'), 'car'],
                    [Blockly.Translate('lametric_sound_cash'), 'cash'],
                    [Blockly.Translate('lametric_sound_cat'), 'cat'],
                    [Blockly.Translate('lametric_sound_dog'), 'dog'],
                    [Blockly.Translate('lametric_sound_dog2'), 'dog2'],
                    [Blockly.Translate('lametric_sound_energy'), 'energy'],
                    [Blockly.Translate('lametric_sound_knock_knock'), 'knock-knock'],
                    [Blockly.Translate('lametric_sound_letter_email'), 'letter_email'],
                    [Blockly.Translate('lametric_sound_lose1'), 'lose1'],
                    [Blockly.Translate('lametric_sound_lose2'), 'lose2'],
                    [Blockly.Translate('lametric_sound_negative1'), 'negative1'],
                    [Blockly.Translate('lametric_sound_negative2'), 'negative2'],
                    [Blockly.Translate('lametric_sound_negative3'), 'negative3'],
                    [Blockly.Translate('lametric_sound_negative4'), 'negative4'],
                    [Blockly.Translate('lametric_sound_negative5'), 'negative5'],
                    [Blockly.Translate('lametric_sound_notification'), 'notification'],
                    [Blockly.Translate('lametric_sound_notification2'), 'notification2'],
                    [Blockly.Translate('lametric_sound_notification3'), 'notification3'],
                    [Blockly.Translate('lametric_sound_notification4'), 'notification4'],
                    [Blockly.Translate('lametric_sound_open_door'), 'open_door'],
                    [Blockly.Translate('lametric_sound_positive1'), 'positive1'],
                    [Blockly.Translate('lametric_sound_positive2'), 'positive2'],
                    [Blockly.Translate('lametric_sound_positive3'), 'positive3'],
                    [Blockly.Translate('lametric_sound_positive4'), 'positive4'],
                    [Blockly.Translate('lametric_sound_positive5'), 'positive5'],
                    [Blockly.Translate('lametric_sound_positive6'), 'positive6'],
                    [Blockly.Translate('lametric_sound_statistic'), 'statistic'],
                    [Blockly.Translate('lametric_sound_thunder'), 'thunder'],
                    [Blockly.Translate('lametric_sound_water1'), 'water1'],
                    [Blockly.Translate('lametric_sound_water2'), 'water2'],
                    [Blockly.Translate('lametric_sound_win'), 'win'],
                    [Blockly.Translate('lametric_sound_win2'), 'win2'],
                    [Blockly.Translate('lametric_sound_wind'), 'wind'],
                    [Blockly.Translate('lametric_sound_wind_short'), 'wind_short'],

                    [Blockly.Translate('lametric_sound_alarm1'), 'alarm1'],
                    [Blockly.Translate('lametric_sound_alarm2'), 'alarm2'],
                    [Blockly.Translate('lametric_sound_alarm3'), 'alarm3'],
                    [Blockly.Translate('lametric_sound_alarm4'), 'alarm4'],
                    [Blockly.Translate('lametric_sound_alarm5'), 'alarm5'],
                    [Blockly.Translate('lametric_sound_alarm6'), 'alarm6'],
                    [Blockly.Translate('lametric_sound_alarm7'), 'alarm7'],
                    [Blockly.Translate('lametric_sound_alarm8'), 'alarm8'],
                    [Blockly.Translate('lametric_sound_alarm9'), 'alarm9'],
                    [Blockly.Translate('lametric_sound_alarm10'), 'alarm10'],
                    [Blockly.Translate('lametric_sound_alarm11'), 'alarm11'],
                    [Blockly.Translate('lametric_sound_alarm12'), 'alarm12'],
                    [Blockly.Translate('lametric_sound_alarm13'), 'alarm13'],
                ]),
                'SOUND',
            );

        this.appendDummyInput('PRIORITY')
            .appendField(Blockly.Translate('lametric_priority'))
            .appendField(
                new Blockly.FieldDropdown([
                    [Blockly.Translate('lametric_priority_none'), ''],
                    [Blockly.Translate('lametric_priority_info'), 'info'],
                    [Blockly.Translate('lametric_priority_warning'), 'warning'],
                    [Blockly.Translate('lametric_priority_critical'), 'critical'],
                ]),
                'PRIORITY',
            );

        this.appendValueInput('ICON').appendField(Blockly.Translate('lametric_icon'));

        this.appendDummyInput('ICON_TYPE')
            .appendField(Blockly.Translate('lametric_icontype'))
            .appendField(
                new Blockly.FieldDropdown([
                    [Blockly.Translate('lametric_icon_none'), 'none'],
                    [Blockly.Translate('lametric_icon_info'), 'info'],
                    [Blockly.Translate('lametric_icon_alert'), 'alert'],
                ]),
                'ICON_TYPE',
            );

        this.appendValueInput('LIFETIME').appendField(Blockly.Translate('lametric_lifetime'));

        this.appendValueInput('CYCLES').appendField(Blockly.Translate('lametric_cycles'));

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Translate('lametric_tooltip'));
        this.setHelpUrl(Blockly.Translate('lametric_help'));
    },
};

Blockly.JavaScript['lametric'] = function (block) {
    const priority = block.getFieldValue('PRIORITY');
    const iconType = block.getFieldValue('ICON_TYPE');
    const sound = block.getFieldValue('SOUND');

    const lifeTime = Blockly.JavaScript.valueToCode(block, 'LIFETIME', Blockly.JavaScript.ORDER_ATOMIC);
    const icon = Blockly.JavaScript.valueToCode(block, 'ICON', Blockly.JavaScript.ORDER_ATOMIC);
    const text = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
    const cycles = Blockly.JavaScript.valueToCode(block, 'CYCLES', Blockly.JavaScript.ORDER_ATOMIC);

    const objText = [];
    priority && objText.push('priority: "' + priority + '"');
    iconType && objText.push('iconType: "' + iconType + '"');
    sound && objText.push('sound: "' + sound + '"');

    lifeTime && objText.push('lifeTime: parseInt(' + lifeTime + ')');
    icon && objText.push('icon: ' + icon);
    text && objText.push('text: ' + text);
    cycles && objText.push('cycles: parseInt(' + cycles + ')');

    return `sendTo('lametric${block.getFieldValue('INSTANCE')}', 'notification', { ${objText.join(', ')} }, (res) => { if (res && res.error) { console.error(res.error); } });`;
};
