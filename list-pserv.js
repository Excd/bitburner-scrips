//	Import functions from helper library.
import { getPserv } from "lib-helper.js";

/**
 * A simple script to list purchased servers to the terminal.
 * 
 * @author excd
 * @param {NS} ns Netscript environment.
**/
export async function main(ns) {
	//	Help flag message.
	if (ns.flags([["help", false]]).help) {
		ns.tprint("This script is for listing purchased servers, the first arg specifies a server ID (Default: 'pserv').");
		ns.tprint(`Usage: run ${ns.getScriptName()} SERVERID`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} myserver`);
		return;
	}

	const pservID = (ns.args[0] == null) ? "pserv" : ns.args[0];	//	Server ID is 'pserv' unless an arg is passed.
	const serverList = ns.scan("home");								//	List of home-connected servers.
	ns.tprint(await getPserv(serverList, pservID));					//	Print server list returned from getPserv().
}