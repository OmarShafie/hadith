//TODO: Take hadith-query from user
var args = [
  {
    "key": "hadith-query", 
    "default": "الاعمال بالنية", 
    "value": "الاعمال بالنية"
  },
  {
    "key": "numNarrators", 
    "default": "50",
    "value": "50"
  },
];

var hadithQuery = 0;
var numNarrators = 1;
var colorLinks = [];
function query(data, index){
  // hadith contains the hadith-query
  //return a list of chains
  var asaneed = [];
  var txt = simplifyArabic(getHadithTxt(data,index));
  if(txt.includes(simplifyArabic(args[hadithQuery]["value"]))){
    asaneed = getHadithAsaneed(data, index);
  }
  return asaneed;
}

/****************** Library **********************/
// Source: Kaggle Hadith Data Set  
var URL = "https://raw.githubusercontent.com/OmarShafie/hadith/master/"
var hadithURL = URL+"data/tutorial/data%20-%20data.csv";
var narratorsURL = URL+"data/tutorial/narrators-utf8.csv";

//Parse Parameters
var inputType = "remote";
var stepped = 0, rowCount = 0, errorCount = 0, firstError;
var start, end;
var firstRun = true;
var maxUnparseLength = 10000;

var isParsingDone = false;
var parsedData;

var HadithArr = [];
var result_graph = [];
var ready_data = [];
var data;
var first_layer_count = 0; // used as indication of height of sankey
var first_layer_total = 0;
var longest_sanad = 0;
$(function()
  {
	$('#rotate').click(
		function(){
			// flip
			var sankey = document.querySelector("#sankey_basic");
			if (isVertical){
				sankey.setAttribute('class','horizontal-sankey');
			}
			else {
				sankey.setAttribute('class','vertical-sankey');
			}
			isVertical = !isVertical;
			google.charts.setOnLoadCallback(drawChart(data));
		}
	)
  }
);

$(function()
  {
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
      
      for (var p = 0; p < args.length;p++){
        args[p]["value"] = document.getElementById(args[p]["key"]).value;
        if (args[p]["value"] == ""){
          args[p]["value"] = args[p]["default"];
        }
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
  enableButton();;
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

/*-------------- Graph bulild functions ------------*/
function updateCount(data, source, target, hadith){
  // updates the count for [source, target, count,[h1,h2...]] in data
  var found = false;
  var i = 0; 
  //TODO: Optimize this
  while(!found && i < data.length){
    if(data[i][0] == source && data[i][1] == target){
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
    var sourceIndex = getIndex(source, graph);
    var targetIndex = getIndex(target, graph);
    if (sourceIndex >= 0) {
      graph[sourceIndex].push([target, weight, hadiths]);
    }
    else {
      sourceIndex = graph.length;
      graph.push([[source,0],[target, weight, hadiths]]);
    }

    if (isCyclic(graph)) {
      console.log("removing link as it creates a cycle", [source, target])
      graph[sourceIndex].pop(); //remove point as it creates a cycle
    }
    else {
      if (targetIndex < 0) {
        targetIndex = graph.length;
        graph.push([[target,0]]);
      }
      graph[targetIndex][0][1] += weight;
      graph[sourceIndex][0][1] += weight;
    }
  }

  return graph;
}


/*-------------- Data functions -------------*/
function getHadithNum(data, index){
  return data[index][0];
}
function getTitle(data, index){
  return data[index][1];
}
function getHadithTxt(data, index){
  return data[index][2];
}

function parseNarrative(segments){
	var term_index = 3;
	var narrator_index = 8;
	if (segments.length < 11){
		term_index = 1;
		narrator_index = 4;
	}
	var term = simplifyArabic(segments[term_index]);
	var narrator = segments[narrator_index].match(/ربط="(.*)"/)[0].split('"')[1];
	return [term, narrator]
}
function oneIndex(str, m, i){
	return m.index + 1;
}

function overlapMatching(str, regexps, nextStartIndexFn){
	var res = [];
	var minStrIndex = str.length;
	var minReIndex = -1;
	var matching = [];
	for(var i = 0;i < regexps.length;i++){
		var m = regexps[i].exec(str);
		var index = m.index;
		matching.push(m);
		if (index < minStrIndex) {
			minStrIndex = index;
			minReIndex = i;
		}
	}
	if (minReIndex >= 0){
		var m = matching[minReIndex]; 
		res = res.concat(overlapMatching(str.slice(nextStartIndexFn(str, m, minReIndex)),regexps, nextStartIndexFn));
	}
	return res;
}

function getHadithXML(data, index){
  var xml = data[index][3];
  xml = xml.replace(/&gt;/g,">\n").replace(/&lt;/g,"\n<");
  console.log(xml);
  console.log(getHadithAsaneed(data, index));
  var narratorTerm = '(<راوي(.*)>\n(.*)\n</راوي>\n(\n<مصطلح_صيغ(.*)">\n)?\n<صيغة_تحديث>\n(.*)\n</صيغة_تحديث>)';
  var termNarrator = '(<صيغة_تحديث>\n(.*)\n</صيغة_تحديث>\n(\n<\/مصطلح_صيغ>\n)?\n<راوي(.*)>\n(.*)\n<\/راوي>)';
  var isnad = Array.from(xml.matchAll(termNarrator+"|"+narratorTerm,"g"), m => m[0].split("\n"));
  console.log(isnad);
  var parsed = {
    'xml': xml,
    'رقم_حديث نوع="حرف"': xml.match(/<رقم_حديث نوع="حرف">\n(.)* \n<\/رقم_حديث>/)[0].split("\n")[1],
    'رقم_حديث نوع="مطبوع"': xml.match(/<رقم_حديث نوع="مطبوع">\n(.)* \n<\/رقم_حديث>/)[0].split("\n")[1],
    'تخصيص': xml.match(/<حديث تخصيص="(.*)" نوع="(.*)">/)[0].split('"')[1],
    'نوع': xml.match(/<حديث تخصيص="(.*)" نوع="(.*)">/)[0].split('"')[3],
    //'اسناد': xml.match(/<مصطلح_صيغ ربط="(.*)">\n(.*)\n<صيغة_تحديث>\n(.*)\n<\/صيغة_تحديث>\n(.*)\n<\/مصطلح_صيغ>\n(.*)\n<راوي (.*)>\n(.*)\n<\/راوي>|<صيغة_تحديث>\n(.*)\n<\/صيغة_تحديث>\n(.*)\n<راوي (.*)>\n(.*)\n<\/راوي>/g).map(x => parseNarrative(x.split("\n"))),
    'اسناد': isnad,
	//'متن': "",
    'طرف': simplifyArabic(xml.match(/<طرف>\n(.*)\n<\/طرف>\n/)[0].split('\n')[1]),
  }
  return parsed;
}
function getHadithAsaneed(data, index){
  var s = data[index][4].replace(/'/g, "").replace(/s/g, "").split(",");
  for (var chain = 0; chain < s.length; chain++){
    s[chain] = s[chain].split("%5C%5C");
  }
  return s
}

function recursiveSearch(arr, x, start, end, cmpFn) {
	// Base Condition 
	if (start > end) return -1; 
   
	// Find the middle index 
	let mid=Math.floor((start + end)/2);
   
	// Compare mid with given key x 
	var cmp = cmpFn(arr[mid],x);//
	if (cmp == 0) return mid; 
		  
	// If element at mid is greater than x, 
	// search in the left half of mid 
	if(cmp > 0)  
		return recursiveSearch(arr, x, start, mid-1, cmpFn); 
	else
  
		// If element at mid is smaller than x, 
		// search in the right half of mid 
		return recursiveSearch(arr, x, mid+1, end, cmpFn); 
}

function lookupNarrator(id){
	//returns data of the narrator with index from the narratorsData, Binary Search Algorithm
	var found = recursiveSearch(narratorsData, id, 0, narratorsData.length-1, function(x,y) { return parseInt(x[0]) - parseInt(y);});
	if (found == -1){
		// else create a narrator data
		return [id,id]
	}
  return narratorsData[found];
}

function lookupHadith(id){
	//returns data of the narrator with index from the narratorsData, Binary Search Algorithm
	var found = recursiveSearch(HadithArr, id, 0, HadithArr.length-1, function(x,y) { return parseInt(x[0]) - parseInt(y);});
	if (found == -1){
		// else create a narrator data
		return []
	}
  return HadithArr[found];
}


function getNarratorGrade(index){
  var narrator = lookupNarrator(index);
  if (narrator.length === 3) {
	return narrator[2];
  }
  return "NA";
}

function getNarratorFromName(tag){
	return tag.split(" ")[0];
}

function gradeAnalysis(){
  /* ANALYSIS OF GRADES */
   var grades = {
		1 : [0, []],
		2 : [0, []],
		3 : [0, []],
		4 : [0, []],
		5 : [0, []],
		6 : [0, []],
		7 : [0, []],
		8 : [0, []],
		9 : [0, []],
		10: [0, []],
		11: [0, []],
		12: [0, []],
		13: [0, []],
		14: [0, []],
		15: [0, []],
	  };
  for (var narr = 0; narr < narratorsData.length; narr++){
	  var origin_grade = narratorsData[narr][2];
	  var grade = simplifyArabic(origin_grade);
	
	
	if (grade.includes("كذب")){
	grades[12][0]++;
	grades[12][1].push(origin_grade);
	}
	
	else if (grade.includes("متروك") || grade.includes("منكر")){
	grades[11][0]++;
	grades[11][1].push(origin_grade);
	}
	else if (grade.includes("تغير ") || grade.includes("اختلط") || grade.includes("وخلط ")){
	grades[7][0]++;
	grades[7][1].push(origin_grade);
	}
	else if (grade.includes("دلس") || grade.includes("تدليس")){
	grades[8][0]++;
	grades[8][1].push(origin_grade);
	}
	else if (grade.includes("ثقه ثبت")  || grade.includes("حافظ") || grade.includes("ثقه ثقه") || grade.includes("ثقه ضابط") || grade.includes("امام")){
	grades[2][0]++;
	grades[2][1].push(origin_grade);
	}
	else if (grade.includes("ثقه")){
	grades[4][0]++;
	grades[4][1].push(origin_grade);
	}
	else if (grade.includes("ضعيف") || grade.includes(" ضعف")){
	grades[10][0]++;
	grades[10][1].push(origin_grade);
	}
	else if (grade.includes("مجهول") || grade.includes("مستور") || grade.includes("لا يعرف")|| grade.includes("لا تعرف") || grade.includes("مختلف في صحبته")){
	grades[13][0]++;
	grades[13][1].push(origin_grade);
	}
	else if (grade.includes("لين") && !grade.includes("اولين")){
	grades[9][0]++;
	grades[9][1].push(origin_grade);
	}
	
	else if (grade.includes("صدوق")){
	grades[5][0]++;
	grades[5][1].push(origin_grade);
	}
	
	else if (grade.includes("صدوق")){
	grades[3][0]++;
	grades[3][1].push(origin_grade);
	}
	
	else if (grade.includes("مقبول" ) || grade.includes("شیخ ") || grade.includes(" باس") ){
	grades[6][0]++;
	grades[6][1].push(origin_grade);
	}
	else if (grade === ""){
	grades[15][0]++;
	grades[15][1].push(origin_grade);
	}
	else if (grade.includes("صحابي") || grade.includes("صحابه") || grade.includes("صحبه") || grade.includes("صحابيه ") || grade.includes("ام المومنين")){//for order preference
	grades[1][0]++;
	grades[1][1].push(origin_grade);
	}
	else{ //Other
	grades[14][0]++;
	grades[14][1].push(origin_grade);
	}
  }
  console.log(grades);
}

function gradeToColor(grade){
	var mapping = {
		1 : "darkgreen",
		2 : "seagreen",
		3 : "mediumseagreen",
		4 : "springgreen",
		5 : "greenyellow",
		6 : "yellow",
		7 : "gold",
		8: "coral",
		9: "lightcoral",
		10: "red",
		11: "crimson",
		12: "maroon",
		13: "silver",
		14: "lightslategray",
		15: "darkslategray",
	  };
	grade = simplifyArabic(grade);
	if (grade.includes("كذب")){
		return mapping[12];
	}
	
	else if (grade.includes("متروك") || grade.includes("منكر")){
		return mapping[11];
	}
	
	else if (grade.includes("تغير ") || grade.includes("اختلط") || grade.includes("وخلط ")){
		return mapping[7];
	}
	
	else if (grade.includes("دلس") || grade.includes("تدليس")){
		return mapping[8];
	}
	else if (grade.includes("ثقه ثبت")  || grade.includes("حافظ") || grade.includes("ثقه ثقه") || grade.includes("ثقه ضابط") || grade.includes("امام")){
		return mapping[2];
	}
	else if (grade.includes("ثقه")){
		return mapping[4];
	}
	else if (grade.includes("ضعيف") || grade.includes(" ضعف")){
		return mapping[10];
	}
	else if (grade.includes("مجهول") || grade.includes("مستور") || grade.includes("لا يعرف")|| grade.includes("لا تعرف") || grade.includes("مختلف في صحبته") ){
		return mapping[13];
	}
	else if (grade.includes("لين") && !grade.includes("اولين")){
		return mapping[9];
	}
	
	else if (grade.includes("صدوق")){
		return mapping[5];
	}
	else if (grade.includes("مخضرم")){
		return mapping[3];
	}
	else if (grade.includes("مقبول" ) || grade.includes("شيخ ") || grade.includes(" باس") ){
		return mapping[6];
	}
	else if (grade.includes("صحابي") || grade.includes("صحابه") || grade.includes("صحبه") || grade.includes("صحابيه ") || grade.includes("ام المومنين")){//for order preference
		return mapping[1];
	}
	else if (grade === ""){
		return mapping[15];
	}
	else{ //Other
		return mapping[14];
	}
}
/* ---------- Utility functions --------*/
function now() {
  return new Date().getTime();
}

var arabicNormChar = {
    'ك': 'ك',
	'ﻷ': 'لا',
	'ؤ': 'و',
	'ی': 'ي',
	'ي': 'ي',
	'ئ': 'ي',
	'ى': 'ى',
	'أ': 'ا',
	'إ': 'ا',
	'آ': 'ا',
	'ٱ': 'ا',
	'ٳ': 'ا',
	'ة': 'ه',
	'ص': 'ص',
	'ح': 'ح',
	'ض': 'ض',
	'ع': 'ع',
	'ف': 'ف',
	'ح': 'ح',
	'ء': '',
	'ِ': '',
	'ْ': '', 
	'ُ': '',
	'َ': '',
	'ّ': '',
	'ٍ': '',
	'ً': '',
	'ٌ': '',
	'ٓ': '',
	'ٰ': '',
	'ٔ': '',
	'،': '',
	'.': '',
	'�': ''
}
function stripHtml(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

var simplifyArabic  = function (str) {
    return stripHtml(str.replace(/[^\u0000-\u007E]/g, function(a){
        var retval = arabicNormChar[a];
        if (retval == undefined) {retval = a}
        return retval; 
    }).normalize('NFKD').toLowerCase()).replace(/ +(?= )/g,'');
}

//now you can use simplifyArabic(str) on Arabic strings to remove the diacritics

/*-------------- Main Code -------------*/
function process(array, callback){
  document.getElementById("btnMessage").innerHTML = "Start Processing...";
  var startTime = now();
  var tempData = []; //to be passed to after process
  var chunk = 300;
  var i = 0;
  var counter = 0;
  longest_sanad = 0;
  
  function loop() {
    var cnt = chunk;
    while (cnt-- && i < array.length-1) {
      var hadithId = i;
      var chains = query(array,hadithId);
      for(var c = 0; c < chains.length; c++){
        var sanad = chains[c];
		longest_sanad = (sanad.length > longest_sanad)?sanad.length:longest_sanad;
        for(var n = 0; n < sanad.length -1;n++) {
          updateCount(tempData, sanad[n+1], sanad[n], hadithId);
        }
      }
      ++i;
    }
    if ( i < array.length-1) {                      //the condition
      setTimeout(loop, 1); //rerun when condition is true
    } else { 
      document.getElementById("btnMessage").innerHTML = "Done in ..."+ ((now() - startTime)/1000 + " seconds");

      callback(tempData);
    }
  }
  loop();                                         //start with 0
}


function afterProcess(temp){
	
	ready_data = [];
	colorLinks = [];
  // sort data in decending order of importance, i.e number of ahadith
  // this is used so that only least important cyclic edges are removed 
  temp.sort(function(a, b) {
    return b[2] - a[2];
    });
  
  //filter cycles and add lables
  result_graph = cycleFilter(temp); // graph = [..., [[key, Sum(w[1],w[2] ...w[m])], [n1,w[1]], [n2,w[2]], ..., [nm,w[m]] [h1,h2...] ], ...]
  
  result_graph.sort(function(a, b) { //Sort by total sum of out weights
    return b[0][1] - a[0][1];
    });

  document.getElementById("btnMessage").innerHTML += "<br>    Total of Narrators: " + result_graph.length;
  result_graph = result_graph.slice(0, parseInt(args[numNarrators]["value"]));


  first_layer_count = 0; // used as indication of height of sankey
  first_layer_total = 0;
  
  var names = [];
  for (var i = 0; i < result_graph.length; i++){
	var node = result_graph[i];
	var narrator = lookupNarrator(node[0][0]);
	var name = narrator[1].split(" ").slice(0,4).join(' ');
	var s = narrator[0] +" "+ name;
	names.push(s);
  }
  
  for (var i = 0; i < result_graph.length; i++){
    var node = result_graph[i];
    var nodeInd = getIndex(node[0][0], result_graph);
    for (var j = 1; j < node.length; j++){ //Out neighbors
      var index = getIndex(node[j][0], result_graph);
      if (index >= 0) {
        var tooltip = '<table dir="rtl"><thead><tr>';
        tooltip += '<th dir="rtl">'+names[index]+"<---("+node[j][2].length+")---"+names[nodeInd]+'</th>';
        //tooltip += '<th dir="ltr">Chain</th>';
        //tooltip += '<th dir="ltr">Id</th>';
        tooltip += '</tr></thead><tbody>';
        for(var h = 0; h < node[j][2].length; h++){
          var hadith = node[j][2][h];
          tooltip += "<tr><td dir='rtl' onClick='console.log(getHadithXML(HadithArr, "+hadith+"))'>";
		  
          tooltip += "<h6>"+getTitle(HadithArr, hadith)+"</h6>";
          tooltip += getHadithTxt(HadithArr, hadith);
          tooltip += "</td>";

          /*Debugging tooltip += "<td>";
          tooltip += getHadithAsaneed(HadithArr, hadith).join().replace(/,/g, "<br>");
          tooltip += "</td>";

          tooltip += "<td>";
          tooltip += getHadithNum(HadithArr, hadith);
          tooltip += "</td>";*/

        }
        tooltip += "</tbody></table>";
        ready_data.push([names[nodeInd], names[index], node[j][1],tooltip]);
        colorLinks.push(gradeToColor(getNarratorGrade(getNarratorFromName(names[nodeInd]))));

        if (names[nodeInd].split(' ')[0] == '5495') {
          first_layer_count += 1;
		  first_layer_total += node[j][1];
        }
      }
    }
  }
  data = data = new google.visualization.DataTable();
  data.addColumn('string', 'From');
  data.addColumn('string', 'To');
  data.addColumn('number', 'Weight');
  data.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});
  data.addRows(ready_data);
  google.charts.setOnLoadCallback(drawChart(data, first_layer_count, first_layer_total));
  enableButton();
}

  
function main(hadithData){
  HadithArr = [];
  var num_books = 1;
  // TODO: Check book Indices
  var books = {
    0: [1    , 7371],
    1: [7371 , 14967],
    2: [14967, 20227],
    3: [20227, 24441],
    4: [24441, 30215],
    5: [30215, 34443],
  }
  
  for (var i = 0; i < num_books; i++) {
    if(document.getElementById(i).selected){
      HadithArr = HadithArr.concat(hadithData.slice(books[i][0], books[i][1]));
    }
  }
  process(HadithArr, afterProcess);
  
}

window.onload = function (){ document.getElementById("submit").click(); openSearch()}
