/**
 * Interpret arguments as library function calls.
 * @remarks
 * RAM cost: 2.25 GB
 *
 * Netscript environment functions require the --ns flag.
 * Function names are not case sensitive.
 *
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
      'INFO: Allows terminal usage of library functions via arguments. Netscript environment' +
        ' functions require the --ns flag. Function names are not case sensitive.' +
        `\n[Usage   /]> run ${ns.getScriptName()} <--ns> {command} <arg1 arg2...>` +
        `\n[Example /]> run ${ns.getScriptName()} --ns get_servers term home`
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
  ns.tprint(`INFO: ${Array.isArray(result) ? `\n${result.join('\n')}` : result}`);
}

/**
 * Helper library.
 * @remarks
 * Functions do not require the Netscript environment. All functions cost zero RAM.
 */
export const lib = {
  /**
   * Return the maximum threads usable by a script given available server RAM and
   * script requirement.
   * @remarks
   * RAM cost: 0 GB
   *
   * @param {number} available - Available server RAM.
   * @param {number} required - Script RAM requirement.
   * @returns {number} Maximum usable threads.
   */
  max_threads: (available, required) => Math.floor(available / required),
};

/**
 * Open all available ports on the target server.
 * @remarks
 * RAM cost: 0.35 GB
 *
 * Port programs must exist in the home directory.
 *
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
 */
export function get_servers(ns, hostname = 'home', depth = 1, term = '') {
  const servers = ns.scan(hostname);

  if (depth > 1)
    servers.forEach((server) =>
      servers.push(
        ...get_servers(ns, server, depth - 1, term).filter((server) => !servers.includes(server))
      )
    );

  return servers.filter((server) => server.includes(term));
}

/**
 * Return an array of purchased servers. Cheaper alternative to ns.getPurchasedServers().
 * @remarks
 * RAM cost: 0.2 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} [term=pserv] - Optional. Search term for server names. (Default: pserv)
 * @returns {string[]} Array of purchased servers.
 */
export function get_purchased_servers(ns, term = 'pserv') {
  return get_servers(ns, 'home', 1, term);
}

/**
 * Return the server with the most money available.
 * @remarks
 * RAM cost: 0.3 GB
 *
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
