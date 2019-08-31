// Source: Kaggle Hadith Data Set  
var URL = "https://raw.githubusercontent.com/OmarShafie/VizHadith/master/"
var hadithURL = URL+"all_hadiths_clean.csv";
var narratorsURL = URL+"all_rawis.csv";

//TODO: Take input from user
var input = "11013";
var numNarrators = 50;

//Parse Parameters
var inputType = "remote";
var stepped = 0, rowCount = 0, errorCount = 0, firstError;
var start, end;
var firstRun = true;
var maxUnparseLength = 10000;

var isParsingDone = false;
var parsedData;

$(function()
  {
  // Demo invoked
  $('#submit').click(
    function(){
    if ($(this).prop('disabled') == "true") { return; }

    stepped = 0;
    rowCount = 0;
    errorCount = 0;
    firstError = undefined;

    var config = buildConfig();

    // Allow only one parse at a time
    $(this).prop('disabled', true);

      document.getElementById("submit").innerHTML = '<span class="spinner-border spinner-border-sm"></span> Loading..';
      input = document.getElementById("rawi").value;
      numNarrators = document.getElementById("numNarrators").value;
      if (input == ""){
        input = "11013";
      }
      if (numNarrators < 1){
        numNarrators = 50;
      }
      else {
        numNarrators = parseInt(numNarrators)
      }
    if (!firstRun){
      console.log("--------------------------------------------------");
    }
    else {
      firstRun = false;
    }
    if (!isParsingDone) {
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
        document.getElementById("btnMessage").innerHTML = "Running...";
    } else {
      main(parsedData, narratorsData);
    }
  });
});
  
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

function saveNarrators(results)
{

  document.getElementById("btnMessage").innerHTML = "Parsed Narrators...";
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
}

function completeFn(results)
{ 
  document.getElementById("btnMessage").innerHTML = "Parsed Hadith Dataset!";
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
  isParsingDone = true;
  parsedData = results.data;
  enableButton()
  //main(parsedData, narratorsData);
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
  document.getElementById("submit").innerHTML = "Submit";
}

function now()
{
  return typeof window.performance !== 'undefined'
    ? window.performance.now()
  : 0;
}
/*-------------- Main Code -------------*/
function getNarratorGrade(tag){
  var narrator_index = tag.split(" ")[0];
  var narrator = lookupNarrator(narrator_index);
  if (narrator.length === 25) {
    return narrator[12];
  }
  return "NA";
}

function gradeToColor(grade){
  var mapping = {
    1 : "darkgreen",
    2 : "seagreen",
    3 : "mediumseagreen",
    4 : "mediumseagreen",
    5 : "springgreen",
    6 : "lime",
    7 : "greenyellow",
    8 : "yellow",
    9 : "gold",
    10: "coral",
    11: "lightcoral",
    12: "salmon",
    13: "red",
    14: "crimson",
    15: "maroon",
    16: "silver",
    17: "lightslategray",
    18: "darkslategray",
  };
  if (grade.includes("صحابي") || grade.includes("صحابة") || grade.includes("صحبة")){
    return mapping[1];
  }
  else if (grade.includes("أوثق")){
    return mapping[2];
  }
  else if (grade.includes("Narrator[Grade:Thiqah Thiqah]") || grade.includes("ثبت")  || grade.includes("حافظ") || grade.includes("ثقة ثقة")){
    return mapping[3];
  }
  else if (grade.includes("Narrator[Grade:No Doubt]")  || grade.includes("البخاري")  || grade.includes("مسلم")){
    return mapping[4];
  }
  else if (grade.includes("Narrator[Grade:Thiqah]") || grade.includes("ثقة")){
    return mapping[5];
  }
  else if (grade.includes("Narrator[4") || grade.includes("الأربعة") || grade.includes("الستة")){
    return mapping[6];
  }
  else if (grade.includes("Narrator[Grade:Sadooq]") || grade.includes("صدوق")  ){
    return mapping[7];
  }
  else if (grade.includes("Narrator[Grade:Sadooq/Delusion]")){
    return mapping[8];
  }
  else if (grade.includes("Narrator[Grade:Maqbool]")  || grade.includes("مقبول")){
    return mapping[9];
  }
  else if (grade.includes("لين")){
    return mapping[10];
  }
  else if (grade.includes("Narrator[Grade:Not Thiqah]") || grade.includes("Narrator[Grade:Unknown-Majhool]") || grade.includes("مجهول") || grade.includes("مستور")){
    return mapping[11];
  }
  else if (grade.includes("Narrator[Grade:Undefined]")){
    return mapping[12];
  }
  else if (grade.includes("Narrator[Grade:Abandoned]") || grade.includes("متروك") || grade.includes("منكر")){
    return mapping[13];
  }
  else if (grade.includes("Narrator[Grade:Weak]") || grade.includes("ضعيف")){
    return mapping[14];
  }
  else if (grade.includes("Narrator[Grade:Liar]") || grade.includes("كذب")){
    return mapping[15];
  }
  else if (grade.includes("Narrator")){
    return mapping[16];
  }
  else if (grade.includes("NA")){
    return mapping[17];
  }
  else{
    return mapping[18];
  }
}
function lookupNarrator(index){
  //returns data of the narrator with index from the narratorsData
  var found = narratorsData.find(function(element) {
    return element[0] == index;
  });
  if (!found){
    // else create a narrator data
    found = [index,index]
  }
  return found
}

function updateCount(data, source, target, hadith){
  // updates the count for [source, target, count] in data
  var found = false;
  var i = 0; 
  //TODO: Optimize this
  while(!found && i < data.length){
    if(data[i][0][0] == source[0] && data[i][1][0] == target[0]){
      // narrators index matches
      found = true;
      data[i][2]++; //increment count of the link
      data[i][3].push(hadith);
    }
    i++;
  }
  if (!found){
    // not found, so add a new link
    data.push([source, target, 1, [hadith]]);
    }
}
  function getIndex(key, graph){
    // returns the index of key in the graph
    // graph = [..., [[key, Sum(w[1],w[2] ...w[m])], [n1,w[1]], [n2,w[2]], ..., [nm,w[m]] ], ...]
    for(var i = 0; i < graph.length; i++){
      var vertix = graph[i][0][0];
      if (vertix == key) {
        return i;
      }
    }
    return -1;
  }

function isCyclicUtil(v, visited, recStack, graph){
  //console.log("visiting", v, visited);
  //mark as visited
  visited[v] = true;
  recStack[v] = true;
  var index = getIndex(v, graph);
  if (index >= 0) {
    var node = graph[index];
    for(var neighbour = 1; neighbour < node.length; neighbour++){
      if (!visited[node[neighbour][0]]) {
        if (isCyclicUtil(node[neighbour][0], visited, recStack, graph)){
          return true;
        }
      } else if (recStack[node[neighbour][0]] == true) {
        return true
      }
    }
  }
  recStack[v] = false;
  return false;
}

function isCyclic(graph){
  var visited = {}; // list of visited nodes
  var recStack = {};
  for (var n = 0; n < graph.length; n++){
    if(!visited[graph[n][0]]){
      if (isCyclicUtil(graph[n][0][0],visited,recStack, graph)){
        return true
      }
    }
  }
  return false;
}

function cycleFilter (edges){
  // edges = [..., [source, target, weight,[h1,h2...]], ...]
  var graph = []; // create an adjacency list of narrators indices graph
  var data = []; // to be returned as polished data
  for(var e = 0; e < edges.length; e++){
    // for each edge, add to graph, check if it creates a cycle
    var source = edges[e][0];
    var target = edges[e][1];
    var weight = edges[e][2];
    var hadiths = edges[e][3];
    var sourceIndex = getIndex(source[0] + " " + source[1].slice(0,20), graph);
    var targetIndex = getIndex(target[0] + " " + target[1].slice(0,20), graph);
    if (sourceIndex >= 0) {
      graph[sourceIndex].push([target[0] + " " + target[1].slice(0,20), weight, hadiths]);
    }
    else {
      sourceIndex = graph.length;
      graph.push([[source[0] + " " + source[1].slice(0,20),0],[target[0] + " " + target[1].slice(0,20), weight, hadiths]]);
    }

    if (isCyclic(graph)) {
      console.log("removing link as it creates a cycle", [source[0],target[0]])
      graph[sourceIndex].pop(); //remove point as it creates a cycle
    }
    else {
      if (targetIndex < 0) {
        targetIndex = graph.length;
        graph.push([[target[0] + " " + target[1].slice(0,20),0]]);
      }
      graph[targetIndex][0][1] += weight;
      graph[sourceIndex][0][1] += weight;
      //console.log(graph);
    }
  }

  return graph;
}

function getTeachers(narrator){
  if (narrator.length == 25){
    return narrator[16].split(", ");
  }
  return [];
} 

function getStudents(narrator){
  if (narrator.length == 25){
    return narrator[15].split(", ");
  }
  return [];
} 

function now() {
        return new Date().getTime();
    }

function process(array, callback){
  document.getElementById("btnMessage").innerHTML = "Start Processing...";
  var startTime = now();
  var tempData = [];
  var chunk = 300;
  var i = 1;
  function loop() {
    var cnt = chunk;
    while (cnt-- && i < array.length-1) {
      var hadith = array[i];
      var chain = hadith[6].split(", "); // list of chain of narrators in the sanad(index 6)
      if(chain.includes(input)){ // hadith has the Rawi(input)
        if (lookupNarrator(chain[0])) {
          updateCount(tempData, [array[i][2],""], lookupNarrator(chain[0]), hadith);
        }
        for(var n = 0; n < chain.length -1;n++) {
          var student = lookupNarrator(chain[n]); //get student details
          // TODO: optimize perfomance
          var teacher = lookupNarrator(chain[n+1]); //get teacher details
          if(student.length == 2) {
            // student is missing from the dataset
            console.log("narrator is missing", chain[n]);
          } else if (teacher.length == 2) {
            // teacher is missing from the dataset
            console.log("narrator is missing", chain[n+1]);
          }
          else{
            //confirm the chain of narration
            // this solves the case of a narration that has multiple shifts
            // example: A -> B -> C, B -> D, C ->E, D ->E
            // issue rises when processing C,B as C -> B
            var teachers = getTeachers(student); // get list of student teachers
            var students = getStudents(teacher); // get list of teacher students
            if (teachers.includes(chain[n+1]) || students.includes(chain[n]) || teachers.length == 0 || students.length == 0) { 
              // if one of them is in the data
              updateCount(tempData, student, teacher, hadith);
            }
          }
        }
      }
      ++i;
    }
    if ( i < array.length-1) {                      //the condition
      setTimeout(loop, 1); //rerun when condition is true
    } else { 
      callback(tempData);
      console.log("Done Processing in ...", now() - startTime);
    }
  }
  loop();                                         //start with 0
}

function afterProcess(temp){

  // sort data in decending order of importance
  temp.sort(function(a, b) {
    return b[2] - a[2];
    });
  
  //filter cycles and add lables
  var graph = cycleFilter(temp); // graph = [..., [[key, Sum(w[1],w[2] ...w[m])], [n1,w[1]], [n2,w[2]], ..., [nm,w[m]] [h1,h2...] ], ...]
  graph.sort(function(a, b) {
    return b[0][1] - a[0][1];
    });

  document.getElementById("btnMessage").innerHTML = "Total of Narrators: " + graph.length;
  var ready_data = [];
  graph = graph.slice(0, numNarrators);
  console.log(graph);

  for (var i = 0; i < graph.length; i++){
    for (var j = 1; j < graph[i].length; j++){
      if (getIndex(graph[i][j][0], graph) >= 0) {
        var tooltip = "<p>";
        for(var h = 0; h < graph[i][j][2].length; h++){
          tooltip += graph[i][j][2][h][7];
          tooltip += "<br>";
        }
        tooltip += "<p>";
        ready_data.push([graph[i][0][0], graph[i][j][0], graph[i][j][1], tooltip]);
      }
    }
  }

  var data = new google.visualization.DataTable();
  data.addColumn('string', 'From');
  data.addColumn('string', 'To');
  data.addColumn('number', 'Weight');
  data.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});
  data.addRows(ready_data);
  google.charts.setOnLoadCallback(drawChart(data));
  enableButton();
}
function main(hadithData){
  var arr = [];
  var num_books = 6;
  var books = {
    0: [1    , 7371],
    1: [7371 , 14967],
    2: [14967, 20227],
    3: [20227, 24441],
    4: [24441, 30215],
    5: [30215, 34443],
  }
  
  for (var i = 0; i < num_books; i++) {
    if(document.getElementById(i).checked){
      arr = arr.concat(hadithData.slice(books[i][0], books[i][1]));
    }
  }
  process(arr, afterProcess);
}

window.onload = function (){ document.getElementById("submit").click();}