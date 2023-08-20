export const lib = {
  /** 
   * Returns an array of servers.
   * @author excd
   * @remarks RAM cost: 0GB
   * @param {string[]} serverList - List of scanned servers to select from.
   * @param {string} term - Optional search term for server names.
   * @returns {string[]} Array of servers.
  **/
  getServers: function (serverList, term = '') {
    const servers = new Array();

    serverList.forEach(server => {
      if (server.includes(term))
        servers.push(server)
    });

    return servers;
  }
}

export const nslib = {
  /** 
   * Returns an array of purchased servers. Cheaper alternative to ns.getPurchasedServers().
   * @author excd
   * @remarks RAM cost: 0.2GB
   * @param {NS} ns - Netscript environment.
   * @returns {string[]} Array of purchased servers.
  **/
  _getPurchasedServers: function (ns) {
    return lib.getServers(ns.scan('home'), 'pserv');
  }
}