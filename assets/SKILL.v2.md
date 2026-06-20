---
name: graph-organizer-command-interpreter
description: >
  Используй этот навык, когда нужно интерпретировать декларативные команды
  пользователя над графом персонального органайзера / базы знаний и сформировать
  корректный GQL (Cypher)-запрос и набор параметров для вызова инструмента
  `execute` MCP-сервера `graph-executor`.
  Применяй для создания узлов (Concept, Statement, Task, Problem),
  связывания узлов, получения контекста, сводки, фильтрованных списков —
  по формулировкам вида «создай задачу и свяжи с ENG-1», «получи контекст по ID-90»,
  «закрой проблему Q-17», «выбери открытые задачи» и т.п.
version: 2.0.0
tags:
  - neo4j
  - cypher
  - gql
  - mcp
  - graph
  - knowledge-base
  - ontology
---

# Domain model

Набор типов узлов открыт: помимо описанных ниже, любые дополнительные labels могут быть добавлены без изменения схемы базы данных.

## Узлы (Labels)

### Общие свойства (все узлы)

- `id`        — стабильный идентификатор, строка вида `PREFIX-NUMBER`
- `title`     — название
- `summary`   — итоговая сводка, вывод или описание; может быть пустой строкой пока идёт работа
- `inputs`    — массив строк; хранит "сырые" дословные фрагменты общения с пользователем;
                используется как источник первичных данных для последующего осмысления
- `createdAt` — метка времени ISO 8601, проставляется при создании
- `updatedAt` — метка времени ISO 8601, обновляется при каждом изменении
- `deleted`   — soft deletion mark

Набор свойств открыт: любые дополнительные атрибуты могут быть добавлены без изменения схемы базы данных.

---

### Concept

Абстрактная идея, категория, термин. Не требует выполнения — только понимания и структурирования.

Дополнительные свойства:
- `prefix` — (необязательно) пространство имён; задаётся когда Concept является точкой входа в кластер связанных узлов; все узлы кластера наследуют тот же prefix

---

### Statement

Утверждение, факт, гипотеза, вывод, решение, итог. Может быть истинным / ложным / неопределённым.
Используется как для фиксации знания («факт X установлен»), так и для фиксации решений
(«выбран вариант Y»), выводов («из X и Y следует Z») и промежуточных гипотез.

---

### Task

Деятельность, требующая выполнения.

Дополнительные свойства:
- `status` — `new` · `open` · `in_progress` · `blocked` · `review` · `done` · `rework`

---

### Problem

Формулировка затруднения или открытого вопроса: «что не так» или «что нужно достичь».
Отправная точка для исследования, декомпозиции и поиска вариантов.

Дополнительные свойства:
- `prefix`   — (необязательно) пространство имён кластера (аналогично Concept)
- `status`   — `open` · `in_progress` · `blocked` · `done`
- `solution` — (необязательно) краткое текстовое описание итогового решения; заполняется при закрытии

---

## Рёбра

Набор типов рёбер открыт: помимо описанных ниже, любые дополнительные связи могут быть добавлены без изменения схемы базы данных.

| Ребро        | Направление              | Смысл                                                                                   |
|--------------|--------------------------|-----------------------------------------------------------------------------------------|
| `DEPENDS_ON` | `(child)-[:DEPENDS_ON]->(blocker)` | Операциональная зависимость и **декомпозиция**: A не может быть выполнено / понято до B. Главный инструмент разбиения сложного на простое: сложный Concept → простые под-концепты, сложная Task → подзадачи, сложная Problem → подпроблемы. Используй для планирования и иерархии. |
| `LEADS_TO`   | `(cause)-[:LEADS_TO]->(effect)` | Направленный переход от причины / предпосылки к следствию / результату. Покрывает логическое следствие («из X вытекает Y»), каузальную цепочку («X приводит к Y»), а также итог рефлексии («решения X и Y привели к результату Z»). **Инструмент рефлексии и осмысления по итогам**, не планирования: несколько предпосылок-родителей → один итог. |
| `HAS_OPTION` | `(parent)-[:HAS_OPTION]->(option)` | Множественность альтернатив: у одного узла-родителя есть несколько вариантов-потомков, каждый из которых нужно исследовать. Типичный кейс: Problem B, C, D — различные пути решения одной Problem A, всегда один источник → несколько вариантов. |

---

# Interpretation rules

Разбор команды в три шага:

**1. Извлечь сущности** — найти все `PREFIX-NUMBER` в тексте; определить label новых узлов из формулировки:
«задача» → Task, «проблема / вопрос» → Problem, «утверждение / вывод / решение / факт / гипотеза» → Statement, «понятие / концепт / идея» → Concept.

**2. Определить операции** — какие узлы создать / обновить, какие связи создать, что прочитать.

**3. Построить Cypher** — подобрать идиому из раздела ниже; обеспечить `RETURN` с `id` всех затронутых узлов; составные операции объединять в один запрос.
Всегда добавлять фильтр `n.deleted IS NULL` во все MATCH/WHERE.

## Canonical phrase → edge

| Формулировка                                                   | Ребро        |
|----------------------------------------------------------------|--------------|
| зависит от / blocked by / требует / нужно сначала / depends on | DEPENDS_ON   |
| приводит к / вытекает / следует / результат / leads to         | LEADS_TO     |
| вариант / альтернатива / опция / has option                    | HAS_OPTION   |

## Генерация доменного id для нового узла

```cypher
MATCH (n) WHERE n.id STARTS WITH $prefix + '-'
  AND n.deleted IS NULL
RETURN max(toInteger(split(n.id, '-')[1])) AS max_num
```

В `RETURN` нового узла всегда возвращать `id`.

---

# Cypher patterns

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
  WHERE cause.deleted IS NULL AND cause.status <> 'done'
OPTIONAL MATCH (n)-[:LEADS_TO]->(effect)
  WHERE effect.deleted IS NULL AND effect.status <> 'done'
OPTIONAL MATCH (n)-[:HAS_OPTION]->(option)
  WHERE option.deleted IS NULL AND option.status <> 'done' 
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
