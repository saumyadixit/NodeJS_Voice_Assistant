
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
var fileData0 = [];
fileData0.push.apply(fileData0, [99, 97, 108, 108, 32, 47, 49, 101, 45, 49, 53, 47, 13, 10, 111, 112, 101, 110, 32, 47, 49, 101, 45, 49, 53, 47, 13, 10, 102, 105, 110, 100, 32, 47, 49, 101, 45, 49, 53, 47, 13, 10, 101, 109, 97, 105, 108, 32, 47, 49, 101, 45, 49, 53, 47, 13, 10, 116, 105, 109, 101, 32, 47, 49, 101, 45, 49, 53, 47]);
Module['FS_createDataFile']('/', 'keyphrase.list', fileData0, true, true, false);

  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": []});

})();
