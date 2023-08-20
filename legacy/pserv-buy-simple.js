/** 
 * A simple script to purchase additional server space, based on bitburner docs example.
 * 
 * @author excd
 * @param {NS} ns Netscript environment.
**/
export async function main(ns) {
	//	Help flag message.
	if (ns.flags([["help", false]]).help) {
		ns.tprint("This script will automatically purchase servers with a specified amount of RAM in GB and execute a " +
			"simple hack script on a specified hostname with a specified thread count.");
		ns.tprint(`Usage: run ${ns.getScriptName()} RAM THREADS HOSTNAME`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} 8 3 n00dles`);
		return;
	}

	const ram = ns.args[0];		//	Desired amount of RAM in GB for each server passed as first arg.
	const threads = ns.args[1];	//	Desired amount of threads to execute hack script on passed as second arg.
	const target = ns.args[2];	//	Desired target hostname for hack script passed as third arg.

	let hostname;				//	Declare hostname variable.

	//	Continue attempting to purchase a server until limit reached.
	for (let i = 0; i < ns.getPurchasedServerLimit();) {
		//	Check if enough money is available to purchase a server.
		if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
			try {
				//	Purchase server with generated hostname and specified RAM amount.
				hostname = ns.purchaseServer("pserv-" + ram + "GB-" + i, ram);
				await ns.scp("hack-simple.js", hostname);				//	Copy hack script to purchased server.
				ns.exec("hack-simple.js", hostname, threads, target);	//	Execute hack script on purchased server with specified thread amount and target server hostname.
			} catch (e) {
				//	Print termination message to terminal and break purchase loop.
				ns.tprint("Purchase loop terminated.");
				break;
			}
			++i;					//	Increment i if purchase successful.
		}
		else {
			await ns.sleep(3000);	//	Wait 3000ms after each failed check.
		}
	}

	ns.tprint("Operation completed.");
}