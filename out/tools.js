import * as std from 'lib/std';
import * as server from 'lib/server';
import * as port from 'lib/port';
import * as hacking from 'lib/hacking';

/**
 * Interpret arguments as library function calls.
 * @remarks
 * RAM cost: 2.4 GB
 *
 * Library name flag is required. Function names are not case sensitive.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export function main(ns) {
  // Get flags.
  const flags = ns.flags([
    ['help', false],
    ['std', false],
    ['server', false],
    ['port', false],
    ['hacking', false],
  ]);

  // Help message.
  if (flags.help) {
    ns.tprint(
      'INFO: Allows terminal usage of library functions via arguments. Library name flag' +
        ' is required. Function names are not case sensitive.' +
        `\n[Usage   /]> run ${ns.getScriptName()} {--library} {command} <arg1 arg2...>` +
        `\n[Example /]> run ${ns.getScriptName()} --server get_servers home 2`
    );
    return;
  }

  // Arguments.
  const command = ns.args[1].toLowerCase();
  const args = ns.args.slice(2);

  // Attempt to run command and get result.
  let result;
  try {
    result = resolveCommand(ns, flags, command, ...args);
  } catch (e) {
    ns.tprint(`ERROR! Unable to run command: ${command}\n${e}`);
    return;
  }

  // Print formatted result.
  ns.tprint(`INFO: ${Array.isArray(result) ? `\n${result.join('\n')}` : result}`);
}

/**
 * Resolve library function call.
 * @remarks
 * RAM cost: 0 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {{ [key: string]: import('@ns').ScriptArg | string[] }} flags - Flags object.
 * @param {string} command - Function name.
 * @param {string[]} args - Function arguments.
 * @returns {any} Function result.
 */
function resolveCommand(ns, flags, command, ...args) {
  if (flags.std) return std[command](...args);
  if (flags.server) return server[command](ns, ...args);
  if (flags.port) return port[command](ns, ...args);
  if (flags.hacking) return hacking[command](ns, ...args);
}
