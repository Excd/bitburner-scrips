/**
 * Return an array of servers all nearby servers.
 * @remarks
 * RAM cost: 0.2 GB
 *
 * Optionally search or exclude servers with specified terms in their name.
 * Search and exclude terms are case sensitive.
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
  ns.tprint(
    hostname
      ? `SUCCESS! ${hostname} purchased for \$${ns.getPurchasedServerCost(ram)}.`
      : `ERROR! ${name} could not be purchased.`
  );
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
  ns.tprint(result ? `SUCCESS! ${hostname} deleted.` : `ERROR! ${hostname} could not be deleted.`);
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
  ns.tprint(
    ns.renamePurchasedServer(hostname, newName)
      ? `SUCCESS! ${hostname} renamed to ${newName}.`
      : `ERROR! ${hostname} could not be renamed.`
  );
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

  ns.tprint(
    result
      ? `SUCCESS! ${hostname} upgraded to ${ram}GB RAM for \$${
          ns.getPurchasedServerCost(ram) - ns.getPurchasedServerCost(oldRam)
        }.`
      : `ERROR! ${hostname} could not be upgraded.`
  );

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
  ns.tprint(
    ns.killall(hostname)
      ? `SUCCESS! All scripts killed on ${hostname}.`
      : `WARN! No scripts killed on ${hostname}.`
  );
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

  if (lore.length) {
    lore.forEach((file) =>
      ns.tprint(
        ns.scp(file, 'home', hostname)
          ? `SUCCESS! ${file} copied from ${hostname}.`
          : `ERROR! ${file} could not be copied from ${hostname}.`
      )
    );
  } else {
    ns.tprint(`INFO: No lore found on ${hostname}.`);
  }
}
