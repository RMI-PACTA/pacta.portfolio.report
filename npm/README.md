# Installing JS dependencies

This README is meant for developers of `pacta.portfolio.report`, users of the package should not need to read this.

`pacta.portfolio.report` has several direct dependencies on `JavaScript` modules. These dependencies are managed using `npm`. The necessary `JavaScript` and `CSS` files are installed in the `inst/js` and `inst/css` directories respectively.

To install the dependencies, you will need to have `Node.js` and `npm` installed locally. 
There are several ways to install these things, but the easiest way is to install `Node.js` using `nvm` (Node Version Manager). 
See here for more details: https://nodejs.dev/en/learn/how-to-install-nodejs/

# Populating the JavaScript dependencies
To populate the `inst/js` directory with the relevant JavaScript dependencies, run the following commands from the `./npm` directory:

```bash
npm install
npm run all
```

`npm install` will create a local library of JavaScript modules in `./npm/node_modules/`, which is listed in `.gitignore` and should *not* be committed to the git repo. `npm run all` will run all of the scripts defined in the `scripts` section of the `./npm/package.json` file, which will manage picking out the necessary files from the local node/npm library and moving them into the appropriate location in `./inst/`.

# Updating dependencies
If you would like to update any of the dependencies, you can do so per module by updating the `dependencies` section of the `./npm/package.json` file in the `npm` directory. 

After doing so, you may populate the `inst/js` directory with the updated dependencies by running the following commands from the `./npm` directory:

```bash
npm install
npm run all
```

<div class="panel panel-warning">
**Warning**
{: .panel-heading}
<div class="panel-body">

Bumping the version number of a dependency is dangerous, and may break report plots unexpectedly.
It should be done only after careful consideration and testing of the consequences of the update.

</div>
</div>
