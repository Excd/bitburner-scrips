/**
 * A basic hacking script.
 * @remarks RAM cost: 2.8GB
 * @param {import('@ns').NS} ns - Netscript environment.
 */
export async function main(ns) {
  // Help message.
  if (ns.flags([['help', false]]).help) {
    ns.tprint(
      'A simple hacking script which will weaken or grow the target server automatically at' +
        ' predefined thresholds.' +
        `\nScript Usage: > run ${ns.getScriptName()} {hostname} -t {threads}` +
        `\n     Example: > run ${ns.getScriptName()} n00dles -t 3`
    );
    return;
  }

  // Arguments.
  const target = ns.args[0];

  // Constants.
  const programs = [
    { name: 'BruteSSH', function: ns.brutessh },
    { name: 'FTPCrack', function: ns.ftpcrack },
    { name: 'relaySMTP', function: ns.relaysmtp },
    { name: 'HTTPWorm', function: ns.httpworm },
    { name: 'SQLInject', function: ns.sqlinject },
    { name: 'NUKE', function: ns.nuke },
  ];
  const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
  const securityThreshold = ns.getServerMinSecurityLevel(target) + 5;

  // Execute available port programs gain root access.
  programs.forEach((program) => {
    if (ns.fileExists(`${program.name}.exe`, 'home')) program.function(target);
  });

  // Hack loop.
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThreshold)
      await ns.weaken(target);
    else if (ns.getServerMoneyAvailable(target) < moneyThreshold)
      await ns.grow(target);
    else await ns.hack(target);
  }
}
