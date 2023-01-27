//	Import functions from helper library.
import { getPserv, getBestTarget, getMaxThreads } from "lib-helper.js";

/** 
 * A script to automatically execute hack scripts on purchased servers with free RAM targeting an automatically determined server and thread count.
 * 
 * @author excd
 * @param {NS} ns Netscript environment.
**/
export async function main(ns) {
	//	Help flag message.
	if (ns.flags([["help", false]]).help) {
		ns.tprint("This script automatically executes a hack script on purchased servers with free RAM targeting an" +
			"automatically determined server and thread count.");
		ns.tprint("MAXTARGETS is an optional paramater to limit the number of script instances allowed to target one server. Default = 1.");
		ns.tprint("SERVERID is an optional parameter to specify a name scheme for purchased servers. Default = 'pserv'.");
		ns.tprint(`Usage: run ${ns.getScriptName()} SCRIPT MAXTARGETS SERVERID`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} hack-simple.js 1 pserv`);
		return;
	}

	const script = ns.args[0];										//	Specified hack script name.
	const maxTargets = (ns.args[1] == null) ? 1 : ns.args[1];		//	Optional maximum instances of one script allowed to target one server. Default = 1.
	const pservID = (ns.args[2] == null) ? "pserv" : ns.args[2];	//	Optional server ID. Default = 'pserv'.
	const pservList = await getPserv(ns.scan("home"), pservID);		//	Get purchased server list.

	//	Iterate through purchased server list.
	for (const pserv of pservList) {
		await ns.scp(script, pserv);								//	Copy hack script to purchased server.
		const target = await getBestTarget(ns, script, maxTargets);	//	Determine best target for hack script.

		//	Get maximum usable thread count for hack script.
		const threads = await getMaxThreads(ns.getServerMaxRam(pserv) - ns.getServerUsedRam(pserv), ns.getScriptRam(script));

		if (threads <= 0) continue;					//	Skip to next loop iteration if there is not enough avaiable RAM.

		ns.exec(script, pserv, threads, target);	//	Execute hack script on purchased server with thread amount and target server hostname.

		//	Print confirmation message to terminal.
		ns.tprint(`${pserv} executed ${script} on ${target} with ${threads} threads.`);
	}

	ns.tprint("Operation completed.");
}