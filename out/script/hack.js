import { push_port_array_element, delete_port_array_element, clear_port_array } from 'lib/port';
import { get_target, get_root } from 'lib/hacking';

/**
 * Basic hack.
 * @remarks
 * RAM cost: 3.15 GB
 *
 * Automatically determines target hostname if not specified.
 * Runs with one thread by default.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export async function main(ns) {
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
  let target = ns.args[0];
  const portNumber = 1;

  // Attempt to open ports and gain root access.
  if (target) {
    if (!get_root(ns, target)) return;
  } else {
    // Automatically determine target.
    target = get_target(ns);
    if (!get_root(ns, target)) {
      // If unable to get root, clear port array and try again.
      ns.tprint('INFO: Trying again...');
      clear_port_array(ns, portNumber);
      target = get_target(ns);
      if (!get_root(ns, target)) return;
    }
  }

  // Push target to port array and register atExit handler.
  ns.tprint(`INFO: Targeting ${target}.`);
  push_port_array_element(ns, portNumber, target);
  ns.atExit(() => {
    delete_port_array_element(ns, portNumber, target);
    ns.tprint(`INFO: Hack script targeting ${target} terminated.`);
  });

  // Thresholds.
  const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
  const securityThreshold = ns.getServerMinSecurityLevel(target) + 5;

  // Hack loop.
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThreshold) await ns.weaken(target);
    else if (ns.getServerMoneyAvailable(target) < moneyThreshold) await ns.grow(target);
    else await ns.hack(target);
  }
}
