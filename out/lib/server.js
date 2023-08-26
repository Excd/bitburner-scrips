/**
 * Return an array of servers.
 * @remarks
 * RAM cost: 0.2 GB
 *
 * Recursively scans servers up to the specified depth. Search term is case sensitive.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} [hostname=home] - Optional. Hostname of server to scan. (Default: home)
 * @param {number} [depth=1] - Optional. Depth of scan. (Default: 1)
 * @param {string} [term] - Optional. Search term for server names.
 * @returns {string[]} Array of servers.
 *
 * @todo Improve search speed of large depth values.
 */
export function get_servers(ns, hostname = 'home', depth = 1, term = '') {
  const servers = ns.scan(hostname);

  if (depth > 1)
    servers.forEach((server) =>
      servers.push(
        ...get_servers(ns, server, depth - 1, term).filter(
          (server) => !servers.includes(server) && server !== hostname
        )
      )
    );

  return servers.filter((server) => server.includes(term));
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
  return get_servers(ns, 'home', 1, term);
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
  ns.tprint(`INFO: ${hostname} purchased for \$${ns.getPurchasedServerCost(ram)}.`);
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
  ns.tprint(result ? `INFO: ${hostname} deleted.` : `ERROR! ${hostname} could not be deleted.`);
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
 * @returns {boolean} True if successful, false otherwise.
 */
export function rename_server(ns, hostname, newName) {
  const result = ns.renamePurchasedServer(hostname, newName);
  ns.tprint(
    result ? `INFO: ${hostname} renamed to ${newName}.` : `ERROR! ${hostname} could not be renamed.`
  );
  return result;
}

/**
 * Upgrade a server's RAM.
 * @remarks
 * RAM cost: 0.3 GB
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
      ? `INFO: ${hostname} upgraded to ${ram}GB RAM for \$${
          ns.getPurchasedServerCost(ram) - oldRam
        }.`
      : `ERROR! ${hostname} could not be upgraded.`
  );
  return result;
}
