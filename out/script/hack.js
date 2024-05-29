import { print } from 'lib/utility';
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
    print(
      ns,
      'Weakens or grows the target server automatically at predetermined thresholds.' +
        ' Hostname determined automatically if not specified.' +
        `\n[Usage   /]> run ${ns.getScriptName()} <hostname> <-t threads>` +
        `\n[Example /]> run ${ns.getScriptName()} n00dles -t 3`
    );
    return;
  }

  // Arguments.
  let target = ns.args[0];
  // Constants.
  const portNumber = 1;

  // Attempt to open ports and gain root access.
  if (target) {
    if (!get_root(ns, target)) return;
  } else {
    target = getTarget(ns, portNumber);
  }

  // Push target to port array and register atExit handler.
  print(ns, `Targeting ${target}.`);
  push_port_array_element(ns, portNumber, target);
  ns.atExit(() => {
    delete_port_array_element(ns, portNumber, target);
    print(ns, `Hack script targeting ${target} terminated.`);
  });

  await hack(ns, target);
}

/**
 * Hack target server.
 * @remarks
 * RAM cost: 0.8 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} target - Target server hostname.
 */
async function hack(ns, target) {
  const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
  const securityThreshold = ns.getServerMinSecurityLevel(target) + 5;

  // Hack loop.
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThreshold) await ns.weaken(target);
    else if (ns.getServerMoneyAvailable(target) < moneyThreshold) await ns.grow(target);
    else await ns.hack(target);
  }
}

/**
 * Automatically determine target server.
 * @remarks
 * RAM cost: 0.85 GB
 *
 * Attempts to gain root access on target server.
 * Tries another target if unsuccessful.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @returns {string} Target server hostname.
 */
function getTarget(ns, portNumber) {
  let target = get_target(ns);

  // Attempt to gain root access.
  if (!get_root(ns, target)) {
    // If unable to get root, clear port array and try again.
    print(ns, 'Trying again...');
    clear_port_array(ns, portNumber);
    target = get_target(ns);
    if (!get_root(ns, target)) ns.exit();
  }

  return target;
}
