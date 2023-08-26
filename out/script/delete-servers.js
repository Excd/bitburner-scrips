import { get_purchased_servers, delete_server } from 'lib/server';

/**
 * Delete all purchased servers.
 * @remarks
 * RAM cost: 4.55 GB
 *
 * Optionally kills all running scripts.
 * Server won't be deleted if any scripts are running.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export function main(ns) {
  // Get flags.
  const flags = ns.flags([
    ['help', false],
    ['k', false],
  ]);

  // Help message.
  if (flags.help) {
    ns.tprint(
      'INFO: Deletes all purchased servers and optionally kills all running scripts.' +
        " Server won't be deleted if any scripts are running." +
        `\n[Usage   /]> run ${ns.getScriptName()} <-k>` +
        `\n[Example /]> run ${ns.getScriptName()} -k`
    );
    return;
  }

  get_purchased_servers(ns).forEach((server) => {
    if (flags.k) ns.killall(server);
    delete_server(ns, server);
  });
}