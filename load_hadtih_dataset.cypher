// clear data
MATCH (n)
DETACH DELETE n;

// load Hadith nodes
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/hadith_data.csv' AS row
MERGE (h:Hadith {h_id: coalesce(row.hadithID, "X"), book: row.book, title: coalesce(row.title, "X"), text: coalesce(row.text, "X"), matn: coalesce(row.matn, "X")})
RETURN count(h);

// load Narrator nodes
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/narrators_data.csv' AS row
MERGE (n:Narrator {n_id: coalesce(row.rawi_index, "X"), name: coalesce(row.name, "X"), grade: coalesce(row.grade, "X"), birth_date: coalesce(row.birth, "X"), death_date: coalesce(row.death, "X"), birth_date_text: coalesce(row.date_birth, "X"), death_date_text: coalesce(row.date_death, "X"), places:coalesce(row.places, "X")})
RETURN count(n);

// create takhreej relationships
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/takhreej_data.csv' AS row
MATCH (h1:Hadith {h_id: row.hadithID}) 
UNWIND split(row.takhreegIDs, ',') AS h2 WITH h1, h2, row
MERGE (h1)<-[:SHARES_TAKHREEJ_WITH]->(h2)
RETURN *;

// create Book relationships
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/hadith_data.csv' AS row
MATCH (h:Hadith {h_id: row.hadithID})
MATCH (n:Narrator {n_id: row.author}) WITH h1, n, row
MERGE (h1)-[:AUTHORED_BY]->(n)
RETURN *;

// create Sanad relationships
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/asaneed_data.csv' AS row
MATCH (n1:Narrator {n_id: row.from_narrator})
MATCH (n2:Narrator {n_id: row.to_narrator}) WITH n1, n2, ,row
MERGE (n1)-[r:NARRATED_BY]->(n2)
SET r.hadiths = r.hadiths + row.hadithID
RETURN *;
