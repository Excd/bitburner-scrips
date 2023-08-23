/**
 * Main method. Allows terminal usage of library functions via arguments.
 * @remarks RAM cost: 2.25 GB
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export function main(ns) {
  // Get flags.
  const flags = ns.flags([
    ['help', false],
    ['ns', false],
  ]);

  // Help message.
  if (flags.help) {
    ns.tprint(
      'Allows terminal usage of library functions via arguments (case sensitive). Netscript' +
        ' environment functions require the ns flag (--ns).' +
        `\nScript Usage: > run ${ns.getScriptName()} <--ns> {command} <arg1 arg2...>` +
        `\n     Example: > run ${ns.getScriptName()} --ns get_servers term home`
    );
    return;
  }

  // Arguments.
  const command = ns.args[flags.ns ? 1 : 0].toLowerCase();
  const args = ns.args.slice(flags.ns ? 2 : 1);

  // Attempt to run command and get result.
  let result;
  try {
    result = !flags.ns ? lib[command](...args) : this[command](ns, ...args);
  } catch (e) {
    ns.tprint(`ERROR! Unable to run command: ${command}\n${e}`);
    return;
  }

  // Print formatted result.
  ns.tprint(Array.isArray(result) ? `\n${result.join('\n')}` : result);
}

/**
 * Opens all available ports on the target server.
 * @remarks RAM cost: 0.35 GB
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} target - Target server hostname.
 */
export function open_ports(ns, target) {
  const programs = [
    { name: 'BruteSSH', function: ns.brutessh },
    { name: 'FTPCrack', function: ns.ftpcrack },
    { name: 'relaySMTP', function: ns.relaysmtp },
    { name: 'HTTPWorm', function: ns.httpworm },
    { name: 'SQLInject', function: ns.sqlinject },
  ];

  programs.forEach((program) => {
    if (ns.fileExists(`${program.name}.exe`, 'home')) program.function(target);
  });
}

/**
 * Returns an array of servers.
 * @remarks RAM cost: 0.2 GB
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} [hostname=home] - Optional. Hostname of server to scan. (Default: home)
 * @param {string} [term] - Optional. Search term for server names.
 * @returns {string[]} Array of servers.
 */
export function get_servers(ns, hostname = 'home', term = '') {
  return ns.scan(hostname).filter((server) => server.includes(term));
}

/**
 * Returns an array of purchased servers. Cheaper alternative to ns.getPurchasedServers().
 * @remarks RAM cost: 0.2 GB
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} [term=pserv] - Optional. Search term for server names. (Default: pserv)
 * @returns {string[]} Array of purchased servers.
 */
export function get_purchased_servers(ns, term = 'pserv') {
  return get_servers(ns, 'home', term);
}

/**
 * Returns the server with the most money available.
 * @remarks RAM cost: 0.3 GB
 * @param {import('@ns').NS} ns - Netscript environment.
 * @returns {string} Server hostname with the most money available.
 */
export function get_target(ns) {
  let target = { hostname: '', money: 0 };

  get_servers(ns).forEach((server) => {
    if (ns.getServerMoneyAvailable(server) > target.money)
      target = { hostname: server, money: ns.getServerMoneyAvailable(server) };
  });

  return target.hostname;
}

/**
 * Standard helper function namespace.
 */
export const lib = {
  /**
   * Returns the maximum threads usable by a script given available server RAM and
   * script requirement.
   * @remarks RAM cost: 0 GB
   * @param {number} available - Available server RAM.
   * @param {number} required - Script RAM requirement.
   * @returns {number} Maximum usable threads.
   */
  max_threads: (available, required) => Math.floor(available / required),
};
