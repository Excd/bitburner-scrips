import { get_purchased_servers, get_servers, max_threads } from 'lib/server';
import { deploy_hack } from 'lib/hacking';

/**
 * Deploy a hack script to either purchased or nearby servers.
 * @remarks
 * RAM cost: 4.3 GB
 *
 * Hack script runs with maximum possible threads. Target hostname determined automatically.
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
      'INFO: Deploy a hack script to either purchased or nearby servers.' +
        ' Hack script runs with maximum possible threads and determines target automatically.' +
        `\n[Usage   /]> run ${ns.getScriptName()} <-p>` +
        `\n[Example /]> run ${ns.getScriptName()} -p`
    );
    return;
  }

  // Constants.
  const script = 'script/hack.js';
  const servers = flags.p ? get_purchased_servers() : get_servers(ns, [], ['pserv']);

  // Deploy hack.
  servers.forEach((server) => {
    const threads = max_threads(
      ns.getServerMaxRam(server) - ns.getServerUsedRam(server),
      ns.getScriptRam(script)
    );

    if (threads > 0) deploy_hack(ns, script, server, '', threads);
  });
}
