'use strict';

goog.provide('Blockly.JavaScript.Sendto');
goog.require('Blockly.JavaScript');

/// --- SendTo lametric --------------------------------------------------
Blockly.Words['lametric'] = {'en': 'LaMetric', 'de': 'LaMetric'};
Blockly.Words['lametric_icon'] = {'en': 'icon', 'de': 'Icon'};
Blockly.Words['lametric_icontype'] = {'en': 'icon type', 'de': 'Icon-Typ'};
Blockly.Words['lametric_lifetime'] = {'en': 'life time', 'de': 'Lebenszeit'};
Blockly.Words['lametric_message'] = {'en': 'message', 'de': 'Meldung'};
Blockly.Words['lametric_sound'] = {'en': 'sound', 'de': 'Ton'};
Blockly.Words['lametric_priority'] = {'en': 'priority', 'de': 'Priorität'};
Blockly.Words['lametric_cycles'] = {'en': 'cycles', 'de': 'Wiederholungen'};

Blockly.Words['lametric_priority_none'] = {'en': 'none', 'de': 'Ohne'};
Blockly.Words['lametric_priority_info'] = {'en': 'info', 'de': 'Info'};
Blockly.Words['lametric_priority_warning'] = {'en': 'warning', 'de': 'Warnung'};
Blockly.Words['lametric_priority_critical'] = {'en': 'critical', 'de': 'Kritisch'};

Blockly.Words['lametric_sound_none'] = {'en': 'none', 'de': 'Ohne'};
Blockly.Words['lametric_sound_bicycle'] = {'en': 'bicycle', 'de': 'Fahrrad'};
Blockly.Words['lametric_sound_car'] = {'en': 'car', 'de': 'Auto'};
Blockly.Words['lametric_sound_cash'] = {'en': 'cash', 'de': 'Bar'};
Blockly.Words['lametric_sound_cat'] = {'en': 'cat', 'de': 'Katze'};
Blockly.Words['lametric_sound_dog'] = {'en': 'dog', 'de': 'Hund'};
Blockly.Words['lametric_sound_dog2'] = {'en': 'dog2', 'de': 'Hund 2'};
Blockly.Words['lametric_sound_energy'] = {'en': 'energy', 'de': 'Energie'};
Blockly.Words['lametric_sound_knock_knock'] = {'en': 'knock-knock', 'de': 'Klopfen'};
Blockly.Words['lametric_sound_letter_email'] = {'en': 'letter_email', 'de': 'Email'};
Blockly.Words['lametric_sound_lose1'] = {'en': 'lose1', 'de': 'lose1'};
Blockly.Words['lametric_sound_lose2'] = {'en': 'lose2', 'de': 'lose2'};
Blockly.Words['lametric_sound_negative1'] = {'en': 'negative1', 'de': 'Negativ 1'};
Blockly.Words['lametric_sound_negative2'] = {'en': 'negative2', 'de': 'Negativ 2'};
Blockly.Words['lametric_sound_negative3'] = {'en': 'negative3', 'de': 'Negativ 3'};
Blockly.Words['lametric_sound_negative4'] = {'en': 'negative4', 'de': 'Negativ 4'};
Blockly.Words['lametric_sound_negative5'] = {'en': 'negative5', 'de': 'Negativ 5'};
Blockly.Words['lametric_sound_notification'] = {'en': 'notification', 'de': 'Benachrichtigung 1'};
Blockly.Words['lametric_sound_notification2'] = {'en': 'notification2', 'de': 'Benachrichtigung 2'};
Blockly.Words['lametric_sound_notification3'] = {'en': 'notification3', 'de': 'Benachrichtigung 3'};
Blockly.Words['lametric_sound_notification4'] = {'en': 'notification4', 'de': 'Benachrichtigung 4'};
Blockly.Words['lametric_sound_open_door'] = {'en': 'open_door', 'de': 'Tür'};
Blockly.Words['lametric_sound_positive1'] = {'en': 'positive1', 'de': 'Positiv 1'};
Blockly.Words['lametric_sound_positive2'] = {'en': 'positive2', 'de': 'Positiv 2'};
Blockly.Words['lametric_sound_positive3'] = {'en': 'positive3', 'de': 'Positiv 3'};
Blockly.Words['lametric_sound_positive4'] = {'en': 'positive4', 'de': 'Positiv 4'};
Blockly.Words['lametric_sound_positive5'] = {'en': 'positive5', 'de': 'Positiv 5'};
Blockly.Words['lametric_sound_positive6'] = {'en': 'positive6', 'de': 'Positiv 6'};
Blockly.Words['lametric_sound_statistic'] = {'en': 'statistic', 'de': 'Statistik'};
Blockly.Words['lametric_sound_thunder'] = {'en': 'thunder', 'de': 'Gewitter'};
Blockly.Words['lametric_sound_water1'] = {'en': 'water1', 'de': 'Wasser 1'};
Blockly.Words['lametric_sound_water2'] = {'en': 'water2', 'de': 'Wasser 2'};
Blockly.Words['lametric_sound_win'] = {'en': 'win', 'de': 'Gewinn 1'};
Blockly.Words['lametric_sound_win2'] = {'en': 'win2', 'de': 'Gewinn 2'};
Blockly.Words['lametric_sound_wind'] = {'en': 'wind', 'de': 'Wind'};
Blockly.Words['lametric_sound_wind_short'] = {'en': 'wind_short', 'de': 'Wind kurz'};
Blockly.Words['lametric_sound_alarm1'] = {'en': 'alarm1', 'de': 'Alarm 1'};
Blockly.Words['lametric_sound_alarm2'] = {'en': 'alarm2', 'de': 'Alarm 2'};
Blockly.Words['lametric_sound_alarm3'] = {'en': 'alarm3', 'de': 'Alarm 3'};
Blockly.Words['lametric_sound_alarm4'] = {'en': 'alarm4', 'de': 'Alarm 4'};
Blockly.Words['lametric_sound_alarm5'] = {'en': 'alarm5', 'de': 'Alarm 5'};
Blockly.Words['lametric_sound_alarm6'] = {'en': 'alarm6', 'de': 'Alarm 6'};
Blockly.Words['lametric_sound_alarm7'] = {'en': 'alarm7', 'de': 'Alarm 7'};
Blockly.Words['lametric_sound_alarm8'] = {'en': 'alarm8', 'de': 'Alarm 8'};
Blockly.Words['lametric_sound_alarm9'] = {'en': 'alarm9', 'de': 'Alarm 9'};
Blockly.Words['lametric_sound_alarm10'] = {'en': 'alarm10', 'de': 'Alarm 10'};
Blockly.Words['lametric_sound_alarm11'] = {'en': 'alarm11', 'de': 'Alarm 11'};
Blockly.Words['lametric_sound_alarm12'] = {'en': 'alarm12', 'de': 'Alarm 12'};
Blockly.Words['lametric_sound_alarm13'] = {'en': 'alarm13', 'de': 'Alarm 13'};

Blockly.Words['lametric_icon_none'] = {'en': 'none', 'de': 'Ohne'};
Blockly.Words['lametric_icon_info'] = {'en': 'info', 'de': 'Information'};
Blockly.Words['lametric_icon_alert'] = {'en': 'alert', 'de': 'Alarm'};

Blockly.Words['lametric_anyInstance'] = {'en': 'all instances', 'de': 'Alle Instanzen'};
Blockly.Words['lametric_tooltip'] = {'en': 'Send notification to LaMetric', 'de': 'Sende eine Benachrichtigung zur LaMetric'};
Blockly.Words['lametric_help'] = {'en': 'https://github.com/klein0r/ioBroker.lametric/blob/master/README.md', 'de': 'https://github.com/klein0r/ioBroker.lametric/blob/master/README.md'};

Blockly.Sendto.blocks['lametric'] =
    '<block type="lametric">'
    + '     <value name="INSTANCE">'
    + '     </value>'
    + '     <value name="MESSAGE">'
    + '         <shadow type="text">'
    + '             <field name="TEXT">Example Text</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="SOUND">'
    + '     </value>'
    + '     <value name="PRIORITY">'
    + '     </value>'
    + '     <value name="ICON">'
    + '         <shadow type="text">'
    + '             <field name="TEXT">i31820</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="ICON_TYPE">'
    + '     </value>'
    + '     <value name="LIFETIME">'
    + '         <shadow type="math_number">'
    + '             <field name="NUM">1000</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="CYCLES">'
    + '         <shadow type="math_number">'
    + '             <field name="NUM">1</field>'
    + '         </shadow>'
    + '     </value>'
    + '</block>';

Blockly.Blocks['lametric'] = {
    init: function() {
        this.appendDummyInput('INSTANCE')
            .appendField(Blockly.Words['lametric'][systemLang])
            .appendField(new Blockly.FieldDropdown(
                [
                    [Blockly.Words['lametric_anyInstance'][systemLang], ""],
                    ["lametric.0", ".0"],
                    ["lametric.1", ".1"],
                    ["lametric.2", ".2"],
                    ["lametric.3", ".3"],
                    ["lametric.4", ".4"]
                ]
            ), "INSTANCE");

        this.appendValueInput('MESSAGE')
            .appendField(Blockly.Words['lametric_message'][systemLang]);

        this.appendDummyInput('SOUND')
            .appendField(Blockly.Words['lametric_sound'][systemLang])
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Words['lametric_sound_none'][systemLang], ""],
                [Blockly.Words['lametric_sound_bicycle'][systemLang], "bicycle"],
                [Blockly.Words['lametric_sound_car'][systemLang], "car"],
                [Blockly.Words['lametric_sound_cash'][systemLang], "cash"],
                [Blockly.Words['lametric_sound_cat'][systemLang], "cat"],
                [Blockly.Words['lametric_sound_dog'][systemLang], "dog"],
                [Blockly.Words['lametric_sound_dog2'][systemLang], "dog2"],
                [Blockly.Words['lametric_sound_energy'][systemLang], "energy"],
                [Blockly.Words['lametric_sound_knock_knock'][systemLang], "knock-knock"],
                [Blockly.Words['lametric_sound_letter_email'][systemLang], "letter_email"],
                [Blockly.Words['lametric_sound_lose1'][systemLang], "lose1"],
                [Blockly.Words['lametric_sound_lose2'][systemLang], "lose2"],
                [Blockly.Words['lametric_sound_negative1'][systemLang], "negative1"],
                [Blockly.Words['lametric_sound_negative2'][systemLang], "negative2"],
                [Blockly.Words['lametric_sound_negative3'][systemLang], "negative3"],
                [Blockly.Words['lametric_sound_negative4'][systemLang], "negative4"],
                [Blockly.Words['lametric_sound_negative5'][systemLang], "negative5"],
                [Blockly.Words['lametric_sound_notification'][systemLang], "notification"],
                [Blockly.Words['lametric_sound_notification2'][systemLang], "notification2"],
                [Blockly.Words['lametric_sound_notification3'][systemLang], "notification3"],
                [Blockly.Words['lametric_sound_notification4'][systemLang], "notification4"],
                [Blockly.Words['lametric_sound_open_door'][systemLang], "open_door"],
                [Blockly.Words['lametric_sound_positive1'][systemLang], "positive1"],
                [Blockly.Words['lametric_sound_positive2'][systemLang], "positive2"],
                [Blockly.Words['lametric_sound_positive3'][systemLang], "positive3"],
                [Blockly.Words['lametric_sound_positive4'][systemLang], "positive4"],
                [Blockly.Words['lametric_sound_positive5'][systemLang], "positive5"],
                [Blockly.Words['lametric_sound_positive6'][systemLang], "positive6"],
                [Blockly.Words['lametric_sound_statistic'][systemLang], "statistic"],
                [Blockly.Words['lametric_sound_thunder'][systemLang], "thunder"],
                [Blockly.Words['lametric_sound_water1'][systemLang], "water1"],
                [Blockly.Words['lametric_sound_water2'][systemLang], "water2"],
                [Blockly.Words['lametric_sound_win'][systemLang], "win"],
                [Blockly.Words['lametric_sound_win2'][systemLang], "win2"],
                [Blockly.Words['lametric_sound_wind'][systemLang], "wind"],
                [Blockly.Words['lametric_sound_wind_short'][systemLang], "wind_short"],

                [Blockly.Words['lametric_sound_alarm1'][systemLang], "alarm1"],
                [Blockly.Words['lametric_sound_alarm2'][systemLang], "alarm2"],
                [Blockly.Words['lametric_sound_alarm3'][systemLang], "alarm3"],
                [Blockly.Words['lametric_sound_alarm4'][systemLang], "alarm4"],
                [Blockly.Words['lametric_sound_alarm5'][systemLang], "alarm5"],
                [Blockly.Words['lametric_sound_alarm6'][systemLang], "alarm6"],
                [Blockly.Words['lametric_sound_alarm7'][systemLang], "alarm7"],
                [Blockly.Words['lametric_sound_alarm8'][systemLang], "alarm8"],
                [Blockly.Words['lametric_sound_alarm9'][systemLang], "alarm9"],
                [Blockly.Words['lametric_sound_alarm10'][systemLang], "alarm10"],
                [Blockly.Words['lametric_sound_alarm11'][systemLang], "alarm11"],
                [Blockly.Words['lametric_sound_alarm12'][systemLang], "alarm12"],
                [Blockly.Words['lametric_sound_alarm13'][systemLang], "alarm13"],
            ]), 'SOUND');

        this.appendDummyInput('PRIORITY')
            .appendField(Blockly.Words['lametric_priority'][systemLang])
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Words['lametric_priority_none'][systemLang], ""],
                [Blockly.Words['lametric_priority_info'][systemLang], "info"],
                [Blockly.Words['lametric_priority_warning'][systemLang], "warning"],
                [Blockly.Words['lametric_priority_critical'][systemLang], "critical"]
            ]), 'PRIORITY');

        this.appendValueInput('ICON')
            .appendField(Blockly.Words['lametric_icon'][systemLang]);

        this.appendDummyInput('ICON_TYPE')
            .appendField(Blockly.Words['lametric_icontype'][systemLang])
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Words['lametric_icon_none'][systemLang], ""],
                [Blockly.Words['lametric_icon_info'][systemLang], "info"],
                [Blockly.Words['lametric_icon_alert'][systemLang], "alert"]
            ]), 'ICON_TYPE');

        this.appendValueInput('LIFETIME')
            .appendField(Blockly.Words['lametric_lifetime'][systemLang]);

        this.appendValueInput('CYCLES')
            .appendField(Blockly.Words['lametric_cycles'][systemLang]);

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Words['lametric_tooltip'][systemLang]);
        this.setHelpUrl(Blockly.Words['lametric_help'][systemLang]);
    }
};

Blockly.JavaScript['lametric'] = function(block) {

    var priority = block.getFieldValue('PRIORITY');
    var iconType = block.getFieldValue('ICON_TYPE');
    var sound = block.getFieldValue('SOUND');

    var lifeTime = parseInt(Blockly.JavaScript.valueToCode(block, 'LIFETIME', Blockly.JavaScript.ORDER_ATOMIC));
    var icon = Blockly.JavaScript.valueToCode(block, 'ICON', Blockly.JavaScript.ORDER_ATOMIC);
    var text = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
    var cycles = parseInt(Blockly.JavaScript.valueToCode(block, 'CYCLES', Blockly.JavaScript.ORDER_ATOMIC));

    var objText = [];
    if (priority) objText.push('priority: "' + priority + '"');
    if (iconType) objText.push('iconType: "' + iconType + '"');
    if (sound) objText.push('sound: "' + sound + '"');

    if (lifeTime) objText.push('lifeTime: ' + lifeTime);
    if (icon) objText.push('icon: ' + icon);
    if (text) objText.push('text: ' + text);
    if (cycles) objText.push('cycles: ' + cycles);

    return 'sendTo("lametric' + block.getFieldValue('INSTANCE') + '", "notification", {' + objText.join(',') + '});';
};
