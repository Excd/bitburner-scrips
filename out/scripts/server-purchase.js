import { lib, nslib } from 'tools';

/**
 * A simple script to automatically purchase servers and run hack scripts.
 * @remarks RAM cost: 6.55GB
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
      'Automatically purchases servers with the specified amount of RAM (in gigabytes) and' +
        ' optionally executes a hack script with the specified target hostname and max' +
        ' possible threads. Hostname will be determined automatically if not specified.' +
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
  for (let i = nslib._getPurchasedServers(ns).length; i < limit; ) {
    // Wait if funds are insufficient.
    if (ns.getServerMoneyAvailable('home') > price) {
      // Determine target server if not specified.
      if (flags.hack && target == null) {
        let targetMoney = 0;
        nslib._getServers(ns).forEach((server) => {
          if (ns.getServerMoneyAvailable(server) > targetMoney)
            targetMoney = ns.getServerMoneyAvailable((target = server));
        });
      }

      // Purchase server and create hostname.
      try {
        const hostname = ns.purchaseServer(`pserv-${i}-${ram}GB`, ram);
        ns.tprint(`${hostname} purchased for \$${price}.`);

        // Copy and execute hack script.
        if (flags.hack) {
          await ns.scp(script, hostname);
          const threads = lib.maxThreads(ram, ns.getScriptRam(script));
          const pid = ns.exec(script, hostname, threads, target);
          ns.tprint(
            pid
              ? `${script} executed on ${hostname} (pid ${pid}),` +
                  ` targeting ${target} with ${threads} thread(s).`
              : `ERROR! ${script} failed to execute on ${hostname}.`
          );
        }
      } catch (e) {
        ns.tprint(`ERROR! Purchase script terminated prematurely.\n${e}`);
        return;
      }

      i++; //	Increment on successful purchase.
    } else {
      await ns.sleep(3000);
    }
  }

  ns.tprint(`Server limit reached (${limit}). Purchase script terminated.`);
}
