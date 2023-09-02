import { get_lore, get_servers } from 'lib/server';

/**
 * Copy lore from all servers up to an optionally specified search depth.
 * @remarks
 * RAM cost: 2.6 GB
 *
 * Automatically excludes purchased servers. Optionally exclude servers with a specified term
 * instead.
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
      'INFO: Copy lore from all servers up to an optionally specified search depth.' +
        ' Excludes purchased servers by default. Optionally exclude servers with a' +
        ' specified term instead.' +
        `\n[Usage   /]> run ${ns.getScriptName()} <--term term> <depth>` +
        `\n[Example /]> run ${ns.getScriptName()} --term my-term 3`
    );
    return;
  }

  // Arguments.
  const depth = (ns.args.length <= 1 ? ns.args[0] : ns.args[2]) || 1;

  get_servers(ns, 'home', depth, flags.term).forEach((server) => get_lore(ns, server));
}
