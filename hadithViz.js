//TODO: Take hadith-query from user
var args = [
  {
    key: "pattern-query",
    default: "",
    value: ""
  },
  {
    key: "hadith-query",
    default: "",
    value: ""
  },
  {
    key: "numNarrators",
    default: "100",
    value: "100"
  }
];

var patternQuery = 0;
var hadithQuery = 1;
var numNarrators = 2;
var colorLinks = [];
var processingSanad;
var matching_hadiths = [];
var num_books = 9;
var BOOK_COMPILERS = [["5495"], ["6116"], ["5361"],["9712"],["2577"],["10859"],["3741"],["13950","10935"],["484"]]; //This must be in-order
var align_reward = 4 , align_mispen = 2, align_gappen = 1, align_skwpen = 1;
/*-------------- Main Code -------------*/
window.onload = function () {
  document.getElementById("submit").click();
  openSearch();
};

//1. Retrieval Process
function main() {
  /* This is the first function, it will decide which books are included 
   * from the hadith data from the selected books.
   */

  if(inputType == "remote"){
    HadithArr = [];
    // TODO: Check book Indices
    var books = {
      0: [1, 7411],
      1: [7411, 15076],
      2: [15076, 16857],
      3: [16857, 22637],
      4: [22637, 27897],
      5: [27897, 32309],
      6: [32309, 35850],
      7: [35850, 40317],
      8: [40317, 68561]
    };

    for (var i = 0; i < num_books; i++) {
      if (document.getElementById(i).selected) {
        HadithArr = HadithArr.concat(hadithData.slice(books[i][0], books[i][1]));
      }
    }
  }
  else {
    HadithArr = hadithData.slice()
  }
  
  process(HadithArr, afterProcess);
}

function process(array, callback) {
  /* Given a list of the hadith rows, this function will loop over those hadith
   * and filter the oncs that match the criteria set in the query function
   */
  document.getElementById("btnMessage").innerHTML = "Start Processing...";
  matching_hadiths = [];
  var startTime = now();
  var chunk = 300;
  var i = 0;
  longest_sanad = 0;

  function loop() {
    /* The way this loop is constructed is to allow the asynchronous of js */
    var cnt = chunk;
    while (cnt-- && i < array.length - 1) {
      var hadithId = i;
      var chains = query(array, hadithId, false);
      if (chains && chains.length) {
        matching_hadiths.push([hadithId, chains]);
      }
      i++;
    }
    if (i < array.length - 1) {
      //the condition
      setTimeout(loop, 1); //rerun when condition is true
    } else {
      callback();
      document.getElementById("btnMessage").innerHTML =
        "Done in " + ((now() - startTime) / 1000 + " seconds");
    }
  }
  loop(); //start with 0
}

function query(data, index, onTakhreej) {
  /* Given a data array and the index of a hadith, it will return the chains
   * of the hadith that match the criteria on both the text and the chains
   * TODO: it will chech for criteria on the takhreeg 
   */
  try {
    if (args[hadithQuery]["value"] == "" && args[patternQuery]["value"] == "") {
      throw { message: "Please enter some keywords" };
    } else {
      // hadith contains the hadith-query
      //return a list of chains
      var txt = simplifyArabic(getHadithTxt(data, index));
      var chains = [];
      //var re = new RegExp(simplifyArabic(args[hadithQuery]["value"]), "g");

      if (onTakhreej || txt.includes(simplifyArabic(args[hadithQuery]["value"]))) {
        var asaneed = getHadithAsaneed(data, index);
        for (var i = 0; i < asaneed.length; i++) {
          processingSanad = asaneed[i];
          if (
            args[patternQuery]["value"] == "" ||
            QueryParser.parse(args[patternQuery]["value"])
          ) {
            chains.push(processingSanad);
          }
        }
      }
      document.getElementById("pattern-error").innerHTML = "";
      return chains;
    }
  } catch (e) {
    document.getElementById("pattern-error").innerHTML = buildErrorMessage(e);
  }
}

function afterProcess() {
  /* This function will be called to generate the data to be displayed
   * per mathched hadith
   */
  var list = "";
  for (var i = 0; i < matching_hadiths.length; i++) {
    var list = '<table dir="rtl"><thead><tr>';
    list +=
      '<th dir="rtl"> Matched Ahadith:' + matching_hadiths.length + "</th>";
    list += "</tr></thead><tbody>";
    for (var h = 0; h < matching_hadiths.length; h++) {
      var hadith = matching_hadiths[h][0];
      list +=
        "<tr><td dir='rtl' onClick='loadHadith("+ hadith +")'>";

      list += "<h6>" + getTitle(HadithArr, hadith) + "</h6>";
      list += getHadithTxt(HadithArr, hadith);
      list += "</td>";
    }
    list += "</tbody></table>";
  }
  document.getElementById("resultTable").innerHTML = list;

  enableButton(true);
}

//2. Draw Process
function prepareData() {
  /* This will be called by clicking on the draw button, it will create a 
   * tempData, that has all of the rows of the sankey. 
   */
  var tempData = [];
  var chunk = 300;
  var i = 0;

  function loop() {
    var cnt = chunk;
    while (cnt-- && i < matching_hadiths.length) {
      var hadithId = matching_hadiths[i][0];
      var chains = matching_hadiths[i][1];
      for (var c = 0; c < chains.length; c++) {
        var sanad = chains[c];
        // take the first element of the takhreeg group is enough to indicate uniqueness
        var hadith_takhreeg = getTakhreegByID(takhreegData, getHadithNum(HadithArr, hadithId));
        var matn = hadith_takhreeg.length? getTakhreegIDs(hadith_takhreeg)[0]: "";
        var channel = (colorLinksBySanad()? sanad :
                                            (colorLinksByMatn()? matn : ""));
        for (var n = 0; n < sanad.length - 1; n++) {
          updateCount(tempData, sanad[n + 1], sanad[n], hadithId, channel.toString());
        }
      }
      i++;
    }
    if (i < matching_hadiths.length - 1) {
      //the condition
      setTimeout(loop, 1); //rerun when condition is true
    } else {
      drawSankey(tempData);
    }
  }
  loop(); //start with 0
}

function updateCount(data, source, target, hadith, channel) {
  // updates the count for [source, target, count,[h1,h2...]] in data
  var found = false;
  var i = 0;
  //TODO: Optimize this
  while (!found && i < data.length) {
    if (data[i][0] === source                                                && 
        data[i][1] === target                                                && 
        (data[i][4] === channel || (colorLinksBySanad() && colorLinksByMatn()))) {
      // narrators index matءches
      found = true;
      data[i][2]++; //increment count of the link
      data[i][3].push(hadith);
    }
    i++;
  }
  if (!found) {
    // not found, so add a new link
    data.push([source, target, 1, [hadith], channel]);
  }
}

function drawSankey(tempData) {
  links = [];
  colorBlindPool  = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000'];
  bluePurpleShades = ['#00aba9','#1ba1e2','#0050ef','#6a00ff','#aa00ff','#f472d0','#d80073','#76608a',"#00ffff","#191970","#663399","#6863D4","#8B008B","#9370DB","#AFEEEE","#ba55d3","#C71585","#da70d6","#db7093","#8e4585","#FA8072","#FF69B4","#FFC0CB","#0000cd",]
  very_large_color_set = ["#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
        "#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
        "#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
        "#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
        "#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
        "#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
        "#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
        "#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C",
        
        "#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81",
        "#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00",
        "#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700",
        "#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329",
        "#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98", "#A4E804", "#324E72", "#6A3A4C",
        "#83AB58", "#001C1E", "#D1F7CE", "#004B28", "#C8D0F6", "#A3A489", "#806C66", "#222800",
        "#BF5650", "#E83000", "#66796D", "#DA007C", "#FF1A59", "#8ADBB4", "#1E0200", "#5B4E51",
        "#C895C5", "#320033", "#FF6832", "#66E1D3", "#CFCDAC", "#D0AC94", "#7ED379", "#012C58",
        
        "#7A7BFF", "#D68E01", "#353339", "#78AFA1", "#FEB2C6", "#75797C", "#837393", "#943A4D",
        "#B5F4FF", "#D2DCD5", "#9556BD", "#6A714A", "#001325", "#02525F", "#0AA3F7", "#E98176",
        "#DBD5DD", "#5EBCD1", "#3D4F44", "#7E6405", "#02684E", "#962B75", "#8D8546", "#9695C5",
        "#E773CE", "#D86A78", "#3E89BE", "#CA834E", "#518A87", "#5B113C", "#55813B", "#E704C4",
        "#00005F", "#A97399", "#4B8160", "#59738A", "#FF5DA7", "#F7C9BF", "#643127", "#513A01",
        "#6B94AA", "#51A058", "#A45B02", "#1D1702", "#E20027", "#E7AB63", "#4C6001", "#9C6966",
        "#64547B", "#97979E", "#006A66", "#391406", "#F4D749", "#0045D2", "#006C31", "#DDB6D0",
        "#7C6571", "#9FB2A4", "#00D891", "#15A08A", "#BC65E9", "#FFFFFE", "#C6DC99", "#203B3C",

        "#671190", "#6B3A64", "#F5E1FF", "#FFA0F2", "#CCAA35", "#374527", "#8BB400", "#797868",
        "#C6005A", "#3B000A", "#C86240", "#29607C", "#402334", "#7D5A44", "#CCB87C", "#B88183",
        "#AA5199", "#B5D6C3", "#A38469", "#9F94F0", "#A74571", "#B894A6", "#71BB8C", "#00B433",
        "#789EC9", "#6D80BA", "#953F00", "#5EFF03", "#E4FFFC", "#1BE177", "#BCB1E5", "#76912F",
        "#003109", "#0060CD", "#D20096", "#895563", "#29201D", "#5B3213", "#A76F42", "#89412E",
        "#1A3A2A", "#494B5A", "#A88C85", "#F4ABAA", "#A3F3AB", "#00C6C8", "#EA8B66", "#958A9F",
        "#BDC9D2", "#9FA064", "#BE4700", "#658188", "#83A485", "#453C23", "#47675D", "#3A3F00",
        "#061203", "#DFFB71", "#868E7E", "#98D058", "#6C8F7D", "#D7BFC2", "#3C3E6E", "#D83D66",
        
        "#2F5D9B", "#6C5E46", "#D25B88", "#5B656C", "#00B57F", "#545C46", "#866097", "#365D25",
        "#252F99", "#00CCFF", "#674E60", "#FC009C", "#92896B"];

  colorPool  = friendlyColor()? colorBlindPool: very_large_color_set;

  //filter cycles and add lables
  // graph = [..., [[key, Sum(w[1],w[2] ...w[m])], [n1,w[1]], [n2,w[2]], ..., [nm,w[m]] [h1,h2...] ], ...]
  result_graph = build_graph(tempData); 
  document.getElementById("btnMessage").innerHTML =
    "<br>    Total of Narrators: " + result_graph.length;

  //result_graph = result_graph.slice(0, parseInt(args[numNarrators]["value"]));


  layers_count = new Array(longest_sanad +1); // used as indication of height of sankey
  for(var l = 0; l <= longest_sanad; l++){
    layers_count[l] = [];
  }

  // set the lables of the nodes
  var names = [];
  for (var i = 0; i < result_graph.length; i++) {
    var node = result_graph[i];
    var narrator = lookupNarrator(node[0][0]);
    console.log(narrator);
    var name = narrator['name']
      .split(" ")
      .slice(0, 4)
      .join(" ");
    var s = narrator['rawi_index'] + " " + name;
    names.push(s);
  }

  var color_assignments = [];
  var hadiths_in_link = [];
  for (var i = 0; i < result_graph.length; i++) {
    var node = result_graph[i];
    layers_count[node[0][3]].push(node[0][0]);
    for (var j = 1; j < node.length; j++) {
      hadiths_in_link.push(node[j][2]);
      //Out neighbors
      var index = getIndex(node[j][0], result_graph);
      if (index >= 0) {
        var tooltip = '<table dir="rtl"><thead><tr>';
        tooltip +=
          '<th dir="rtl">' +
          names[index] +
          "<---(" +
          node[j][2].length +
          ")---" +
          names[i] +
          "</th>";
        //tooltip += '<th dir="ltr">Chain</th>';
        //tooltip += '<th dir="ltr">Id</th>';
        tooltip += "</tr></thead><tbody>";
        var hadith_set = []; //no duplicates are allowed
        for (var h = 0; h < node[j][2].length; h++) {
          var hadith = node[j][2][h];
          if(!hadith_set.includes(hadith)){
            hadith_set.push(hadith);
            tooltip +=
              "<tr><td dir='rtl' onClick='loadHadith(" + hadith + ")'>";

            tooltip += "<h6>" + getTitle(HadithArr, hadith) + "</h6>";
            tooltip += getHadithTxt(HadithArr, hadith);
            tooltip += "</td>";
          }
        }
        tooltip += "</tbody></table>";
        var row = [names[index], names[i], node[j][1], tooltip];
        var channel = node[j][3];
        links.push([row, colorPool[getColorAssignment(color_assignments, channel) % colorPool.length],node[j][2]]);
      }
    }
  }

  //sort by longest chain length first, then 
  links.sort(function (a,b){ return sort_longest(a, b, hadiths_in_link);});

  ready_data = [];
  colorLinks = [];
  for(var i = 0;i < links.length;i++){
    ready_data.push(links[i][0]);
    colorLinks.push(links[i][1]);
  }

  data = new google.visualization.DataTable();
  data.addColumn("string", "From");
  data.addColumn("string", "To");
  data.addColumn("number", "Weight");
  data.addColumn({ type: "string", role: "tooltip", p: { html: true } });
  data.addRows(ready_data);
  google.charts.setOnLoadCallback(
    drawChart(data)
  );
  if(colorLinksBySanad() && colorLinksByMatn()){
    document.getElementById("card").style.setProperty("visibility", "visible");
    stringalign(matching_hadiths, color_assignments, -1.0*align_reward, 1.0*align_mispen, 1.0*align_gappen, 1.0*align_skwpen);
  }
  else {
    document.getElementById("card").style.setProperty("visibility", "hidden");
  }

  enableButton(true);
}

function getColorAssignment(assignments, key){
  var index = assignments.indexOf(key);
  if (index >= 0){
    return index
  }
  assignments.push(key);
  return assignments.length -1
}

/*-------------- Graph bulild functions ------------*/
function getIndex(key, graph) {
  // returns the index of key in the graph
  // graph = [..., [[key, Sum(w[1],w[2] ...w[m])], [n1,w[1]], [n2,w[2]], ..., [nm,w[m]] ], ...]
  for (var i = 0; i < graph.length; i++) {
    var vertix = graph[i][0][0];
    if (vertix == key) {
      return i;
    }
  }
  return -1;
}


function get_parents(key, graph){
  var parents = [];
  for (var i = graph.length - 1; i >= 0; i--) {
    var node = graph[i];
    for (var n = node.length - 1; n >= 1; n--) {
      if(node[n][0] === key){
        parents.push(node[0][0]);
      }
    }
  }
  return parents;
}

function isCyclicUtil(v, visited, recStack, graph) {
  //mark as visited
  visited[v] = true;
  recStack[v] = true;
  var index = getIndex(v, graph);
  if (index >= 0) {
    var node = graph[index];
    for (var neighbour = 1; neighbour < node.length; neighbour++) {
      if (!visited[node[neighbour][0]]) {
        if (isCyclicUtil(node[neighbour][0], visited, recStack, graph)) {
          return true;
        }
      } else if (recStack[node[neighbour][0]] == true) {
        return true;
      }
    }
  }
  recStack[v] = false;
  return false;
}

function isCyclic(graph) {
  var visited = {}; // list of visited nodes
  var recStack = {};
  for (var n = 0; n < graph.length; n++) {
    if (!visited[graph[n][0]]) {
      if (isCyclicUtil(graph[n][0][0], visited, recStack, graph)) {
        return true;
      }
    }
  }
  return false;
}

function cycleFilter(edges) {

  // edges = [..., [source, target, weight,[h1,h2...]], ...]
  var graph = []; // create an adjacency list of narrators indices graph
  var data = []; // to be returned as polished data
  for (var e = 0; e < edges.length; e++) {
    // for each edge, add to graph, check if it creates a cycle
    var source  = edges[e][0];
    var target  = edges[e][1];
    var weight  = edges[e][2];
    var hadiths = edges[e][3];
    var channel = edges[e][4];
    var sourceIndex = getIndex(source, graph);
    var targetIndex = getIndex(target, graph);
    if (sourceIndex >= 0) {
      graph[sourceIndex].push([target, weight, hadiths, channel]);
      graph[sourceIndex][0][1] += weight;
    } else {
      sourceIndex = graph.length;
      graph.push([
        [source, weight],
        [target, weight, hadiths, channel]
      ]);
    }

    if (isCyclic(graph)) {
      alert("Cycle detected!");
      console.log("removing link as it creates a cycle", [source, target]);
      graph[sourceIndex].pop(); //remove point as it creates a cycle
    } else {
      if (targetIndex < 0) {
        targetIndex = graph.length;
        graph.push([[target, weight]]);
      }
    }
  }
  return graph;
}

function get_roots(graph){
  var roots = [];
  for (var i = graph.length - 1; i >= 0; i--) {
    var narrator = graph[i][0][0];
    if(get_parents(narrator, graph).length == 0){
      roots.push(i);
    }
  }
  return roots;
}

function build_graph(edges) {
  // graph = [..., [[key, Sum(w[1],w[2] ...w[m])], [n1,w[1]], [n2,w[2]], ..., [nm,w[m]] ], ...]
  var graph = cycleFilter(edges);
  ongest_sanad = 0;
  /* Adjust the weights of the graph to scale first layer to
   * Sqrt(c * n * lon(n)) and propagete the sum through the layers.
   */
  if(colorLinksBySanad() && colorLinksByMatn()){
    graph = updateChannelsBySegments(graph);
  }
  var c = 1000; //constnant value 
  var roots = get_roots(graph);
  //A Queue to manage the nodes that have yet to be visited
  var queue = [];
  //A boolean array indicating whether we have already visited a node
  var visited_ancistors = [];

  //weights
  for (var i = 0; i < graph.length; i++) {
    graph[i][0].push(0);
    visited_ancistors.push(0);
  }
  for (var r = 0; r < roots.length; r++) {
    for (var neighbor = 1; neighbor < graph[roots[r]].length; neighbor++) {
        var w = graph[roots[r]][neighbor][1];
        var neighbor_index = getIndex(graph[roots[r]][neighbor][0], graph);
        var formula = logScale()? Math.sqrt(c * Math.log(w+1)): w;
        visited_ancistors[neighbor_index] += 1;
        graph[neighbor_index][0][2] += formula;
        graph[roots[r]][0][2]       += formula;
        graph[roots[r]][neighbor][1] = formula;
         // possible that another root has already visited
        if (visited_ancistors[neighbor_index] === get_parents(graph[roots[r]][neighbor][0], graph).length) {
          queue.push(neighbor_index);
          graph[neighbor_index][0].push(1);
        }
      }    
    graph[roots[r]][0].push(0);
  }
  //While there are nodes left to visit...
  while (queue.length) {
      var node = queue.shift();
      var check_sum = 0;
      for (var neighbor = 1; neighbor < graph[node].length; neighbor++) {
        var neighbor_index = getIndex(graph[node][neighbor][0], graph);
        var frac = graph[node][neighbor][2].length / graph[node][0][1];
        visited_ancistors[neighbor_index] += 1;
        graph[node][neighbor][1]     = frac * graph[node][0][2];
        graph[neighbor_index][0][2] += frac * graph[node][0][2];
        check_sum                   += frac;
        if (visited_ancistors[neighbor_index] === get_parents(graph[node][neighbor][0], graph).length) {
          queue.push(neighbor_index);
          graph[neighbor_index][0].push(graph[node][0][3]+1);
          longest_sanad = graph[node][0][3]+1 > longest_sanad ? graph[node][0][3]+1 : longest_sanad;
        }
      }
      if (check_sum != 1 && graph[node].length > 1){
        console.log("WARNING: IN !=== OUT !!!", graph[node][0][0]);
      }
  }
  return graph
}

function updateChannelsBySegments(prev_graph){
  var graph = prev_graph.slice();
  for(var node = 0; node < graph.length; node++){
    for(var n = 1; n < graph[node].length; n++){
      var sanad = graph[node][n][3].split(",");
      var commonLinks = get_sanad_commonlinks(sanad, graph); //initial assumption, myself
      var node_index = sanad.indexOf(graph[node][0][0]);
      for(var cl = commonLinks.length-1; cl >= 0; cl--){
        var cl_index = sanad.indexOf(commonLinks[cl]);
        var next_cl_index = sanad.indexOf(commonLinks[cl-1]);
        if(cl_index >= node_index && node_index > next_cl_index){
          graph[node][n][3] = sanad.slice(next_cl_index, cl_index+1, sanad).toString();
        }
      }
    }
  }
  return graph;
}

function get_sanad_commonlinks(sanad, graph){
  var common_links = [sanad[sanad.length-1]];
  for(var narrator = sanad.length-1; narrator > 0; narrator--){
    var node = graph[getIndex(sanad[narrator], graph)];
    if(get_parents(sanad[narrator-1],graph).length > 1 || graph[getIndex(sanad[narrator-1], graph)].length > 2){
      //set channel
      common_links.unshift(sanad[narrator-1]);
    }
  }
  common_links.unshift(sanad[narrator]);
  return common_links;

}
/*-------------- Data functions -------------*/

function getHadithNum(data, index) {
  return data[index]['hadithID'];
}

function getTitle(data, index) {
  return data[index]['title'];
}

function getHadithTxt(data, index) {
  return data[index]['hadithTxt'];
}

function getHadithMatn(data, index) {
  var matn = data[index]['Matn'];
  if (matn && !matn.length){
    matn = "";
  }
  return matn;
}

function getTakhreegByID(data, mainID) {
  var found = recursiveSearch(data, mainID, 0, data.length - 1, function (
    x,
    y
  ) {
    return parseInt(x['hadithID']) - parseInt(y);
  });
  if (found == -1) {
    return [];
  }
  return data[found];
}

function getTakhreegIDs(takhreeg) {
  return takhreeg["takhreegIDs"].split(",")
}

function loadHadith(hadith){
  var takhreeg = getTakhreegByID(takhreegData, getHadithNum(HadithArr, hadith));
  matching_hadiths = getTakhreegIDs(takhreeg);
  matching_hadiths = matching_hadiths.map(id => lookupHadithIndex(id));
  matching_hadiths = matching_hadiths.filter(
    function(x){
      return x > 0;
    });
  matching_hadiths = matching_hadiths.map(idx => [idx, query(HadithArr, idx, true)]);
  afterProcess();
  openSearch();
  return;
}


function cleanAsaneed(asaneed){
    var s = asaneed
      .split("[")
      .filter(function (x) {return x.length})
      .map(x => x.split("]"))
      .map(x => x[0]
        .replace(/ |'/g, "")
        .split(','))
  return s;
}
function getHadithAsaneed(data, index) {
  return cleanAsaneed(data[index]['asaneed']);
}

function recursiveSearch(arr, x, start, end, cmpFn) {
  // Base Condition
  if (start > end) return -1;

  // Find the middle index
  let mid = Math.floor((start + end) / 2);

  // Compare mid with given key x
  var cmp = cmpFn(arr[mid], x); //
  if (cmp == 0) return mid;

  // If element at mid is greater than x,
  // search in the left half of mid
  if (cmp > 0) return recursiveSearch(arr, x, start, mid - 1, cmpFn);
  // If element at mid is smaller than x,
  // search in the right half of mid
  else return recursiveSearch(arr, x, mid + 1, end, cmpFn);
}

function lookupNarrator(id) {
  //returns data of the narrator with index from the narratorsData, Binary Search Algorithm
  var found = recursiveSearch(
    narratorsData,
    id,
    0,
    narratorsData.length - 1,
    function (x, y) {
      return parseInt(x['rawi_index']) - parseInt(y);
    }
  );
  if (found == -1) {
    // else create a narrator data
    return {'grade': "", 'name':id, 'rawi_index': id};
  }
  return narratorsData[found];
}

function lookupHadith(id) {
  //returns data of the narrator with index from the narratorsData, Binary Search Algorithm
  var found = recursiveSearch(HadithArr, id, 0, HadithArr.length - 1, function (
    x,
    y
  ) {
    return parseInt(x['hadithID']) - parseInt(y);
  });
  if (found == -1) {
    // else create a narrator data
    return [];
  }
  return HadithArr[found];
}

function lookupHadithIndex(id) {
  //returns data of the narrator with index from the narratorsData, Binary Search Algorithm
  var found = recursiveSearch(HadithArr, id, 0, HadithArr.length - 1, function (
    x,
    y
  ) {
    return parseInt(x['hadithID']) - parseInt(y);
  });
  if (found == -1) {
    // else create a narrator data
    return [];
  }
  return found;
}

function getNarratorGrade(index) {
  var narrator = lookupNarrator(index);
  return narrator['grade'];
}

function getNarratorFromName(tag) {
  return tag.split(" ")[0];
}

function gradeAnalysis() {
  /* ANALYSIS OF GRADES */
  var grades = {
    1:  [0, []],
    2:  [0, []],
    3:  [0, []],
    4:  [0, []],
    5:  [0, []],
    6:  [0, []],
    7:  [0, []],
    8:  [0, []],
    9:  [0, []],
    10: [0, []],
    11: [0, []],
    12: [0, []],
    13: [0, []],
    14: [0, []],
    15: [0, []]
  };
  for (var narr = 0; narr < narratorsData.length; narr++) {
    var origin_grade = narratorsData[narr]['grade'];
    var grade = simplifyArabic(origin_grade);

    if (grade.includes("كذب")) {
      grades[12][0]++;
      grades[12][1].push(origin_grade);
    } else if (grade.includes("متروك") || grade.includes("منكر")) {
      grades[11][0]++;
      grades[11][1].push(origin_grade);
    } else if (
      grade.includes("تغير ") ||
      grade.includes("اختلط") ||
      grade.includes("وخلط ")
    ) {
      grades[7][0]++;
      grades[7][1].push(origin_grade);
    } else if (grade.includes("دلس") || grade.includes("تدليس")) {
      grades[8][0]++;
      grades[8][1].push(origin_grade);
    } else if (
      grade.includes("ثقه ثبت") ||
      grade.includes("حافظ") ||
      grade.includes("ثقه ثقه") ||
      grade.includes("ثقه ضابط") ||
      grade.includes("امام")
    ) {
      grades[2][0]++;
      grades[2][1].push(origin_grade);
    } else if (grade.includes("ثقه")) {
      grades[4][0]++;
      grades[4][1].push(origin_grade);
    } else if (grade.includes("ضعيف") || grade.includes(" ضعف")) {
      grades[10][0]++;
      grades[10][1].push(origin_grade);
    } else if (
      grade.includes("مجهول") ||
      grade.includes("مستور") ||
      grade.includes("لا يعرف") ||
      grade.includes("لا تعرف") ||
      grade.includes("مختلف في صحبته")
    ) {
      grades[13][0]++;
      grades[13][1].push(origin_grade);
    } else if (grade.includes("لين") && !grade.includes("اولين")) {
      grades[9][0]++;
      grades[9][1].push(origin_grade);
    } else if (grade.includes("صدوق")) {
      grades[5][0]++;
      grades[5][1].push(origin_grade);
    } else if (grade.includes("صدوق")) {
      grades[3][0]++;
      grades[3][1].push(origin_grade);
    } else if (
      grade.includes("مقبول") ||
      grade.includes("شیخ ") ||
      grade.includes(" باس")
    ) {
      grades[6][0]++;
      grades[6][1].push(origin_grade);
    } else if (grade === "") {
      grades[15][0]++;
      grades[15][1].push(origin_grade);
    } else if (
      grade.includes("صحابي") ||
      grade.includes("صحابه") ||
      grade.includes("صحبه") ||
      grade.includes("صحابيه ") ||
      grade.includes("ام المومنين")
    ) {
      //for order preference
      grades[1][0]++;
      grades[1][1].push(origin_grade);
    } else {
      //Other
      grades[14][0]++;
      grades[14][1].push(origin_grade);
    }
  }
  console.log(grades);
}

function gradeToColor(grade) {
  var mapping = {
    1: "#002700",
    2: "#003f00",
    3: "#005800",
    4: "#008a00",
    5: "#7cb840",
    6: "#d8c100",
    7: "#f0a30a",
    8: "#fa6800",
    9: "#e51400",
    10: "#a20025",
    11: "#4b0011",
    12: "silver",
    13: "lightslategray",
  };
  grade = simplifyArabic(grade);
  if (grade.includes("كذب")) {
    return mapping[11];
  } else if (grade.includes("متروك") || grade.includes("منكر")) {
    return mapping[10];
  } else if (
    grade.includes("تغير ") ||
    grade.includes("اختلط") ||
    grade.includes("وخلط ")
  ) {
    return mapping[6];
  } else if (grade.includes("دلس") || grade.includes("تدليس")) {
    return mapping[7];
  } else if (
    grade.includes("ثقه ثبت") ||
    grade.includes("حافظ") ||
    grade.includes("ثقه ثقه") ||
    grade.includes("ثقه ضابط") ||
    grade.includes("امام")
  ) {
    return mapping[2];
  } else if (grade.includes("ثقه")) {
    return mapping[3];
  } else if (grade.includes("ضعيف") || grade.includes(" ضعف")) {
    return mapping[9];
  } else if (
    grade.includes("مجهول") ||
    grade.includes("مستور") ||
    grade.includes("لا يعرف") ||
    grade.includes("لا تعرف") ||
    grade.includes("مختلف في صحبته")
  ) {
    return mapping[12];
  } else if (grade.includes("لين") && !grade.includes("اولين")) {
    return mapping[8];
  } else if (grade.includes("صدوق")) {
    return mapping[4];
  } else if (
    grade.includes("مقبول") ||
    grade.includes("شيخ ") ||
    grade.includes(" باس")
  ) {
    return mapping[5];
  } else if (
    grade.includes("صحابي") ||
    grade.includes("صحابه") ||
    grade.includes("صحبه") ||
    grade.includes("صحابيه ") ||
    grade.includes("ام المومنين")
  ) {
    //for order preference
    return mapping[1];
  } else {
    //Other
    return mapping[13];
  }
}

/****************** Library **********************/
// Source: Kaggle Hadith Data Set
var dir = "https://raw.githubusercontent.com/OmarShafie/hadith/master";
var hadithURL    = dir + "/data/nine_books_data.csv";
var takhreegURL  = dir + "/data/takhreeg_data.csv";
var narratorsURL = dir + "/data/narrators-utf8.csv";

function buildErrorMessage(e) {
  return e.message;
}

//Parse Parameters
var inputType = "remote";
var input_file = hadithURL;
var stepped    = 0,
    rowCount   = 0,
    errorCount = 0,
    firstError;
var start, end;
var new_upload = true;
var maxUnparseLength = 10000;

var HadithArr    = [];
var result_graph = [];
var ready_data   = [];
var data;
var layers_count = []; // used as indication of height of sankey
var layers_total = [];
var longest_sanad     = 0;

$(function () {
  $("#rotate").click(function () {
    // flip
    var sankey = document.querySelector("#sankey_basic");
    if (isVertical) {
      sankey.setAttribute("class", "horizontal-sankey");
    } else {
      sankey.setAttribute("class", "vertical-sankey");
    }
    isVertical = !isVertical;
    google.charts.setOnLoadCallback(drawChart(data));
  });
});

$(function () {
  $("#colorLinksSwitchBySanad").click(function () {
    prepareData();
  });
});

$(function () {
  $("#colorLinksSwitchByMatn").click(function () {
    prepareData();
  });
});

$(function () {
  $("#distinguishableColorsSwitch").click(function () {
    prepareData();
  });
});

$(function () {
  $("#clearRouteSwitch").click(function () {
    prepareData();
  });
});

$(function () {
  $("#logScaleSwitch").click(function () {
    prepareData();
  });
});

$(function () {
  $("#saveTopPdf").click(function () {
    var element = $("#sankey_container");          
    html2canvas(element, {
        letterRendering: true,
    }).then(function(canvas){
                    var imageData = canvas.toDataURL("image/png");
            var newData = imageData.replace(/^data:image\/png/, "data:application/octet-stream");
            $("<a>", {href:newData, download:"Proof1.png",on:{click:function(){$(this).remove()}}})
            .appendTo("body")[0].click()
     })
    }); 
});

$(function () {
  $("#draw").click(function () {
    if ($(this).prop("disabled") == "true") {
      return;
    }
    // Allow only one parse at a time
    $("#draw").prop("disabled", true);
    $("#submit").prop("disabled", true);

    document.getElementById("draw").innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Loading..';
    prepareData();
  });
});

$(function () {
  $("#submit").click(function () {
    if ($(this).prop("disabled") == "true") {
      return;
    }

    stepped    = 0;
    rowCount   = 0;
    errorCount = 0;
    firstError = undefined;

    // Allow only one parse at a time
    $("#draw").prop("disabled", true);
    $("#submit").prop("disabled", true);

    document.getElementById("submit").innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Loading..';

    for (var p = 0; p < args.length; p++) {
      args[p]["value"] = document.getElementById(args[p]["key"]).value;
      if (args[p]["value"] == "") {
        args[p]["value"] = args[p]["default"];
      }
    }

    if (!new_upload) {
      console.log("--------------------------------------------------");
      main();
    } 
    else {
      var hadithData;
      var narratorsData;
      var takhreegData;
      var config = buildConfig(parseNarrators, inputType);
      Papa.parse(input_file, config);

      if (config.worker || config.download)
        document.getElementById("btnMessage").innerHTML = "Running...";
    }
  });
});

function parseNarrators(results) {
  document.getElementById("btnMessage").innerHTML = "Parsing Narrators...";

  if (results && results.errors) {
    if (results.errors) {
      errorCount = results.errors.length;
      firstError = results.errors[0];
    }
    if (results.data && results.data.length > 0) rowCount = results.data.length;
  }
  hadithData = results.data;
  Papa.parse(narratorsURL, buildConfig(parseTakhreeg, "remote"));
}

function parseTakhreeg(results) {
  document.getElementById("btnMessage").innerHTML = "Parsing Takhreeg...";

  if (results && results.errors) {
    if (results.errors) {
      errorCount = results.errors.length;
      firstError = results.errors[0];
    }
    if (results.data && results.data.length > 0) rowCount = results.data.length;
  }
  narratorsData = results.data;
  Papa.parse(takhreegURL, buildConfig(completeParse, "remote"));
}


function completeParse(results) {
  document.getElementById("btnMessage").innerHTML = "Parsed Dataset!";
  end = now();

  if (results && results.errors) {
    if (results.errors) {
      errorCount = results.errors.length;
      firstError = results.errors[0];
    }
    if (results.data && results.data.length > 0) rowCount = results.data.length;
  }
  new_upload = false;
  takhreegData = results.data;

  autocomplete(document.getElementById("pattern-query"), narratorsData);
  enableButton();

  check_dataset_format(Object.keys(hadithData[0]));
}

function check_dataset_format(data){
  var format =  ["hadithID", "BookID", "title", "asaneed", "hadithTxt", "Matn"];
  if(!data.length){
      document.getElementById("data-error").innerHTML = "Dataset is empty!";
      return;
  }
  else {
    for(var col = 0; col < format.length; col++){
      if(!data.includes(format[col])){
        console.log("Used format:", data);
        document.getElementById("data-error").innerHTML = 
          'Dataset format Mismatch! \nMissing: '+format[col];
        return;
        }
      }
  }
  document.getElementById("data-error").innerHTML = "";
}

function buildConfig(completeFn, input_type) {
  return {
    header: true,
    complete: completeFn,
    error: errorFn,
    download: input_type == "remote"
  };
}

function errorFn(err, file) {
  end = now();
  console.log("ERROR:", err, file);
  enableButton();
}

function enableButton(isBoth) {
  $("#submit").prop("disabled", false);
  if (isBoth) {
    $("#draw").prop("disabled", false);
  }
  document.getElementById("submit").innerHTML = "Submit بحث";
  document.getElementById("draw").innerHTML = "Draw رسم";
}

function now() {
  return typeof window.performance !== "undefined"
    ? window.performance.now()
    : 0;
}

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    var segments = this.value.split("@");
    if (segments.length > 1) {
      var editing_index = segments.findIndex(function (element) {
        return element.length != 0 && !(/^\d/.test(element[0]));
      });
      var a, b, i, val = segments[editing_index];
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false; }
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 1; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i][1].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i][1].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i][1].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i][0] + " '>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function (e) {
            /*insert the value for the autocomplete text field:*/
            segments.splice(editing_index, 1, this.getElementsByTagName("input")[0].value);
            inp.value = segments.join("@");
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
          });
          a.appendChild(b);
        }
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

function colorLinksBySanad() {
  return document.getElementById("colorLinksSwitchBySanad").checked;
}

function colorLinksByMatn() {
  return document.getElementById("colorLinksSwitchByMatn").checked;
}

function friendlyColor() {
  return document.getElementById("distinguishableColorsSwitch").checked;
}

function clearRoute() {
  return document.getElementById("clearRouteSwitch").checked;
}

function logScale() {
  return document.getElementById("logScaleSwitch").checked;
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
};
function stripHtml(html) {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

var simplifyArabic = function (str) {
  //now you can use simplifyArabic(str) on Arabic strings to remove the diacritics
  return stripHtml(
    str
      .replace(/[^\u0000-\u007E]/g, function (a) {
        var retval = arabicNormChar[a];
        if (retval == undefined) {
          retval = a;
        }
        return retval;
      })
      .normalize("NFKD")
      .toLowerCase()
  ).replace(/ +(?= )/g, "");
};

function stringalign(matching, madarat, reward, mispen, gappen, skwpen)
{  
  // Convert the list of matching hadiths to their matns
  var hadithlist = matching.filter(h=>getHadithMatn(HadithArr, h[0]) !== "");
  var strlist = hadithlist.map(x => getHadithMatn(HadithArr, x[0]).replace(/\n|\r|\t/g, ""));

  // If only a single hadith, then never mind
  if (strlist.length > 1){
    // Find the closest sequence to all other sequences
    var scores = [];
    for(var s=0; s < strlist.length; s++){
      scores.push({'seq': s, 'score': 0});
    }
    // distance matrix
    var pairs = {}; //alignment pairs
    for(var s=0; s<strlist.length; s++){
      pairs[s] = new Array(strlist.length);
    }
    // fill the matrix
    for(var s=0; s<strlist.length-1; s++){
      for(var s2=s+1; s2<strlist.length; s2++){
        var out = twostringalign(strlist[s], strlist[s2], reward, mispen, gappen, skwpen);
        pairs[s][s2] = out['agaps'].slice();
        pairs[s2][s] = out['bgaps'].slice();
        scores[s]['score'] += out['score'];
        scores[s2]['score'] += out['score'];
      }
    }

    // sort to find the minimum
    scores.sort(function(a, b) {
      return a['score'] - b['score'];
    });

    // minimum / closest
    var s_c = scores[0]['seq'];
    var alignments = [];
    alignments.push(pairs[s_c][scores[1]['seq']].slice());
    alignments.push(pairs[scores[1]['seq']][s_c].slice());

    // progressivly add the rest using the previous alignment as a guide
    for(var s=2; s<scores.length; s++){
      var guide = pairs[s_c][scores[s]['seq']];
      var new_alignment = pairs[scores[s]['seq']][s_c];
      alignments = add_to_alignmentset(alignments.slice(), new_alignment.slice(), guide.slice());
    }
    // get the consensus sequence
    var consensus = get_consensus(alignments);
    // get coloring sets
    var sets = [];
    for(var k = 0; k < madarat.length; k++){
      var s = [];
      var madar = madarat[k];
      for(var h = 0; h < hadithlist.length; h++){
        for(var i = 0; i < hadithlist[h][1].length; i++){
          if(hadithlist[h][1][i].toString().includes(madar)){
            s.push(scores.findIndex(i => i['seq'] === h));
          }
        }
      }
      sets.push({ 'madar': madar, 'set': s, 'color': colorPool[k % colorPool.length]});
    }
    sets.sort((a,b) =>
          b['set'].length
        - a['set'].length);
//    console.log(sets);
    
    alignments = colorset(alignments, sets);

    for (var i = alignments.length - 1; i >= 0; i--) {
      for (var w = alignments[i].length - 1; w >= 0; w--) {
        if(!alignments[i][w].includes(">")){
          alignments[i][w] = ">"+alignments[i][w];
        }
      }
    }

    //return the results to the UI
    var alignment_table = '<table style="display: contents;"><thead><tr>';
    for (var w = 0; w < consensus.length; w++){
      alignment_table += '<th>' + consensus[w] + "</th>";
    }
    alignment_table += '</tr></thead><tbody style="display: contents;">';
    for (var a = 0; a < alignments.length; a++) {
      alignment_table += "<tr>";
      for (var w = 0; w < consensus.length; w++){
        alignment_table += "<td "+ alignments[a][w] +"</td>";
      }
      alignment_table += "</tr>";
    }
    alignment_table += "</tbody></table>";

    $("#card").html(alignment_table);
  }
}

function twostringalign(ainstr, binstr, reward, mispen, gappen, skwpen)
{
  //matn, clean arabic, space, diacretics, punctuations, multiple spaces
  // This is a word based Sequence Alignment using Dynamic Programming
  // Modified implementation of wunsch-needleman from https://berthub.eu/nwunsch/
  var ain = ainstr.replace(/:|؛|،|\./g, "").replace(/ +(?= )/g, "").trim()
  var bin = binstr.replace(/:|؛|،|\./g, "").replace(/ +(?= )/g, "").trim()
  var s_ain = simplifyArabic(ain).split(' ');
  var s_bin = simplifyArabic(bin).split(' ');
  ain = ain.split(' ');
  bin = bin.split(' ');
  var i, j ,k;
  var dn,rt,dg;
  var ia = ain.length, ib = bin.length;
  var aout=[]; // .resize(ia+ib);
  var bout=[];
  var summary=[];
 
  var cost =[];
  var marked=[];
  for(n=0 ; n < ia+1 ;++n) {
      cost[n] = new Array(ib+1);
      marked[n] = new Array(ib+1);
    }

  // fill the alignment matrix
  cost[0][0] = 0.;
   for (i=1;i<=ia;i++) cost[i][0] = cost[i-1][0] + skwpen;
   for (i=1;i<=ib;i++) cost[0][i] = cost[0][i-1] + skwpen;
   for (i=1;i<=ia;i++) for (j=1;j<=ib;j++) {
       dn = cost[i-1][j] + ((j == ib)? skwpen : gappen);
       rt = cost[i][j-1] + ((i == ia)? skwpen : gappen);
       dg = cost[i-1][j-1] + ((s_ain[i-1] == s_bin[j-1])? reward : mispen);
       cost[i][j] = Math.min(dn,rt,dg);
   }

   // backtrace the optimal alignment
   i=ia; j=ib; k=0;
   var score = cost[i][j];
   while (i > 0 || j > 0) {
       marked[i][j]=1;   
       dn = rt = dg = 9.99e99;
       if (i>0) dn = cost[i-1][j] + ((j==ib)? skwpen : gappen);
       if (j>0) rt = cost[i][j-1] + ((i==ia)? skwpen : gappen);
       if (i>0 && j>0) dg = cost[i-1][j-1] +
                          ((s_ain[i-1] == s_bin[j-1])? reward : mispen);
       if (dg <= Math.min(dn,rt)) {
           aout.push(ain[i-1]);
           bout.push(bin[j-1]);
           summary[k++] = ((ain[i-1] == bin[j-1])? '=' : '!');
           i--; j--;
       }
       else if (dn < rt) {
          // replace by a gap of equal length
           aout.push(ain[i-1]);
           bout.push(ain[i-1].replace(/./g,'ـ')); 
           summary[k++] = ' ';           
           i--;
       }
       else {
           aout.push(bin[j-1].replace(/./g,'ـ'));
           bout.push(bin[j-1]);
           summary[k++] = ' ';
           j--;
       }
       marked[i][j]=1;
    }

    for (i=0;i<k/2;i++) {
        var t = aout[k-1-i];
        aout[k-1-i] = aout[i];
        aout[i]=t;

        t=bout[k-1-i];
        bout[k-1-i] = bout[i];
        bout[i]=t;

        t=summary[k-1-i];
        summary[k-1-i]=summary[i];
        summary[i]=t;
    }

    aout.size=k; bout.size=k; summary.size=k;

    return {'score': score,
            'agaps': aout, 
            'bgaps': bout}
}


function add_to_alignmentset(prev_alignments, new_alignment, new_guide){
  //copy to a new addresses
  var alignments = prev_alignments.slice();
  var origin = alignments[0].slice();
  var adjusted_alignment = new_alignment.slice();
  var guide = new_guide.slice();

  // Origin and guide are the same sequence but with diffrent lengths due to gaps
  var i=0; j=0;
  while (i < origin.length || j < guide.length) {
    //console.log(origin[i], adjusted_alignment[j]);
    if (i == origin.length){
      // The origin has ended, but guide hasn't, add the guide jth word (gap) to all alignments end
      for(var a = 0; a< alignments.length; a++){
        alignments[a].push(guide[j].slice());
      }
      origin.push(guide[j].slice());
    }
    else if (j == guide.length) {
      // The guide has ended, but origin hasn't, add the origin ith word (gap) to guide end 
      adjusted_alignment.push(origin[i].slice());
      guide.push(origin[i].slice());
    }
    else if (origin[i] != guide[j]) {
      if (origin[i][0]=="ـ" && guide[j][0]=="ـ"){
        if (origin[i].length > guide[j].length) guide[j] = origin[i];
        else origin[i] = guide[j];
      }
      else if(origin[i][0]=="ـ"){
        adjusted_alignment.splice(j, 0, origin[i]);
        guide.splice(j, 0, origin[i]);
      }
      else {
        for(var a = 0; a< alignments.length;a++){
          alignments[a].splice(i, 0, guide[j]);
        }
        origin.splice(i, 0, guide[j]);
      }
    }
    i++;
    j++;
  }
  alignments.push(adjusted_alignment);
  if(origin.join(" ") !== guide.join(" ")){
    console.log("ALIGNMENT OUT PUT Mismatch");
    console.log(origin);
    console.log(guide);
  }
  return alignments;
}

function get_consensus(seqs){
  var consensus = [];
  //for each word
  for(var i = 0; i < seqs[0].length; i++){
    var items = [];
    //for every seq
    for(var s = 0; s <seqs.length; s++){
      items.push(seqs[s][i]); 
    }
    //get common word
    var mode_item = mode(items);

    // set all other sequences to incontrast to the mode
    for(var s = 0; s <seqs.length; s++){
      // if it is equal to the mode, then it can be deleted
      if (seqs[s][i] == mode_item){
        seqs[s][i] = simplifyArabic(mode_item).replace(/./g,'.');
      }
      // if the mode is not a gap, then the sequence made a deletion
      else if (seqs[s][i][0] == 'ـ' && mode_item[0] != 'ـ'){
        seqs[s][i] = "×";// simplifyArabic(mode_item).replace(/./g,'×');
      }
    }
    consensus.push(mode_item);
  }
  return consensus;
}

function mode(arr){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}

function colorset(alignments, setlist){
  var colorings = alignments.slice().map(x=>[x.slice(),0]);
  for(var s = 0; s < setlist.length; s++){
    var color = setlist[s]['color'];
    var set = setlist[s]['set'];
    if(set.length > 0){
      for(var seq = 0; seq < set.length; seq++){
        colorings[set[seq]][1] = colorings[set[seq]][1]? colorings[set[seq]][1]:s;
      }
      for(var i = 0; i < alignments[0].length; i++){
        var is_local_consensus = alignments[set[0]][i];
        for(var seq = 0; seq < set.length; seq++){
          if (alignments[set[seq]][i] !== is_local_consensus){
            is_local_consensus = false;
          }
        }
        if (is_local_consensus !== false){
          for(var seq = 0; seq < set.length; seq++){
            if (colorings[set[seq]][0][i].split(" ")[0] != 'style'){
              colorings[set[seq]][0][i] = 'style = "background-color: '+hexToRgba(color)+'">'+ colorings[set[seq]][0][i]; // not colored
            }
          }
        }
      }
    }
  }
  colorings.sort((a,b)=> a[1] - b[1]);
  return colorings.map(p=>p[0]);
}

function hexToRgba(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ?
    'rgba('+parseInt(result[1], 16)+','
           +parseInt(result[2], 16)+','
           +parseInt(result[3], 16)+', 0.6 )' : null;
}

function sort_longest(a, b, hadiths_in_link) {
  var a_index = hadiths_in_link.indexOf(a[2]);
  var b_index = hadiths_in_link.indexOf(b[2]);
  //Sort by total sum of out weights
  var b_max = 0;
  var b_hadiths = hadiths_in_link[b_index];
  for(var j = 0; j < b_hadiths.length;j++){
    b_asaneed = getHadithAsaneed(HadithArr, b_hadiths[j]);
    for (var k = 0; k < b_asaneed.length; k++) {
      b_max = Math.max(b_max, b_asaneed[k].length)
    }
  }
  var a_max = 0;
  a_hadiths = hadiths_in_link[a_index];
  for(var j = 0; j < a_hadiths.length;j++){
    a_asaneed = getHadithAsaneed(HadithArr, a_hadiths[j]);
    for (var k = 0; k < a_asaneed.length; k++) {
      a_max = Math.max(a_max, a_asaneed[k].length)
    }
  }
  if(a_max != b_max){
    return b_max - a_max;
  } else {
    a_color = colorPool.indexOf(a[1]);
    b_color = colorPool.indexOf(b[1]);
    if (a_color != b_color){
      return a_color - b_color; 
    }
  }
  
}