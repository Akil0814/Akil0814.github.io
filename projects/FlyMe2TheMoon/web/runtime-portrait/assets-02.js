
  var Module = typeof Module != 'undefined' ? Module : {};

  if (!Module['expectedDataFileDownloads']) Module['expectedDataFileDownloads'] = 0;
  Module['expectedDataFileDownloads']++;
  (() => {
    // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
    var isPthread = typeof ENVIRONMENT_IS_PTHREAD != 'undefined' && ENVIRONMENT_IS_PTHREAD;
    var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != 'undefined' && ENVIRONMENT_IS_WASM_WORKER;
    if (isPthread || isWasmWorker) return;
    async function loadPackage(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = 'G:/Coding/Projects/FlyMe2TheMoon/out/web-portrait/runtime/assets-02.data';
      var REMOTE_PACKAGE_BASE = 'assets-02.data';
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
      var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      async function fetchRemotePackage(packageName, packageSize) {
        
        if (!Module['dataFileDownloads']) Module['dataFileDownloads'] = {};
        try {
          var response = await fetch(packageName);
        } catch (e) {
          throw new Error(`Network Error: ${packageName}`, {e});
        }
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.url}`);
        }

        const chunks = [];
        const headers = response.headers;
        const total = Number(headers.get('Content-Length') || packageSize);
        let loaded = 0;

        Module['setStatus'] && Module['setStatus']('Downloading data...');
        const reader = response.body.getReader();

        while (1) {
          var {done, value} = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          Module['dataFileDownloads'][packageName] = {loaded, total};

          let totalLoaded = 0;
          let totalSize = 0;

          for (const download of Object.values(Module['dataFileDownloads'])) {
            totalLoaded += download.loaded;
            totalSize += download.total;
          }

          Module['setStatus'] && Module['setStatus'](`Downloading data... (${totalLoaded}/${totalSize})`);
        }

        const packageData = new Uint8Array(chunks.map((c) => c.length).reduce((a, b) => a + b, 0));
        let offset = 0;
        for (const chunk of chunks) {
          packageData.set(chunk, offset);
          offset += chunk.length;
        }
        return packageData.buffer;
      }

      var fetchPromise;
      var fetched = Module['getPreloadedPackage'] && Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE);

      if (!fetched) {
        // Note that we don't use await here because we want to execute the
        // the rest of this function immediately.
        fetchPromise = fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE);
      }

    async function runWithFS(Module) {

      function assert(check, msg) {
        if (!check) throw new Error(msg);
      }
Module['FS_createPath']("/", "assets", true, true);
Module['FS_createPath']("/assets", "engine", true, true);
Module['FS_createPath']("/assets/engine", "fonts", true, true);
Module['FS_createPath']("/assets/engine", "i18n", true, true);
Module['FS_createPath']("/assets/engine/i18n", "en", true, true);
Module['FS_createPath']("/assets/engine/i18n", "ja", true, true);
Module['FS_createPath']("/assets/engine/i18n", "ko", true, true);
Module['FS_createPath']("/assets/engine/i18n", "zh-Hans", true, true);
Module['FS_createPath']("/assets/engine/i18n", "zh-Hant", true, true);
Module['FS_createPath']("/assets/engine", "textures", true, true);
Module['FS_createPath']("/assets", "fonts", true, true);

    for (var file of metadata['files']) {
      var name = file['filename']
      Module['addRunDependency'](`fp ${name}`);
    }

      async function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData ' + arrayBuffer.constructor.name);
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          for (var file of metadata['files']) {
            var name = file['filename'];
            var data = byteArray.subarray(file['start'], file['end']);
            // canOwn this data in the filesystem, it is a slice into the heap that will never change
        Module['FS_createDataFile'](name, null, data, true, true, true);
        Module['removeRunDependency'](`fp ${name}`);
          }
          Module['removeRunDependency']('datafile_G:/Coding/Projects/FlyMe2TheMoon/out/web-portrait/runtime/assets-02.data');
      }
      Module['addRunDependency']('datafile_G:/Coding/Projects/FlyMe2TheMoon/out/web-portrait/runtime/assets-02.data');

      if (!Module['preloadResults']) Module['preloadResults'] = {};

      Module['preloadResults'][PACKAGE_NAME] = {fromCache: false};
      if (!fetched) {
        fetched = await fetchPromise;
      }
      processPackageData(fetched);

    }
    if (Module['calledRun']) {
      runWithFS(Module);
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module['preRun'].push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/assets/engine/fonts/NotoSansSC-Regular.ttf", "start": 0, "end": 10559284}, {"filename": "/assets/engine/fonts/NotoSansTC-Regular.ttf", "start": 10559284, "end": 17668744}, {"filename": "/assets/engine/fonts/OFL.txt", "start": 17668744, "end": 17673233}, {"filename": "/assets/engine/i18n/en/engine.json", "start": 17673233, "end": 17676296}, {"filename": "/assets/engine/i18n/ja/engine.json", "start": 17676296, "end": 17679976}, {"filename": "/assets/engine/i18n/ko/engine.json", "start": 17679976, "end": 17683394}, {"filename": "/assets/engine/i18n/zh-Hans/engine.json", "start": 17683394, "end": 17686265}, {"filename": "/assets/engine/i18n/zh-Hant/engine.json", "start": 17686265, "end": 17689183}, {"filename": "/assets/engine/textures/Elysia_main.png", "start": 17689183, "end": 18543478}, {"filename": "/assets/engine/textures/character_idle.png", "start": 18543478, "end": 18548069}, {"filename": "/assets/engine/textures/character_move.png", "start": 18548069, "end": 18553005}, {"filename": "/assets/engine/textures/elysia.png", "start": 18553005, "end": 18684650}, {"filename": "/assets/engine/textures/elysia_black.png", "start": 18684650, "end": 18789354}, {"filename": "/assets/engine/textures/elysia_black_alpha_inverse.png", "start": 18789354, "end": 18863596}, {"filename": "/assets/engine/textures/elysia_light_edge.png", "start": 18863596, "end": 19439602}, {"filename": "/assets/engine/textures/elysia_white.png", "start": 19439602, "end": 19519512}, {"filename": "/assets/engine/textures/elysian_timeless_grand_hall.png", "start": 19519512, "end": 21139301}, {"filename": "/assets/fonts/fusion-pixel-10px-proportional-ja.ttf", "start": 21139301, "end": 25097221}, {"filename": "/assets/fonts/fusion-pixel-10px-proportional-ko.ttf", "start": 25097221, "end": 29038961}, {"filename": "/assets/fonts/fusion-pixel-10px-proportional-zh_hans.ttf", "start": 29038961, "end": 32996565}], "remote_package_size": 32996565});

  })();
