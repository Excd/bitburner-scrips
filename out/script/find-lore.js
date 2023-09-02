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
  if (ns.flags([['help', false]]).help) {
    ns.tprint(
      'INFO: Copy lore from all servers up to an optionally specified search depth.' +
        ' Automatically excludes purchased servers. Optionally exclude servers with a' +
        ' specified term instead.' +
        `\n[Usage   /]> run ${ns.getScriptName()} <depth> <term>` +
        `\n[Example /]> run ${ns.getScriptName()} 3`
    );
    return;
  }

  // Arguments.
  const depth = ns.args[0] || 1;
  const excludeTerm = ns.args[1] || 'pserv';

  get_servers(ns, 'home', depth, excludeTerm).forEach((server) => get_lore(ns, server));
}
