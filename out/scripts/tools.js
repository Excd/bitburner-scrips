/**
 * Main method. Allows direct terminal usage of some library functions.
 * @author excd
 * @remarks RAM cost: 1.8GB
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export function main(ns) {
  // Help message.
  if (ns.flags([['help', false]]).help) {
    ns.tprint(
      '' +
        `\nScript Usage: > run ${ns.getScriptName()} {command} <arg1 arg2...>` +
        `\n     Example: > run ${ns.getScriptName()} getServers server-term`
    );
    return;
  }

  // Arguments.
  const command = ns.args[0];
  const args = ns.args.slice(1);

  // Execute command.
  switch (command) {
    case 'getServers':
      ns.tprint(lib.getServers(ns.scan('home'), ...args).join('\n'));
      break;
    case 'getPurchasedServers':
      ns.tprint(nslib._getPurchasedServers(ns).join('\n'));
      break;
    default:
      ns.tprint(`ERROR! Invalid command: ${command}`);
      break;
  }
}

// Standard library functions.
export const lib = {
  /**
   * Returns an array of servers.
   * @author excd
   * @remarks RAM cost: 0GB
   * @param {string[]} serverList - List of scanned servers to select from.
   * @param {string} term - Optional search term for server names.
   * @returns {string[]} Array of servers.
   */
  getServers: function (serverList, term = '') {
    return serverList.filter((server) => server.includes(term));
  },
};

// Alternative netscript functions.
export const nslib = {
  /**
   * Returns an array of purchased servers. Cheaper alternative to ns.getPurchasedServers().
   * @author excd
   * @remarks RAM cost: 0.2GB
   * @param {import('@ns').NS} ns - Netscript environment.
   * @returns {string[]} Array of purchased servers.
   */
  _getPurchasedServers: function (ns) {
    return lib.getServers(ns.scan('home'), 'pserv');
  },
};
