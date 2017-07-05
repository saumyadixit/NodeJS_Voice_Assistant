
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
fileData0.push.apply(fileData0, [99, 97, 108, 108, 9, 75, 32, 65, 79, 32, 76, 10, 111, 112, 101, 110, 9, 79, 87, 32, 80, 32, 65, 72, 32, 78, 10, 102, 105, 110, 100, 9, 70, 32, 65, 89, 32, 78, 32, 68, 10, 101, 109, 97, 105, 108, 9, 73, 89, 32, 77, 32, 69, 89, 32, 76, 10, 116, 105, 109, 101, 9, 84, 32, 65, 89, 32, 77]);
Module['FS_createDataFile']('/', 'keyphrase.dict', fileData0, true, true, false);

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
