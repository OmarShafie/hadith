//1 clear data
DROP INDEX Narrator_id_idx IF EXISTS;
DROP INDEX Hadith_id_idx IF EXISTS;
DROP INDEX Takhreej_id_idx IF EXISTS;
DROP INDEX Isnad_id_idx IF EXISTS;
MATCH (n) DETACH DELETE n;

//2 load Narrator nodes
//USING PERIODIC COMMIT
//LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/narrators_data.csv' AS row
LOAD CSV WITH HEADERS FROM 'file:///narrators_data.csv' AS row
CREATE (n:Narrator {n_id: coalesce(toInteger(row.rawi_index), 0), name: coalesce(row.name, ""), grade: coalesce(row.grade, ""), birth_date: coalesce(row.birth, ""), death_date: coalesce(row.death, ""), birth_date_text: coalesce(row.date_birth, ""), death_date_text: coalesce(row.date_death, ""), places:coalesce(row.places, "")})
RETURN count(n);

//3 CREATE INDEX Narrator_id_idx
CREATE INDEX Narrator_id_idx IF NOT EXISTS
FOR (n:Narrator) ON (n.n_id);

//4 load Hadith nodes
//USING PERIODIC COMMIT
//LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/hadith_data.csv' AS row
LOAD CSV WITH HEADERS FROM 'file:///hadith_data.csv' AS row
CREATE (h:Hadith {id: toInteger(row.id), book: row.book, name: coalesce(row.name, ""), text: coalesce(row.text, "")}) WITH row, h
UNWIND SPLIT(row.isnad_ids,",") AS id
  CREATE (i:Isnad  {id: toInteger(id)})
  CREATE (h)-[:ISNAD]->(i)
RETURN count(h);

//5 CREATE INDEX Hadith_id_idx IF NOT EXISTS
CREATE INDEX Hadith_id_idx IF NOT EXISTS
FOR (h:Hadith) ON (h.id);

//9 CREATE INDEX Isnad_id_idx IF NOT EXISTS
CREATE INDEX Isnad_id_idx IF NOT EXISTS
FOR (i:Isnad) ON (i.id);

//10 create Sanad relationships with isnad
//USING PERIODIC COMMIT
//LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/asaneed_data.csv' AS row
LOAD CSV WITH HEADERS FROM 'file:///asaneed_data.csv' AS row
MATCH (n:Narrator {n_id: toInteger(row.n_id)}) WITH n, row
MATCH (i:Isnad {id: toInteger(row.id)}) WITH n, i, row
CREATE (i)-[r:HAS_NARRATOR]->(n)
SET r.rank=toInteger(row.rank), r.from=toInteger(row.from_narrator), r.to=toInteger(row.to_narrator)
RETURN count(row); 

//8 create Sanad relationships between narrators
//USING PERIODIC COMMIT
//LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/asaneed_data.csv' AS row
LOAD CSV WITH HEADERS FROM 'file:///asaneed_data.csv' AS row
MATCH (n:Narrator {n_id: toInteger(row.n_id)}) WITH n, row
MATCH (n1:Narrator {n_id: toInteger(row.from_narrator)}) WITH n, n1, row
MERGE (n)-[r:NARRATED_FROM]->(n1)
ON CREATE SET r.isnads = [toInteger(row.id)]
ON MATCH SET r.isnads = r.isnads + toInteger(row.id)
RETURN count(row); 

//6 CREATE INDEX Takhreej_id_idx IF NOT EXISTS
CREATE INDEX Takhreej_id_idx IF NOT EXISTS
FOR (t:Takhreej) ON (t.id);

//7 create takhreej relationships
//USING PERIODIC COMMIT
//LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/OmarShafie/hadith/master/data/neo4j/takhreej_data.csv' AS row
LOAD CSV WITH HEADERS FROM 'file:///takhreej_data.csv' AS row
MATCH (h:Hadith {id: toInteger(row.hadithID)}) WITH row, h
MERGE (t:Takhreej {id: toInteger(row.takhreegIDs)}) WITH t, h, row
CREATE (h)-[:BELONGS_TO]->(t)
RETURN count(row);
