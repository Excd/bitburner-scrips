/** 
 * Returns the best home-connected server to target for hacking.
 * 
 * @todo Better selection criteria.
 * 
 * @remarks RAM cost: 0.45 GB
 * @param {NS} ns Netscript environment.
 * @param {String} script Name of script to check for.
 * @param {number} maxTargets Maximum instances of one script allowed to target one server.
 * @returns {String} Best target server hostname.
**/
export async function getBestTarget(ns, script, maxTargets) {
	const serverList = ns.scan("home");		//	List of home-connected servers.
	const hackLevel = ns.getHackingLevel();	//	Current user hacking level.

	let ports = 0;							//	Variable to track amount of ports openable.
	let target = serverList[0];				//	Point target variable to first list element.

	//	Increase ports openable for each port-opening program available.
	if (ns.fileExists("BruteSSH.exe", "home")) ports++;
	if (ns.fileExists("FTPCrack.exe", "home")) ports++;
	if (ns.fileExists("relaySMTP.exe", "home")) ports++;
	if (ns.fileExists("HTTPWorm.exe", "home")) ports++;
	if (ns.fileExists("SQLInject.exe", "home")) ports++;

	//	Iterate through server list.
	for (const server of serverList) {
		const serverSubList = ns.scan(server);	//	List of servers connected to current server.

		//	Iterate sub-server list, add each server not already in to the main server list.
		for (const subServer of serverSubList) {
			if (!serverList.includes(subServer)) serverList.push(subServer);
		}

		//	Check if server has requirement low enough for the user to hack and higher than the current target.
		//	Check if server can have all ports opened.
		if (hackLevel >= ns.getServerRequiredHackingLevel(server) && ns.getServerNumPortsRequired(server) <= ports &&
			ns.getServerRequiredHackingLevel(server) >= ns.getServerRequiredHackingLevel(target)) {
			
			let targetCount = 0;	//	Initialize target counter.

			//	Iterate through server list, check if the target server is already being targeted by a hack script.
			for (const host of serverList) {
				if (ns.isRunning(script, host, server)) targetCount++;
			}

			if (targetCount < maxTargets) target = server;	//	Assign new target if a better server is found.
		}
	}
	return target;	//	Return target server.
}

/** 
 * Returns the maximum threads possible to run with a specified script RAM requirement and available RAM amount.
 * 
 * @remarks RAM cost: 0 GB
 * @param {number} ram Available RAM.
 * @param {number} scriptRam Script RAM requirement.
 * @returns {number} Maximum usable threads.
**/
export async function getMaxThreads(ram, scriptRam) {
	return Math.floor(ram / scriptRam);
}

/**
 * Returns a list of servers which match a specified server ID from a passed server list.
 * 
 * @remarks RAM cost: 0 GB
 * @param {String[]} serverList List of servers to search.
 * @param {String} pservID Purchased server ID.
 * @returns {String[]} List of purchased servers.
**/
export async function getPserv(serverList, pservID) {
	const pservList = [];					//	Declare purchased server list.
	const regex = new RegExp(pservID);		//	Create regex from server ID string.

	//	Iterate through server list.
	for (const server of serverList) {
		if (server.search(regex) > -1) {
			pservList.push(server);			//	Push each successful match to the purchased server list.
		}
	}
	return pservList;						//	Return populated server list.
}