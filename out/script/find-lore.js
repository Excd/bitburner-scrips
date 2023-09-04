import { get_lore, get_servers } from 'lib/server';

/**
 * Copy lore from all servers.
 * @remarks
 * RAM cost: 2.6 GB
 *
 * Automatically excludes purchased servers from search.
 * Optionally exclude servers with a specified term instead.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export async function main(ns) {
  const flags = ns.flags([
    ['help', false],
    ['term', 'pserv'],
  ]);

  if (flags.help) {
    ns.tprint(
      'INFO: Copy lore from all servers. Excludes purchased servers by default.' +
        ' Optionally exclude servers with a specified term instead.' +
        `\n[Usage   /]> run ${ns.getScriptName()} <--term term>` +
        `\n[Example /]> run ${ns.getScriptName()} --term my-term`
    );
    return;
  }

  get_servers(ns, [], [flags.term]).forEach((server) => get_lore(ns, server));
}
