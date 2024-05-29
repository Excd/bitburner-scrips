import { PREFIX, print } from 'lib/utility';

/**
 * Return an array of all nearby servers.
 * @remarks
 * RAM cost: 0.2 GB
 *
 * Optionally search or exclude servers with specified terms in their name.
 * Terms are case sensitive. Home server is always excluded from results.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string[]} [searchTerms] - Optional. Search for servers with these terms in their name.
 * @param {string[]} [excludeTerms] - Optional. Exclude servers with these terms in their name.
 * @returns {string[]} Array of servers.
 */
export function get_servers(ns, searchTerms = [], excludeTerms = []) {
  const servers = [];
  const queue = ['home'];

  while (queue.length) {
    const server = queue.shift();
    const scanned = ns.scan(server);

    scanned.forEach((server) => {
      if (!servers.includes(server) && !queue.includes(server)) queue.push(server);
    });

    if (server !== 'home') servers.push(server);
  }

  return servers.filter(
    (server) =>
      (searchTerms.length ? searchTerms.some((term) => server.includes(term)) : true) &&
      (excludeTerms.length ? !excludeTerms.some((term) => server.includes(term)) : true)
  );
}

/**
 * Return an array of purchased servers.
 * @remarks
 * RAM cost: 0.2 GB
 *
 * Cheaper alternative to ns.getPurchasedServers().
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} [term=pserv] - Optional. Search term for server names. (Default: pserv)
 * @returns {string[]} Array of purchased servers.
 */
export function get_purchased_servers(ns, term = 'pserv') {
  return get_servers(ns, [term]);
}

/**
 * Purchase a server with specified name and RAM.
 * @remarks
 * RAM cost: 2.5 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} name - Server name.
 * @param {number} ram - Server RAM.
 * @returns {string} Hostname of purchased server.
 */
export function buy_server(ns, name, ram) {
  const hostname = ns.purchaseServer(name, ram);
  if (hostname)
    print(ns, `${hostname} purchased for \$${ns.getPurchasedServerCost(ram)}.`, PREFIX.SUCCESS);
  else print(ns, `${name} could not be purchased.`, PREFIX.ERROR);
  return hostname;
}

/**
 * Delete a server.
 * @remarks
 * RAM cost: 2.25 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} hostname - Hostname of server to delete.
 * @returns {boolean} True if successful, false otherwise.
 */
export function delete_server(ns, hostname) {
  const result = ns.deleteServer(hostname);
  if (result) print(ns, `${hostname} deleted.`, PREFIX.SUCCESS);
  else print(ns, `${hostname} could not be deleted.`, PREFIX.ERROR);
  return result;
}

/**
 * Rename a server.
 * @remarks
 * RAM cost: 0 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} hostname - Hostname of server to rename.
 * @param {string} newName - New hostname.
 * @returns {string} New hostname.
 */
export function rename_server(ns, hostname, newName) {
  if (ns.renamePurchasedServer(hostname, newName))
    print(ns, `${hostname} renamed to ${newName}.`, PREFIX.SUCCESS);
  else print(ns, `${hostname} could not be renamed.`, PREFIX.ERROR);
  return newName;
}

/**
 * Upgrade a server's RAM.
 * @remarks
 * RAM cost: 0.55 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} hostname - Hostname of server to upgrade.
 * @param {number} ram - New RAM.
 * @returns {boolean} True if successful, false otherwise.
 */
export function upgrade_server(ns, hostname, ram) {
  const oldRam = ns.getServerMaxRam(hostname);
  const result = ns.upgradePurchasedServer(hostname, ram);

  if (result)
    print(
      ns,
      `${hostname} upgraded to ${ram}GB RAM for \$${
        ns.getPurchasedServerCost(ram) - ns.getPurchasedServerCost(oldRam)
      }.`,
      PREFIX.SUCCESS
    );
  else print(ns, `${hostname} could not be upgraded.`, PREFIX.ERROR);

  return result;
}

/**
 * Return the maximum possible threads given a script RAM requirement and available server RAM.
 * @remarks
 * RAM cost: 0 GB
 *
 * @param {number} available - Available server RAM.
 * @param {number} required - Script RAM requirement.
 * @returns {number} Maximum usable threads.
 */
export function max_threads(available, required) {
  return Math.floor(available / required);
}

/**
 * Kill all scripts on a server.
 * @remarks
 * RAM cost: 0.5 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} hostname - Hostname of server to kill scripts on.
 */
export function kill_all_scripts(ns, hostname) {
  if (ns.killall(hostname)) print(ns, `All scripts killed on ${hostname}.`, PREFIX.SUCCESS);
  else print(ns, `No scripts killed on ${hostname}.`, PREFIX.WARN);
}

/**
 * Copy lore (.lit files) from a server to home.
 * @remarks
 * RAM cost: 0.8 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} hostname - Hostname of server to copy lore from.
 */
export function get_lore(ns, hostname) {
  const lore = ns.ls(hostname, '.lit');

  if (lore.length)
    lore.forEach((file) => {
      if (ns.scp(file, 'home', hostname))
        print(ns, `${file} copied from ${hostname}.`, PREFIX.SUCCESS);
      else print(ns, `${file} could not be copied from ${hostname}.`, PREFIX.ERROR);
    });
  else print(ns, `No lore found on ${hostname}.`, PREFIX.WARN);
}
