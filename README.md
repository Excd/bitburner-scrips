# Bitburner Scripts

A collection of scripts created for the game [Bitburner](https://github.com/bitburner-official/bitburner-src).

This repository is setup to be usable with Visual Studio Code and the [Bitburner Extension](https://marketplace.visualstudio.com/items?itemName=bitburner.bitburner-vscode-integration).

Code auto-completion and documentation are available via importing `NetscriptDefinitions.d.ts` from the Bitburner source code included as a submodule.

The following JSDoc is used for VSCode to recognize netscript definitions:

```js
/**
 * @param {import('@ns').NS} ns
 */
```

This is required for each function using the netscript environment.

`@ns` is a path defined in `jsconfig.json`.

Scripts are located in `out/scripts`.
