//1 clear data
DROP INDEX Narrator_id_idx IF EXISTS;
DROP INDEX Hadith_id_idx IF EXISTS;
MATCH (n)
DETACH DELETE n;

//2 load Narrator nodes
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/narrators_data.csv' AS row
CREATE (n:Narrator {n_id: coalesce(toInteger(row.rawi_index), 0), name: coalesce(row.name, "X"), grade: coalesce(row.grade, "X"), birth_date: coalesce(row.birth, "X"), death_date: coalesce(row.death, "X"), birth_date_text: coalesce(row.date_birth, "X"), death_date_text: coalesce(row.date_death, "X"), places:coalesce(row.places, "X")})
RETURN count(n);

//3 CREATE INDEX Narrator_id_idx
CREATE INDEX Narrator_id_idx IF NOT EXISTS
FOR (n:Narrator) ON (n.n_id);

//4 load Hadith nodes
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/hadith_data.csv' AS row
MATCH (n:Narrator {n_id:  coalesce(toInteger(row.author), 0)})
CREATE (h:Hadith {id: toInteger(row.id ), book: row.book, name: coalesce(row.title, "X"), text: coalesce(row.text, "X")})
CREATE (h)-[:AUTHORED_BY]->(n)
RETURN count(h);

//5 CREATE INDEX Hadith_id_idx IF NOT EXISTS
CREATE INDEX Hadith_id_idx IF NOT EXISTS
FOR (h:Hadith) ON (h.id);

//6 create Sanad relationships
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/asaneed_data.csv' AS row
MATCH (n1:Narrator {n_id: toInteger(row.from_narrator)}),(n2:Narrator {n_id: toInteger(row.to_narrator)})
MERGE (n1)-[r:NARRATED_BY]->(n2)
ON CREATE (n1)-[r:NARRATED_BY {hadiths:toInteger(row.id)}]->(n2)
ON MATCH SET r.hadiths = r.hadiths +  toInteger(row.id )
RETURN count(row);

//7 create takhreej relationships
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/takhreej_data.csv' AS row
MATCH (h1:Hadith {id: toInteger(row.id1)}), (h2:Hadith {id: toInteger(row.id2)})
CREATE (h1)-[:SHARES_TAKHREEJ_WITH]->(h2)
RETURN count(row);
