      var hadithURL = "https://raw.githubusercontent.com/OmarShafie/VizHadith/master/all_hadiths_clean.csv";
      var narratorsURL = "https://raw.githubusercontent.com/OmarShafie/VizHadith/master/all_rawis.csv";

      var inputType = "remote";
      var stepped = 0, rowCount = 0, errorCount = 0, firstError;
      var start, end;
      var firstRun = true;
      var maxUnparseLength = 10000;

      $(function()
      {
        // Demo invoked
        $('#submit').click(function()
        {
          if ($(this).prop('disabled') == "true")
            return;

          stepped = 0;
          rowCount = 0;
          errorCount = 0;
          firstError = undefined;

          var config = buildConfig();

          // Allow only one parse at a time
          $(this).prop('disabled', true);

          if (!firstRun)
            console.log("--------------------------------------------------");
          else
            firstRun = false;

          if (inputType == "local")
          {
            if (!$('#files')[0].files.length)
            {
              alert("Please choose at least one file to parse.");
              return enableButton();
            }

            $('#files').parse({
              config: config,
              before: function(file, inputElem)
              {
                start = now();
                console.log("Parsing file...", file);
              },
              error: function(err, file)
              {
                console.log("ERROR:", err, file);
                firstError = firstError || err;
                errorCount++;
              },
              complete: function()
              {
                end = now();
                printStats("Done with all files");
              }
            });
          }
          else if (inputType == "json")
          {
            if (!input)
            {
              alert("Please enter a valid JSON string to convert to CSV.");
              return enableButton();
            }

            start = now();
            var csv = Papa.unparse(input, config);
            end = now();

            console.log("Unparse complete");
            console.log("Time:", (end-start || "(Unknown; your browser does not support the Performance API)"), "ms");

            if (csv.length > maxUnparseLength)
            {
              csv = csv.substr(0, maxUnparseLength);
              console.log("(Results truncated for brevity)");
            }

            console.log(csv);

            setTimeout(enableButton, 100);	// hackity-hack
          }

          else
          {
            start = now();
            var narratorsData;
        Papa.parse(narratorsURL,  {
          delimiter: $('#delimiter').val(),
          header: $('#header').prop('checked'),
          dynamicTyping: $('#dynamicTyping').prop('checked'),
          skipEmptyLines: $('#skipEmptyLines').prop('checked'),
          preview: parseInt($('#preview').val() || 0),
          step: $('#stream').prop('checked') ? stepFn : undefined,
          encoding: $('#encoding').val(),
          worker: $('#worker').prop('checked'),
          comments: $('#comments').val(),
          complete: saveNarrators,
          error: errorFn,
          download: inputType == "remote"
        });
            if (config.worker || config.download)
              console.log("Running...");
          }
        });

        $('#insert-tab').click(function()
        {
          $('#delimiter').val('\t');
        });
      });

      function printStats(msg)
      {
        if (msg)
          console.log(msg);
        console.log("       Time:", (end-start || "(Unknown; your browser does not support the Performance API)"), "ms");
        console.log("  Row count:", rowCount);
        if (stepped)
          console.log("    Stepped:", stepped);
        console.log("     Errors:", errorCount);
        if (errorCount)
          console.log("First error:", firstError);
      }



      function buildConfig()
      {
        return {
          delimiter: $('#delimiter').val(),
          header: $('#header').prop('checked'),
          dynamicTyping: $('#dynamicTyping').prop('checked'),
          skipEmptyLines: $('#skipEmptyLines').prop('checked'),
          preview: parseInt($('#preview').val() || 0),
          step: $('#stream').prop('checked') ? stepFn : undefined,
          encoding: $('#encoding').val(),
          worker: $('#worker').prop('checked'),
          comments: $('#comments').val(),
          complete: completeFn,
          error: errorFn,
          download: inputType == "remote"
        };
      }

      function stepFn(results, parser)
      {
        stepped++;
        if (results)
        {
          if (results.data)
            rowCount += results.data.length;
          if (results.errors)
          {
            errorCount += results.errors.length;
            firstError = firstError || results.errors[0];
          }
        }
      }


      function saveNarrators(results)
      {

        console.log("Parsed Narrators...");
        end = now();

        if (results && results.errors)
        {
          if (results.errors)
          {
            errorCount = results.errors.length;
            firstError = results.errors[0];
          }
          if (results.data && results.data.length > 0)
            rowCount = results.data.length;
        }
        narratorsData = results.data;
        Papa.parse(hadithURL, buildConfig());

        // icky hack
        setTimeout(enableButton, 100);
      }

      function completeFn(results)
      { 
        console.log("Parsed Hadiths...");
        end = now();

        if (results && results.errors)
        {
          if (results.errors)
          {
            errorCount = results.errors.length;
            firstError = results.errors[0];
          }
          if (results.data && results.data.length > 0)
            rowCount = results.data.length;
        }

        process(results.data, narratorsData);
        //printStats("Parse complete");

        // icky hack
        setTimeout(enableButton, 100);
      }

      function errorFn(err, file)
      {
        end = now();
        console.log("ERROR:", err, file);
        enableButton();
      }

      function enableButton()
      {
        $('#submit').prop('disabled', false);
      }

      function now()
      {
        return typeof window.performance !== 'undefined'
            ? window.performance.now()
            : 0;
      }

      function lookupNarrator(index){
        return narratorsData.find(function(element) {
        return element[0] == index;
      });
      }
      function updateCount(data, source, target){
        var found;
        var i = 0; 
        
        while(!found && i < data.length){
          if(data[i][0] == source && data[i][1] == target){
            found = true;
            data[i][2]++;
          }
          i++;
        }
        if (!found){
          data.push([source, target, 1]);
        }
      }
      function process(hadithData, narratorsData){

        console.log("Start Processing...");
        var row =0;
        var hadith=0;
        var name1;
        var name2;
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'From');
        data.addColumn('string', 'To');
        data.addColumn('number', 'Weight');
        var tempData = [];
        for(var i = 1; i < hadithData.length;i++)
        {
          hadith++;
          row =0;
          if(hadithData[i][6].includes("11013")){ // Al zuhry
             var chain = hadithData[i][6].split(", ");
             for(var n = 0; n < chain.length -1;n++)
             {
               var narrator = lookupNarrator(chain[n]);
               if(narrator) {
                  var teachers = narrator[10];
                  if (teachers.includes(chain[n+1])) {
                    name1 = lookupNarrator(chain[n])[1].slice(0,20);
                    name2 = lookupNarrator(chain[n+1])[1].slice(0,20);
                    updateCount(tempData, name1, name2);
                 row++;
                  }
               }
               else{
                 console.log("narrator is missing", chain[n]);
               }
          }
        }
      }
      data.addRows(tempData);
      google.charts.setOnLoadCallback(drawChart(data));
      }
