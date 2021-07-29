// clear data
MATCH (n)
DETACH DELETE n;

// load Hadith nodes
LOAD CSV WITH HEADERS FROM 'hadith_data.csv' AS row
MERGE (h:Hadith {h_id: row.h_id, book: row.book, title: row.title, h_text: row.h_text, matn: row.matn})
RETURN count(h);

// load Narrator nodes
LOAD CSV WITH HEADERS FROM 'narrator_data.csv' AS row
MERGE (n:Narrator {n_id: row.n_id, name: row.name, grade: row.grade, birth_date: row.birth_date, death_date: row.death_date, birth_date_text: row.birth_date_text, death_date_text: row.death_date_text})
RETURN count(n);

// create takhreej relationships
LOAD CSV WITH HEADERS FROM 'takhreej_data.csv' AS row
MATCH (h1:Hadith {h_id: row.h_id}) 
UNWIND split(row.Takhreej, ',') AS h2 WITH h1, h2, row
MERGE (h1)<-[:SHARES_TAKHREEJ_WITH]->(h2)
RETURN *;

// create Book relationships
LOAD CSV WITH HEADERS FROM 'hadith_data.csv' AS row
MATCH (h:Hadith {h_id: row.h_id})
MATCH (n:Narrator {n_id: row.start_from}) WITH h1, n, row
MERGE (h1)-[:AUTHORED_BY]->(n)
RETURN *;

// create Sanad relationships
LOAD CSV WITH HEADERS FROM 'asaneed_data.csv' AS row
MATCH (n1:Narrator {n_id: row.from_narrator})
MATCH (n2:Narrator {n_id: row.to_narrator}) WITH n1, n2, ,row
MERGE (n1)-[r:NARRATED_BY]->(n2)
SET r.hadiths = r.hadiths + row.h_id
RETURN *;
