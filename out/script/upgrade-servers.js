import {
  get_purchased_servers,
  upgrade_server,
  rename_server,
  max_threads,
  kill_all_scripts,
} from 'lib/server';
import { deploy_hack } from 'lib/hacking';

/**
 * Upgrade purchased servers and optionally deploy hack scripts.
 * @remarks
 * RAM cost: 4.95 GB
 *
 * Hack script runs with maximum possible threads. Optionally kills all running scripts.
 * Target hostname determined automatically if not specified.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export function main(ns) {
  const flags = ns.flags([
    ['help', false],
    ['k', false],
    ['deploy', false],
  ]);

  if (flags.help) {
    ns.tprint(
      'INFO: Upgrades all purchased servers to the specified RAM (in gigabytes).' +
        ' Optionally kills all running scripts. Also optionally executes a hack script with' +
        ' maximum possible threads. Target hostname determined automatically if not specified.' +
        `\n[Usage   /]> run ${ns.getScriptName()} {ram} <-k> <--deploy> <hostname>` +
        `\n[Example /]> run ${ns.getScriptName()} 16 -k --deploy n00dles`
    );
    return;
  }

  // Arguments.
  const ram = ns.args[0];
  const target = ns.args[flags.k ? 3 : 2] || '';
  // Constants.
  const script = 'script/hack.js';

  get_purchased_servers(ns).forEach((server) => {
    const oldRam = ns.getServerMaxRam(server);
    const price = ns.getPurchasedServerCost(ram) - ns.getPurchasedServerCost(oldRam);

    if (ns.getServerMoneyAvailable('home') >= price) {
      // Kill all scripts if specified.
      if (flags.k) kill_all_scripts(ns, server);

      // Upgrade server and rename if successful.
      if (upgrade_server(ns, server, ram))
        server = rename_server(ns, server, server.replace(/\d+GB/, `${ram}GB`));

      // Deploy hack if specified.
      if (flags.deploy)
        deploy_hack(
          ns,
          script,
          server,
          target,
          max_threads(flags.k ? ram : ram - oldRam, ns.getScriptRam(script))
        );
    } else {
      ns.tprint(`ERROR! Insufficient funds to upgrade ${server}. \$${price} required.`);
    }
  });
}
