import { max_threads } from 'lib/std';
import { get_purchased_servers, get_servers } from 'lib/server';
import { deploy_hack } from 'lib/hacking';

/**
 * Deploy a hack script to purchased or nearby servers up to a specified search depth.
 * @remarks
 * RAM cost: 3.9 GB
 *
 * Hack script runs with maximum possible threads. Target hostname determined automatically if
 * not specified.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export async function main(ns) {
  const flags = ns.flags([
    ['help', false],
    ['p', false],
  ]);

  if (flags.help) {
    ns.tprint(
      'INFO: Deploy a hack script to purchased or nearby servers up to a specified search depth.' +
        ' Hack script runs with maximum possible threads. Target hostname determined' +
        ' automatically if not specified.' +
        `\n[Usage   /]> run ${ns.getScriptName()} <depth> <hostname> <-p>` +
        `\n[Example /]> run ${ns.getScriptName()} -p`
    );
    return;
  }

  // Arguments.
  const depth = ns.args[0] || 1;
  const hostname = ns.args[1] || '';
  // Constants.
  const script = 'script/hack.js';
  const servers = flags.p ? get_purchased_servers() : get_servers(ns, 'home', depth);

  // Deploy hack.
  servers.forEach((server) => {
    const threads = max_threads(
      ns.getServerMaxRam(server) - ns.getServerUsedRam(server),
      ns.getScriptRam(script)
    );

    if (threads > 0) deploy_hack(ns, script, server, hostname, threads);
  });
}
