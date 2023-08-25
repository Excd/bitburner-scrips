import { peek_port_array, clear_port_array } from 'lib/port';

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
 * Return the server with the most money available that is not already targeted.
 * @remarks
 * RAM cost: 0.45 GB
 *
 * Recursively scans servers up to the specified depth.
 * Attempts to avoid servers already targeted by hack scripts.
 * Only servers with an appropriate hacking level are considered.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} [depth=1] - Optional. Depth of scan. (Default: 1)
 * @returns {string} Server hostname with the most money available.
 */
export function get_target(ns, depth = 1) {
  const portNumber = 1;
  const activeTargets = peek_port_array(ns, portNumber);

  let target = { hostname: '', money: 0 };

  // Search for target.
  get_servers(ns, 'home', depth).forEach((server) => {
    if (
      ns.getServerMoneyAvailable(server) > target.money &&
      !activeTargets.includes(server) &&
      ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() &&
      server !== 'home'
    )
      target = { hostname: server, money: ns.getServerMoneyAvailable(server) };
  });

  // If no valid target found, erase active targets and try again.
  if (target.hostname == '' || target.money == 0) {
    clear_port_array(ns, portNumber);
    const hostname = get_target(ns);
    if (hostname) {
      return hostname;
    } else {
      // If still no valid target found, terminate with error.
      ns.tprint('ERROR! No target found.');
      ns.exit();
    }
  }

  return target.hostname;
}
