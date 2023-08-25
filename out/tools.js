/**
 * Interpret arguments as library function calls.
 * @remarks
 * RAM cost: 2.4 GB
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
   * Return the maximum possible threads given a script RAM requirement and available server RAM.
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

/**
 * Return the first element of specified port data as an array.
 * @remarks
 * RAM cost: 0 GB
 *
 * Element is not removed from the port. Array data must be space delimited.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @returns {string[]} Port data array.
 */
export function peek_port_array(ns, portNumber) {
  return ns.peek(portNumber).trim().replace('NULL PORT DATA', '').split(' ');
}

/**
 * Return the first element of specified port as an array and remove it.
 * @remarks
 * RAM cost: 0 GB
 *
 * Element is removed from the port. Array data must be space delimited.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @returns {string[]} Port data array.
 */
export function read_port_array(ns, portNumber) {
  return ns.readPort(portNumber).trim().replace('NULL PORT DATA', '').split(' ');
}

/**
 * Write an array to the specified port.
 * @remarks
 * RAM cost: 0 GB
 *
 * Array data must be space delimited.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @param {string[]} array - Array to write.
 */
export function write_port_array(ns, portNumber, array) {
  ns.writePort(portNumber, array.join(' ').trim(), 'w');
}

/**
 * Push an element to the end of the specified port array.
 * @remarks
 * RAM cost: 0 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @param {string} element - Element to push.
 */
export function push_port_array_element(ns, portNumber, element) {
  const array = read_port_array(ns, portNumber);
  array.push(element);
  write_port_array(ns, portNumber, array);
}

/**
 * Delete an element from the specified port array.
 * @remarks
 * RAM cost: 0 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @param {string} element - Element to delete.
 */
export function delete_port_array_element(ns, portNumber, element) {
  write_port_array(
    ns,
    portNumber,
    read_port_array(ns, portNumber).filter((x) => x !== element)
  );
}

/**
 * Clear the specified port array.
 * @remarks
 * RAM cost: 0 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 */
export function clear_port_array(ns, portNumber) {
  ns.readPort(portNumber);
}
