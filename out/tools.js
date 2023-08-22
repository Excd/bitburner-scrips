/**
 * Main method. Allows terminal usage of library functions via arguments.
 * @remarks RAM cost: 1.8GB
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
      'Allows terminal usage of library functions via arguments (case sensitive). Alternative' +
        ' Netscript functions require the ns flag (--ns).' +
        `\nScript Usage: > run ${ns.getScriptName()} <--ns> {command} <arg1 arg2...>` +
        `\n     Example: > run ${ns.getScriptName()} getServers server-term home` +
        `\n     Example: > run ${ns.getScriptName()} --ns getPurchasedServers`
    );
    return;
  }

  // Arguments.
  const command = ns.args[flags.ns ? 1 : 0];
  const args = ns.args.slice(flags.ns ? 2 : 1);

  let result; // Command result.

  // Attempt to run command and get result.
  try {
    result = flags.ns
      ? nslib[`_${command}`](ns, ...args)
      : lib[command](ns, ...args);
  } catch (e) {
    ns.tprint(`ERROR! Unable to run command: ${command}\n${e}`);
    return;
  }

  // Print formatted result.
  ns.tprint(Array.isArray(result) ? `\n${result.join('\n')}` : result);
}

/**
 * Helper functions namespace.
 */
export const lib = {
  /**
   * Returns the maximum threads usable by a script given available server RAM and
   * script requirement.
   * @remarks RAM cost: 0 GB
   * @param {number} available - Available server RAM.
   * @param {number} required - Script RAM requirement.
   * @returns {number} Maximum usable threads.
   **/
  getMaxThreads: function (available, required) {
    return Math.floor(available / required);
  },

  /**
   * Returns an array of servers.
   * @remarks RAM cost: 0.2GB
   * @param {import('@ns').NS} ns - Netscript environment.
   * @param {string} [term] - Optional. Search term for server names.
   * @param {string} [hostname=home] - Optional. Hostname of server to scan.
   * @returns {string[]} Array of servers.
   */
  getServers: function (ns, term = '', hostname = 'home') {
    return ns.scan(hostname).filter((server) => server.includes(term));
  },
};

/**
 * Alternative Netscript functions namespace.
 */
export const nslib = {
  /**
   * Returns an array of purchased servers. Cheaper alternative to ns.getPurchasedServers().
   * @remarks RAM cost: 0GB
   * @param {import('@ns').NS} ns - Netscript environment.
   * @param {string} [term=pserv] - Optional. Search term for server names.
   * @returns {string[]} Array of purchased servers.
   */
  _getPurchasedServers: function (ns, term = 'pserv') {
    return lib.getServers(ns, term);
  },
};