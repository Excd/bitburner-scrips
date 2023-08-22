import { nslib } from './tools.js';

/**
 * A simple script to automatically purchase servers and run hack scripts.
 * @author excd
 * @remarks RAM cost: 6.35GB
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export async function main(ns) {
  // Help message.
  if (ns.flags([['help', false]]).help) {
    ns.tprint(
      'Automatically purchases servers with the specified amount of RAM (in gigabytes) and' +
        ' executes a hack script with the specified thread count and target hostname.' +
        `\nScript Usage: > run ${ns.getScriptName()} {ram} {threads} {hostname}` +
        `\n     Example: > run ${ns.getScriptName()} 8 3 n00dles`
    );
    return;
  }

  // Arguments.
  const ram = ns.args[0];
  const threads = ns.args[1];
  const target = ns.args[2];

  // Constants.
  const limit = ns.getPurchasedServerLimit();
  const price = ns.getPurchasedServerCost(ram);
  const script = 'scripts/hack.js';

  // Attempt to purchase servers until limit reached.
  for (let i = nslib._getPurchasedServers(ns).length; i < limit; ) {
    // Purchase server if possible, otherwise wait.
    if (ns.getServerMoneyAvailable('home') > price) {
      try {
        // Purchase server and create hostname.
        const hostname = ns.purchaseServer(`pserv-${i}-${ram}GB`, ram);
        ns.tprint(`${hostname} purchased for \$${price}.`);

        // Copy and execute hack script.
        await ns.scp(script, hostname);
        const pid = ns.exec(script, hostname, threads, target);
        ns.tprint(
          pid
            ? `${script} executed on ${hostname} (pid ${pid}), targeting ${target} with ${threads} thread(s).`
            : `ERROR! ${script} failed to execute on ${hostname}.`
        );
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
