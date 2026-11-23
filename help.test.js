'use strict';

const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { describe, it } = require('mocha');
const { expect } = require('chai');
const { COMMANDS, HELP } = require('./lib/help');

/**
 * The commands onMessage of main.js compares obj.command with
 *
 * @returns {string[]} the command names
 */
function commandsOfOnMessage() {
    const source = readFileSync(join(__dirname, 'main.js'), 'utf8');
    const start = source.indexOf('    onMessage(obj) {');
    const end = source.indexOf('    async setApiConnected(');
    expect(start).to.be.greaterThan(0);
    expect(end).to.be.greaterThan(start);
    return [...source.slice(start, end).matchAll(/obj\.command === '([^']+)'/g)].map(m => m[1]);
}

describe('help', () => {
    it('lists exactly the commands onMessage answers, each once', () => {
        const names = COMMANDS.map(c => c.command);
        expect(new Set(names).size).to.equal(names.length);
        expect([...names].sort()).to.deep.equal([...new Set(commandsOfOnMessage())].sort());
    });

    it('names every command in the text and marks the ones that act on the device as writing', () => {
        for (const { command, write } of COMMANDS) {
            if (command !== 'help') {
                expect(HELP, command).to.contain(command);
            }
            expect(write, command).to.equal(!['help', 'getPollingUrl'].includes(command));
        }
    });

    it('keeps the lines short', () => {
        for (const line of HELP.split('\n')) {
            expect(line.length, line).to.be.at.most(120);
        }
    });
});
