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
 * @param {string} [excludeTerm] - Optional. Exclude servers with this term in their name.
 * @param {string} [searchTerm] - Optional. Search term for server names.
 * @returns {string[]} Array of servers.
 *
 * @todo Improve search speed of large depth values.
 */
export function get_servers(ns, hostname = 'home', depth = 1, excludeTerm = '', searchTerm = '') {
  const servers = ns.scan(hostname);

  if (depth > 1)
    servers.forEach((server) =>
      servers.push(
        ...get_servers(ns, server, depth - 1, excludeTerm, searchTerm).filter(
          (server) => !servers.includes(server) && server !== hostname
        )
      )
    );

  return servers.filter((server) => server.includes(searchTerm) && !server.includes(excludeTerm));
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
  return get_servers(ns, 'home', 1, '', term);
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
