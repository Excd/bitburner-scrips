import { open_ports, get_target } from 'tools';

/**
 * A basic hack script.
 * @remarks RAM cost: 3 GB
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export async function main(ns) {
  // Help message.
  if (ns.flags([['help', false]]).help) {
    ns.tprint(
      'INFO: Simple hack script that weakens or grows the target server automatically at' +
        ' predetermined thresholds. Hostname determined automatically if not specified.' +
        `\nScript Usage: > run ${ns.getScriptName()} {hostname} <-t threads>` +
        `\n     Example: > run ${ns.getScriptName()} n00dles -t 3`
    );
    return;
  }

  // Arguments.
  const target = ns.args[0] == null ? get_target(ns) : ns.args[0];
  // Constants.
  const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
  const securityThreshold = ns.getServerMinSecurityLevel(target) + 5;

  ns.tprint(`INFO: Targeting ${target}.`);

  // Attempt to open ports and gain root access.
  open_ports(ns, target);
  ns.nuke(target);

  // Hack loop.
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThreshold) await ns.weaken(target);
    else if (ns.getServerMoneyAvailable(target) < moneyThreshold) await ns.grow(target);
    else await ns.hack(target);
  }
}
