import { get_target } from 'lib/server';
import { push_port_array_element, delete_port_array_element } from 'lib/port';
import { open_ports } from 'lib/hacking';

/**
 * Basic hack.
 * @remarks
 * RAM cost: 3.15 GB
 *
 * Automatically determines target hostname if not specified.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export async function main(ns) {
  // Help message.
  if (ns.flags([['help', false]]).help) {
    ns.tprint(
      'INFO: Weakens or grows the target server automatically at predetermined thresholds.' +
        ' Hostname determined automatically if not specified.' +
        `\n[Usage   /]> run ${ns.getScriptName()} <hostname> <-t threads>` +
        `\n[Example /]> run ${ns.getScriptName()} n00dles -t 3`
    );
    return;
  }

  // Arguments.
  const target = ns.args[0] == null ? get_target(ns, 4) : ns.args[0];
  // Constants.
  const portNumber = 1;
  const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
  const securityThreshold = ns.getServerMinSecurityLevel(target) + 5;

  // Push target to port array and register atExit handler.
  ns.tprint(`INFO: Targeting ${target}.`);
  push_port_array_element(ns, portNumber, target);
  ns.atExit(() => {
    delete_port_array_element(ns, portNumber, target);
    ns.tprint(`INFO: Hack script targeting ${target} terminated.`);
  });

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
