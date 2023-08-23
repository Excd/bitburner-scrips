import { lib, get_purchased_servers } from 'tools';

/**
 * A script to automatically purchase servers and run hack scripts.
 * @remarks RAM cost: 6.55 GB
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export async function main(ns) {
  // Get flags.
  const flags = ns.flags([
    ['help', false],
    ['hack', false],
  ]);

  // Help message.
  if (flags.help) {
    ns.tprint(
      'Purchases servers automatically with the specified amount of RAM (in gigabytes).' +
        ' Optionally executes a hack script with maximum possible threads. Target hostname' +
        ' determined automatically if not specified.' +
        `\nScript Usage: > run ${ns.getScriptName()} <--hack> {ram} <hostname>` +
        `\n     Example: > run ${ns.getScriptName()} --hack 8 n00dles`
    );
    return;
  }

  // Arguments.
  const ram = ns.args[flags.hack ? 1 : 0];
  let target = ns.args[2];
  // Constants.
  const limit = ns.getPurchasedServerLimit();
  const price = ns.getPurchasedServerCost(ram);
  const script = 'scripts/hack.js';

  // Attempt to purchase servers until limit reached.
  for (let i = get_purchased_servers(ns).length; i < limit; ) {
    // Check if sufficient funds are available.
    if (ns.getServerMoneyAvailable('home') >= price) {
      try {
        // Purchase server and create hostname.
        const hostname = ns.purchaseServer(`pserv-${i}-${ram}GB`, ram);
        ns.tprint(`${hostname} purchased for \$${price}.`);

        // Copy and execute hack script if specified.
        if (flags.hack) {
          ns.scp(script, hostname);
          const threads = lib.max_threads(ram, ns.getScriptRam(script));
          const pid = ns.exec(script, hostname, threads, target);
          ns.tprint(
            pid
              ? `${script} executed on ${hostname} with ${threads} thread(s), pid ${pid}.`
              : `ERROR! ${script} failed to execute on ${hostname}.`
          );
        }
      } catch (e) {
        ns.tprint(`ERROR! Script terminated prematurely.\n${e}`);
        return;
      }

      i++; //	Increment on successful purchase.
    } else {
      await ns.sleep(3000);
    }
  }

  ns.tprint(`Server limit reached (${limit}). Script terminated.`);
}
