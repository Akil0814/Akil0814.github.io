
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
      var PACKAGE_NAME = 'G:/Coding/Projects/FlyMe2TheMoon/out/web/runtime/assets-01.data';
      var REMOTE_PACKAGE_BASE = 'assets-01.data';
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
Module['FS_createPath']("/assets", "audio", true, true);
Module['FS_createPath']("/assets/audio", "music", true, true);
Module['FS_createPath']("/assets/audio", "sounds", true, true);
Module['FS_createPath']("/assets/audio", "system", true, true);
Module['FS_createPath']("/assets", "configs", true, true);
Module['FS_createPath']("/assets/configs", "global", true, true);
Module['FS_createPath']("/assets/configs", "levels", true, true);
Module['FS_createPath']("/assets/configs", "manifests", true, true);
Module['FS_createPath']("/assets/configs", "text", true, true);
Module['FS_createPath']("/assets/configs/text", "en", true, true);
Module['FS_createPath']("/assets/configs/text", "ja", true, true);
Module['FS_createPath']("/assets/configs/text", "zh-Hans", true, true);
Module['FS_createPath']("/assets", "engine", true, true);
Module['FS_createPath']("/assets/engine", "audio", true, true);
Module['FS_createPath']("/assets/engine", "fonts", true, true);

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
          Module['removeRunDependency']('datafile_G:/Coding/Projects/FlyMe2TheMoon/out/web/runtime/assets-01.data');
      }
      Module['addRunDependency']('datafile_G:/Coding/Projects/FlyMe2TheMoon/out/web/runtime/assets-01.data');

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
    loadPackage({"files": [{"filename": "/assets/audio/music/SymphonyofRush.wav", "start": 0, "end": 3629168}, {"filename": "/assets/audio/sounds/106-1.wav", "start": 3629168, "end": 3654922}, {"filename": "/assets/audio/sounds/106-2.wav", "start": 3654922, "end": 3674292}, {"filename": "/assets/audio/sounds/106-3.wav", "start": 3674292, "end": 3708774}, {"filename": "/assets/audio/sounds/107-1.wav", "start": 3708774, "end": 3714094}, {"filename": "/assets/audio/sounds/108-1.wav", "start": 3714094, "end": 3766636}, {"filename": "/assets/audio/sounds/109-1.wav", "start": 3766636, "end": 3899818}, {"filename": "/assets/audio/sounds/12-4.wav", "start": 3899818, "end": 3959272}, {"filename": "/assets/audio/sounds/13-2.wav", "start": 3959272, "end": 4140796}, {"filename": "/assets/audio/sounds/14-3.wav", "start": 4140796, "end": 4159400}, {"filename": "/assets/audio/sounds/15-3.wav", "start": 4159400, "end": 4473600}, {"filename": "/assets/audio/sounds/16-1.wav", "start": 4473600, "end": 4519852}, {"filename": "/assets/audio/sounds/17-4.wav", "start": 4519852, "end": 4582762}, {"filename": "/assets/audio/sounds/18-1.wav", "start": 4582762, "end": 4672168}, {"filename": "/assets/audio/sounds/19-2.wav", "start": 4672168, "end": 4716646}, {"filename": "/assets/audio/sounds/20-1.wav", "start": 4716646, "end": 4832548}, {"filename": "/assets/audio/sounds/23-2.wav", "start": 4832548, "end": 5251384}, {"filename": "/assets/audio/sounds/31-1.wav", "start": 5251384, "end": 5784310}, {"filename": "/assets/audio/sounds/33-6.wav", "start": 5784310, "end": 5814964}, {"filename": "/assets/audio/sounds/34-1.wav", "start": 5814964, "end": 5842784}, {"filename": "/assets/audio/sounds/40-1.wav", "start": 5842784, "end": 5847602}, {"filename": "/assets/audio/sounds/40-2.wav", "start": 5847602, "end": 5851838}, {"filename": "/assets/audio/sounds/41-1.wav", "start": 5851838, "end": 5860660}, {"filename": "/assets/audio/sounds/42-1.wav", "start": 5860660, "end": 5880784}, {"filename": "/assets/audio/sounds/42-2.wav", "start": 5880784, "end": 5904722}, {"filename": "/assets/audio/sounds/43-1.wav", "start": 5904722, "end": 5914538}, {"filename": "/assets/audio/sounds/45-1.wav", "start": 5914538, "end": 5924688}, {"filename": "/assets/audio/sounds/45-2.wav", "start": 5924688, "end": 5944070}, {"filename": "/assets/audio/sounds/46-1.wav", "start": 5944070, "end": 5962350}, {"filename": "/assets/audio/sounds/47-1.wav", "start": 5962350, "end": 5981602}, {"filename": "/assets/audio/sounds/48-1.wav", "start": 5981602, "end": 6037322}, {"filename": "/assets/audio/sounds/49-1.wav", "start": 6037322, "end": 6094162}, {"filename": "/assets/audio/sounds/50-1.wav", "start": 6094162, "end": 6117162}, {"filename": "/assets/audio/sounds/50-2.wav", "start": 6117162, "end": 6127312}, {"filename": "/assets/audio/sounds/51-1.wav", "start": 6127312, "end": 6186474}, {"filename": "/assets/audio/sounds/51-2.wav", "start": 6186474, "end": 6218024}, {"filename": "/assets/audio/sounds/52-1.wav", "start": 6218024, "end": 6238370}, {"filename": "/assets/audio/sounds/53-1.wav", "start": 6238370, "end": 6242756}, {"filename": "/assets/audio/sounds/54-1.wav", "start": 6242756, "end": 6264130}, {"filename": "/assets/audio/sounds/55-2.wav", "start": 6264130, "end": 6271178}, {"filename": "/assets/audio/sounds/57-1.wav", "start": 6271178, "end": 6281572}, {"filename": "/assets/audio/sounds/58-1.wav", "start": 6281572, "end": 6287804}, {"filename": "/assets/audio/sounds/59-1.wav", "start": 6287804, "end": 6297290}, {"filename": "/assets/audio/sounds/6-3.wav", "start": 6297290, "end": 6317576}, {"filename": "/assets/audio/sounds/60-1.wav", "start": 6317576, "end": 6362972}, {"filename": "/assets/audio/sounds/60-2.wav", "start": 6362972, "end": 6393570}, {"filename": "/assets/audio/sounds/60-4.wav", "start": 6393570, "end": 6447778}, {"filename": "/assets/audio/sounds/61-1.wav", "start": 6447778, "end": 6461712}, {"filename": "/assets/audio/sounds/61-2.wav", "start": 6461712, "end": 6473688}, {"filename": "/assets/audio/sounds/7-4.wav", "start": 6473688, "end": 6483606}, {"filename": "/assets/audio/sounds/70-1.wav", "start": 6483606, "end": 6528084}, {"filename": "/assets/audio/sounds/70-2.wav", "start": 6528084, "end": 6574866}, {"filename": "/assets/audio/sounds/90-1.wav", "start": 6574866, "end": 6600912}, {"filename": "/assets/audio/sounds/90-10.wav", "start": 6600912, "end": 6618894}, {"filename": "/assets/audio/sounds/90-2.wav", "start": 6618894, "end": 6643788}, {"filename": "/assets/audio/sounds/90-3.wav", "start": 6643788, "end": 6668682}, {"filename": "/assets/audio/sounds/90-4.wav", "start": 6668682, "end": 6692424}, {"filename": "/assets/audio/sounds/90-5.wav", "start": 6692424, "end": 6715014}, {"filename": "/assets/audio/sounds/90-6.wav", "start": 6715014, "end": 6736452}, {"filename": "/assets/audio/sounds/90-7.wav", "start": 6736452, "end": 6756738}, {"filename": "/assets/audio/sounds/90-8.wav", "start": 6756738, "end": 6775872}, {"filename": "/assets/audio/sounds/90-9.wav", "start": 6775872, "end": 6795006}, {"filename": "/assets/audio/system/button_click_down.wav", "start": 6795006, "end": 6798710}, {"filename": "/assets/audio/system/button_click_up.wav", "start": 6798710, "end": 6803258}, {"filename": "/assets/configs/catalog.json", "start": 6803258, "end": 6887381}, {"filename": "/assets/configs/global/app_config.json", "start": 6887381, "end": 6887815}, {"filename": "/assets/configs/landscape_boundaries.json", "start": 6887815, "end": 6888137}, {"filename": "/assets/configs/levels/001.json", "start": 6888137, "end": 6935064}, {"filename": "/assets/configs/levels/002.json", "start": 6935064, "end": 7059897}, {"filename": "/assets/configs/levels/003.json", "start": 7059897, "end": 7165173}, {"filename": "/assets/configs/levels/004.json", "start": 7165173, "end": 7244555}, {"filename": "/assets/configs/levels/005.json", "start": 7244555, "end": 7345667}, {"filename": "/assets/configs/levels/006.json", "start": 7345667, "end": 7445228}, {"filename": "/assets/configs/levels/007.json", "start": 7445228, "end": 7667031}, {"filename": "/assets/configs/levels/008.json", "start": 7667031, "end": 7772941}, {"filename": "/assets/configs/levels/009.json", "start": 7772941, "end": 7882070}, {"filename": "/assets/configs/levels/010.json", "start": 7882070, "end": 8079630}, {"filename": "/assets/configs/levels/011.json", "start": 8079630, "end": 8257278}, {"filename": "/assets/configs/levels/012.json", "start": 8257278, "end": 8417597}, {"filename": "/assets/configs/levels/013.json", "start": 8417597, "end": 8629811}, {"filename": "/assets/configs/levels/014.json", "start": 8629811, "end": 8745363}, {"filename": "/assets/configs/levels/015.json", "start": 8745363, "end": 8860554}, {"filename": "/assets/configs/levels/016.json", "start": 8860554, "end": 9023224}, {"filename": "/assets/configs/levels/017.json", "start": 9023224, "end": 9155294}, {"filename": "/assets/configs/levels/018.json", "start": 9155294, "end": 9256567}, {"filename": "/assets/configs/levels/019.json", "start": 9256567, "end": 9353801}, {"filename": "/assets/configs/levels/020.json", "start": 9353801, "end": 9469449}, {"filename": "/assets/configs/levels/021.json", "start": 9469449, "end": 9605037}, {"filename": "/assets/configs/levels/022.json", "start": 9605037, "end": 9770545}, {"filename": "/assets/configs/levels/023.json", "start": 9770545, "end": 9860581}, {"filename": "/assets/configs/levels/024.json", "start": 9860581, "end": 10013327}, {"filename": "/assets/configs/levels/025.json", "start": 10013327, "end": 10143837}, {"filename": "/assets/configs/levels/026.json", "start": 10143837, "end": 10267867}, {"filename": "/assets/configs/levels/027.json", "start": 10267867, "end": 10378776}, {"filename": "/assets/configs/levels/028.json", "start": 10378776, "end": 10463377}, {"filename": "/assets/configs/levels/029.json", "start": 10463377, "end": 10570055}, {"filename": "/assets/configs/levels/030.json", "start": 10570055, "end": 10743208}, {"filename": "/assets/configs/levels/031.json", "start": 10743208, "end": 10967709}, {"filename": "/assets/configs/levels/032.json", "start": 10967709, "end": 11075396}, {"filename": "/assets/configs/levels/033.json", "start": 11075396, "end": 11154012}, {"filename": "/assets/configs/levels/034.json", "start": 11154012, "end": 11337626}, {"filename": "/assets/configs/levels/035.json", "start": 11337626, "end": 11422710}, {"filename": "/assets/configs/levels/036.json", "start": 11422710, "end": 11522198}, {"filename": "/assets/configs/levels/037.json", "start": 11522198, "end": 11675930}, {"filename": "/assets/configs/levels/038.json", "start": 11675930, "end": 11745777}, {"filename": "/assets/configs/levels/039.json", "start": 11745777, "end": 11861344}, {"filename": "/assets/configs/levels/040.json", "start": 11861344, "end": 12004034}, {"filename": "/assets/configs/levels/041.json", "start": 12004034, "end": 12048001}, {"filename": "/assets/configs/levels/042.json", "start": 12048001, "end": 12157199}, {"filename": "/assets/configs/levels/043.json", "start": 12157199, "end": 12245759}, {"filename": "/assets/configs/levels/044.json", "start": 12245759, "end": 12348711}, {"filename": "/assets/configs/levels/045.json", "start": 12348711, "end": 12521655}, {"filename": "/assets/configs/levels/046.json", "start": 12521655, "end": 12624717}, {"filename": "/assets/configs/levels/047.json", "start": 12624717, "end": 12686350}, {"filename": "/assets/configs/levels/048.json", "start": 12686350, "end": 12885869}, {"filename": "/assets/configs/levels/049.json", "start": 12885869, "end": 13002403}, {"filename": "/assets/configs/levels/050.json", "start": 13002403, "end": 13124309}, {"filename": "/assets/configs/levels/051.json", "start": 13124309, "end": 13325462}, {"filename": "/assets/configs/levels/052.json", "start": 13325462, "end": 13439529}, {"filename": "/assets/configs/levels/053.json", "start": 13439529, "end": 13514831}, {"filename": "/assets/configs/levels/054.json", "start": 13514831, "end": 13630684}, {"filename": "/assets/configs/levels/055.json", "start": 13630684, "end": 13766964}, {"filename": "/assets/configs/levels/056.json", "start": 13766964, "end": 13825413}, {"filename": "/assets/configs/levels/057.json", "start": 13825413, "end": 14033593}, {"filename": "/assets/configs/levels/058.json", "start": 14033593, "end": 14136867}, {"filename": "/assets/configs/levels/059.json", "start": 14136867, "end": 14235291}, {"filename": "/assets/configs/levels/060.json", "start": 14235291, "end": 14539712}, {"filename": "/assets/configs/manifests/animations_manifest.json", "start": 14539712, "end": 14552105}, {"filename": "/assets/configs/manifests/audio_manifest.json", "start": 14552105, "end": 14556863}, {"filename": "/assets/configs/manifests/config_manifest.json", "start": 14556863, "end": 14556910}, {"filename": "/assets/configs/manifests/effects_manifest.json", "start": 14556910, "end": 14556933}, {"filename": "/assets/configs/manifests/fonts_manifest.json", "start": 14556933, "end": 14557450}, {"filename": "/assets/configs/manifests/i18n_manifest.json", "start": 14557450, "end": 14557608}, {"filename": "/assets/configs/manifests/preload_manifest.json", "start": 14557608, "end": 14557715}, {"filename": "/assets/configs/manifests/textures_manifest.json", "start": 14557715, "end": 14622083}, {"filename": "/assets/configs/text/en/gcDescriptions.json", "start": 14622083, "end": 14623966}, {"filename": "/assets/configs/text/en/strings.json", "start": 14623966, "end": 14639919}, {"filename": "/assets/configs/text/ja/gcDescriptions.json", "start": 14639919, "end": 14642132}, {"filename": "/assets/configs/text/ja/strings.json", "start": 14642132, "end": 14661969}, {"filename": "/assets/configs/text/zh-Hans/gcDescriptions.json", "start": 14661969, "end": 14663855}, {"filename": "/assets/configs/text/zh-Hans/strings.json", "start": 14663855, "end": 14679498}, {"filename": "/assets/configs/tutorial.json", "start": 14679498, "end": 14826547}, {"filename": "/assets/configs/tutorial_visual.json", "start": 14826547, "end": 14851845}, {"filename": "/assets/content_registry.json", "start": 14851845, "end": 14852483}, {"filename": "/assets/engine/.elysia_engine_required", "start": 14852483, "end": 14852483}, {"filename": "/assets/engine/audio/Elysian_Realm.ogg", "start": 14852483, "end": 17390251}, {"filename": "/assets/engine/fonts/NotoSans-Regular.ttf", "start": 17390251, "end": 18019275}, {"filename": "/assets/engine/fonts/NotoSansJP-Regular.ttf", "start": 18019275, "end": 23492059}, {"filename": "/assets/engine/fonts/NotoSansKR-Regular.ttf", "start": 23492059, "end": 29677927}], "remote_package_size": 29677927});

  })();
