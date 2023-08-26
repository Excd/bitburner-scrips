import { peek_port_array, clear_port_array } from 'lib/port';

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
 * Deploy a hack script to the target server.
 * @remarks
 * RAM cost: 1.9 GB
 *
 * Script and library files must exist in the home directory.
 * If the script is successfully executed, the PID is returned. Otherwise returns 0.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} script - Script filename.
 * @param {string} hostname - Hostname of server to deploy script to.
 * @param {string} target - Hack target server hostname.
 * @param {number} threads - Number of threads to use.
 * @returns {number} PID of the script.
 */
export function deploy_hack(ns, script, hostname, target, threads) {
  const libs = ['lib/port.js', 'lib/hacking.js'];

  ns.scp([script, ...libs], hostname);
  const pid = ns.exec(script, hostname, threads, target);
  ns.tprint(
    pid
      ? `SUCCESS! ${script} executed on ${hostname} with ${threads} thread(s), pid ${pid}.`
      : `ERROR! ${script} failed to execute on ${hostname}.`
  );

  return pid;
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
