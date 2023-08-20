//	Import functions from helper library.
import { getPserv, getBestTarget, getMaxThreads } from "lib-helper.js";

/** 
 * A script to purchase additional servers which automatically determines what server to target with a hack script.
 * @todo Combine mutual functionality of pserv-run-script.ns.
 * 
 * @author excd
 * @param {NS} ns Netscript environment.
**/
export async function main(ns) {
	//	Help flag message.
	if (ns.flags([["help", false]]).help) {
		ns.tprint("This script automatically purchases servers with a specified amount of RAM in GB and executes a " + 
			"hack script on an automatically determined server and thread count.");
		ns.tprint("MAXTARGETS is an optional paramater to limit the number of script instances allowed to target one server. Default = 1.");
		ns.tprint("SERVERID is an optional parameter to specify a name scheme for purchased servers. Default = 'pserv'.");
		ns.tprint(`Usage: run ${ns.getScriptName()} RAM SCRIPT MAXTARGETS SERVERID`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} 8 hack-simple.js 1 myserver`);
		return;
	}

	const ram = ns.args[0];											//	Desired amount of RAM in GB for each server.
	const script = ns.args[1];										//	Specified hack script name.
	const maxTargets = (ns.args[2] == null) ? 1 : ns.args[2];		//	Optional maximum instances of one script allowed to target one server. Default = 1.
	const pservID = (ns.args[3] == null) ? "pserv" : ns.args[3];	//	Optional server ID. Default = 'pserv'.

	//	Get maximum usable thread count for hack script.
	const threads = await getMaxThreads(ram, ns.getScriptRam(script));

	let hostname;	//	Declare hostname variable.

	//	Continue attempting to purchase a server until limit reached.
	for (let i = 0; i < ns.getPurchasedServerLimit();) {
		//	Check if enough money is available to purchase a server.
		if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
			try {
				hostname = ns.purchaseServer(`pserv-${i}-${ram}GB`, ram);	//	Purchase server with generated hostname and specified RAM amount.
				await ns.scp(script, hostname);								//	Copy hack script to purchased server.
				const target = await getBestTarget(ns, script, maxTargets);	//	Determine best target for hack script.
				ns.exec(script, hostname, threads, target);					//	Execute hack script on purchased server with thread amount and target server hostname.

				//	Print confirmation messages to terminal.
				ns.tprint(`Purchased ${hostname} for $${ns.getPurchasedServerCost(ram)}.`);
				ns.tprint(`${hostname} executed ${script} on ${target} with ${threads} threads.`);
			} 
			catch (e) {
				//	Print termination message to terminal and break purchase loop.
				const pservList = await getPserv(ns.scan("home"), pservID);
				if (pservList.length >= ns.getPurchasedServerLimit()) {
					ns.tprint("Purchase loop terminated, server limit reached.");
				}
				else {
					ns.tprint("Purchase loop terminated with the following error: " + e);
				}
				break;
			}
			++i;	//	Increment i if purchase successful.
		}
		else {
			await ns.sleep(3000);	//	Wait 3000ms after each failed check.
		}
	}

	ns.tprint("Operation completed.");
}