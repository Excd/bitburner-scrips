//	Import functions from helper library.
import { getPserv } from "lib-helper.js";

/**
 * A simple script to delete purchased servers, killing their scripts automatically.
 * 
 * @author excd
 * @param {NS} ns Netscript environment.
**/
export async function main(ns) {
	//	Help flag message.
	if (ns.flags([["help", false]]).help) {
		ns.tprint("This script is for deleting purchased servers, the first arg specifies a server ID (Default: 'pserv').");
		ns.tprint(`Usage: run ${ns.getScriptName()} SERVERID`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} myserver`);
		return;
	}

	const pservID = (ns.args[0] == null) ? "pserv" : ns.args[0];	//	Server ID is 'pserv' unless an arg is passed.
	const serverList = ns.scan("home");								//	List of home-connected servers.
	const pservList = await getPserv(serverList, pservID);			//	List of purchased servers. 

	//	Iterate through list and kill scripts on and delete purchased servers.
	for (const pserv of pservList) {
		if (ns.killall(pserv)) {
			ns.tprint(`${pserv} scripts killed.`);
		}
		else {
			ns.tprint(`${pserv} scripts could not be killed.`);
		}
		
		if (ns.deleteServer(pserv)) {
			ns.tprint(`${pserv} deleted.`);
		}
		else {
			ns.tprint(`${pserv} could not be deleted.`);
		}
	}

	ns.tprint("Operation completed.");
}