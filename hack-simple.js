/** 
 * A basic hacking script, based on bitburner docs example.
 * 
 * @author excd
 * @param {NS} ns Netscript environment.
**/
export async function main(ns) {
	//	Help flag message.
	if (ns.flags([["help", false]]).help) {
		ns.tprint("This is a simple hacking script which will weaken or grow a server automatically at predefined thresholds.");
		ns.tprint(`Usage: run ${ns.getScriptName()} HOSTNAME`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} n00dles`);
		return;
	}

	const target = ns.args[0];									//	Target server hostname.
	const moneyThresh = ns.getServerMaxMoney(target) * 0.75;	//	Money threshold is 75% of target's maximum money.
	const secThresh = ns.getServerMinSecurityLevel(target) + 5;	//	Security threshold is 5 greater than target's minimum security level.

	//	Execute port opening programs if available.
	if (ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(target);
	if (ns.fileExists("FTPCrack.exe", "home")) ns.ftpcrack(target);
	if (ns.fileExists("relaySMTP.exe", "home")) ns.relaysmtp(target);
	if (ns.fileExists("HTTPWorm.exe", "home")) ns.httpworm(target);
	if (ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(target);

	//	Execute nuke to gain root access.
	ns.nuke(target);

	//	Hack loop.
	while (true) {
		if (ns.getServerSecurityLevel(target) > secThresh) {
			await ns.weaken(target);	//	Weaken if target's security level is greater than secThresh.
		}
		else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			await ns.grow(target);		//	Grow if target's available money is less than moneyThresh.
		}
		else {
			await ns.hack(target);		//	Hack if within money and security thresholds.
		}
	}
}