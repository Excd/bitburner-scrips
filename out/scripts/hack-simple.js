/**
 * A basic hacking script.
 * @author excd
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
  const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
  const securityThreshold = ns.getServerMinSecurityLevel(target) + 5;

  // Open ports if possible.
  if (ns.fileExists('BruteSSH.exe', 'home')) ns.brutessh(target);
  if (ns.fileExists('FTPCrack.exe', 'home')) ns.ftpcrack(target);
  if (ns.fileExists('relaySMTP.exe', 'home')) ns.relaysmtp(target);
  if (ns.fileExists('HTTPWorm.exe', 'home')) ns.httpworm(target);
  if (ns.fileExists('SQLInject.exe', 'home')) ns.sqlinject(target);

  // Gain root access.
  if (ns.fileExists('NUKE.exe', 'home')) ns.nuke(target);

  // Hack loop.
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThreshold)
      await ns.weaken(target);
    else if (ns.getServerMoneyAvailable(target) < moneyThreshold)
      await ns.grow(target);
    else await ns.hack(target);
  }
}
