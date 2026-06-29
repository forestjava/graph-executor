# GQL (Cypher) patterns

## Создать узел

```cypher
CREATE (n:Task {
  id: 'ENG-3', prefix: 'ENG',
  title: 'Подготовить схему миграции',
  status: 'open',
  summary: '',
  createdAt: datetime(), updatedAt: datetime()
})
RETURN n.id AS id, n.title AS title
```

## Декомпозиция: задача A зависит от подзадач B и C (DEPENDS_ON)

```cypher
// Для задачи A нужно сначала решить задачи B и C
MATCH (a:Task {id: 'ENG-1'}), (b:Task {id: 'ENG-2'}), (c:Task {id: 'ENG-3'})
MERGE (a)-[:DEPENDS_ON]->(b)
MERGE (a)-[:DEPENDS_ON]->(c)
RETURN a.id, collect(b.id + ', ' + c.id) AS blockers
```

Так же работает для Concept → под-концепты, Problem → подпроблемы.

## Рефлексия: из предпосылок X и Y вытекает итог Z (LEADS_TO)

```cypher
// Решения X и Y приводят к результату Z
MATCH (x:Statement {id: 'THINK-1'}), (y:Statement {id: 'THINK-2'}), (z:Statement {id: 'THINK-3'})
MERGE (x)-[:LEADS_TO]->(z)
MERGE (y)-[:LEADS_TO]->(z)
RETURN collect(x.id + ', ' + y.id) AS causes, z.id AS effect
```

## Варианты решения проблемы (HAS_OPTION)

```cypher
// Для проблемы A есть варианты B, C и D — каждый нужно исследовать
MATCH (a:Problem {id: 'Q-1'}), (b:Statement {id: 'Q-2'}), (c:Statement {id: 'Q-3'}), (d:Statement {id: 'Q-4'})
MERGE (a)-[:HAS_OPTION]->(b)
MERGE (a)-[:HAS_OPTION]->(c)
MERGE (a)-[:HAS_OPTION]->(d)
RETURN a.id AS problem, collect(b.id + ', ' + c.id + ', ' + d.id) AS options
```

## Обновить свойства

```cypher
MATCH (n {id: 'Q-1'})
WHERE n.deleted IS NULL
SET n.status = 'done',
    n.solution = 'Выбрать Neo4j',
    n.summary = 'Решение принято после исследования трёх вариантов',
    n.updatedAt = datetime()
RETURN n.id, n.status, n.solution
```

## Получить контекст узла

```cypher
MATCH (n {id: 'ENG-1'})
WHERE n.deleted IS NULL
OPTIONAL MATCH (n)-[:DEPENDS_ON]->(dep)
  WHERE dep.deleted IS NULL AND dep.status <> 'done'
OPTIONAL MATCH (blocked)-[:DEPENDS_ON]->(n)
  WHERE blocked.deleted IS NULL AND blocked.status <> 'done'
OPTIONAL MATCH (cause)-[:LEADS_TO]->(n)
  WHERE cause.deleted IS NULL
OPTIONAL MATCH (n)-[:LEADS_TO]->(effect)
  WHERE effect.deleted IS NULL
OPTIONAL MATCH (n)-[:HAS_OPTION]->(option)
  WHERE option.deleted IS NULL
RETURN
  n.id, labels(n)[0] AS label, n.title, n.status, n.summary, n.inputs,
  collect(DISTINCT {id: dep.id,     title: dep.title})[0..10]     AS dependencies,
  collect(DISTINCT {id: blocked.id, title: blocked.title})[0..10] AS blocked_by_this,
  collect(DISTINCT {id: cause.id,   title: cause.title})[0..10]   AS causes,
  collect(DISTINCT {id: effect.id,  title: effect.title})[0..10]  AS effects,
  collect(DISTINCT {id: option.id,  title: option.title})[0..10]  AS options
```

Применять для команд: «контекст», «сводка», «расскажи о», «собери информацию».
При необходимости убрать ненужные OPTIONAL MATCH-ветки.

## Фильтрованный список

```cypher
MATCH (n:Task)
WHERE n.status = 'open'
  AND n.deleted IS NULL
RETURN n.id, n.title, n.status
ORDER BY n.createdAt DESC
LIMIT 20
```

Агент самостоятельно строит `WHERE` из декларативной фразы:
«открытые задачи» → `n:Task AND n.status = 'open'`;
«все проблемы» → `n:Problem`;
«варианты для Q-1» → `MATCH (:Problem {id:'Q-1'})-[:HAS_OPTION]->(n)`.

## Удаление узла

```cypher
MATCH (n {id: 'ENG-3'})
SET n.deleted = true, n.updatedAt = datetime()
RETURN n.id
```

## Добавить сырую заметку (inputs)

```cypher
MATCH (n {id: 'ENG-1'})
WHERE n.deleted IS NULL
SET n.inputs = coalesce(n.inputs, []) + ['2026-06-18 User: "Примени принцип YAGNI (You Aren’t Gonna Need It)"'],
    n.updatedAt = datetime()
RETURN n.id, n.inputs
```

---
