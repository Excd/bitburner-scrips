import { max_threads } from 'lib/std';
import { get_purchased_servers, buy_server } from 'lib/server';
import { deploy_hack } from 'lib/hacking';

/**
 * Automatically purchase servers and optionally run hack scripts.
 * @remarks
 * RAM cost: 6.45 GB
 *
 * Optionally executes a hack script with maximum possible threads. Target hostname
 * determined automatically if not specified.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export async function main(ns) {
  // Get flags.
  const flags = ns.flags([
    ['help', false],
    ['deploy', false],
  ]);

  // Help message.
  if (flags.help) {
    ns.tprint(
      'INFO: Purchases servers automatically with the specified amount of RAM (in gigabytes).' +
        ' Optionally executes a hack script with maximum possible threads. Target hostname' +
        ' determined automatically if not specified.' +
        `\n[Usage   /]> run ${ns.getScriptName()} <--deploy> {ram} <hostname>` +
        `\n[Example /]> run ${ns.getScriptName()} --deploy 8 n00dles`
    );
    return;
  }

  // Arguments.
  const ram = ns.args[flags.deploy ? 1 : 0];
  let target = ns.args[2];
  // Constants.
  const script = 'script/hack.js';
  const limit = ns.getPurchasedServerLimit();
  const price = ns.getPurchasedServerCost(ram);

  // Attempt to purchase servers until limit reached.
  for (let i = get_purchased_servers(ns).length; i < limit; ) {
    // Check if sufficient funds are available.
    if (ns.getServerMoneyAvailable('home') >= price) {
      try {
        // Purchase server and create hostname.
        const hostname = buy_server(ns, `pserv-${i}-${ram}GB`, ram);

        // Deploy hack if specified.
        if (flags.deploy)
          deploy_hack(ns, script, hostname, target, max_threads(ram, ns.getScriptRam(script)));
      } catch (e) {
        ns.tprint(`ERROR! Script terminated prematurely.\n${e}`);
        return;
      }

      i++; //	Increment on successful purchase.
    } else {
      await ns.sleep(3000);
    }
  }

  ns.tprint(`INFO: Server limit reached (${limit}). Script terminated.`);
}
