# Шаблоны GQL (Cypher) верхнего уровня

## Сводная схема

```
(work:Task|Problem)
  -[:HAS_PRIORITY]->(Priority { level })          // без id, 1:1
  -[:HAS_URGENCY]->(Urgency { dueFrom, dueTo, mode, reason, reasonDetail })
  -[:HAS_EFFORT]->(Effort { size, durationValue, durationUnit, concentration, interruptible })
  -[:DEPENDS_ON]->(subtask)

(Priority|Urgency|Effort)-[:RANKS_ABOVE]->(same label)
```

## Примеры применения

Узлы, свойства и рёбра из [Онтология верхнего уровня](ontology://graph-organizer-domain-model).

## 1. Важность без срочности

**Пользователь:** «Стратегия контрактов ALB-6 — очень важно, но не горит.»

```
(ALB-6:Task)-[:HAS_PRIORITY]->(:Priority { level: 'high' })
```

Urgency не задаём — без близкого `dueTo`.

## 2. Snooze vs дедлайн

**Пользователь:** «ALB-4 не трогай до среды.»

```
(ALB-4)-[:HAS_URGENCY]->(:Urgency { dueFrom: date('2026-07-02'), reason: 'snooze' })
```

**Пользователь:** «ALB-4 сдать до пятницы, иначе проблема.»

```
(ALB-4)-[:HAS_URGENCY]->(:Urgency {
  dueTo: date('2026-07-04'), mode: 'hard', reason: 'deadline'
})
```

## 3. Waiting-блокер

**Пользователь:** «БЫТ-13 не могу двигать, пока Рома не ответит.»

```
(БЫТ-14:Task { title: 'Жду ответа Ромы по чашам', status: 'open' })
  -[:HAS_URGENCY]->(:Urgency { reason: 'waiting', dueFrom: datetime(), reasonDetail: 'Рома' })
(БЫТ-13)-[:DEPENDS_ON]->(БЫТ-14)
```

## 4. Effort

**Пользователь:** «ALB-7 — часа два, deep focus, без отвлечений.»

```
(ALB-7)-[:HAS_EFFORT]->(:Effort {
  size: 'm', durationValue: 2, durationUnit: 'hours',
  concentration: 'deep', interruptible: false
})
```

| Задача | Effort |
|--------|--------|
| Отладка | `concentration: deep`, `interruptible: false` |
| Прогулка с дочерью | `concentration: light`, `interruptible: false` |
| Посылка на почте | `interruptible: true` |

## 5. Commitment

**Пользователь:** «Обещал дочери — кино в субботу, подготовить до пятницы.»

```
(TASK-…)-[:HAS_URGENCY]->(:Urgency {
  dueFrom: date('2026-06-27'), dueTo: date('2026-06-28'),
  mode: 'hard', reason: 'commitment', reasonDetail: 'обещание дочери'
})
```

## 6. RANKS_ABOVE

**Пользователь:** «ALB-7 важнее ALB-3.»

```
(p1:Priority)<-[:HAS_PRIORITY]-(ALB-7),
(p2:Priority)<-[:HAS_PRIORITY]-(ALB-3)
MERGE (p1)-[:RANKS_ABOVE]->(p2)
```

## 7. Triage с ресурсами

**Пользователь:** «Есть 45 минут, могу прерываться, что успеть?»

1. Открытые actionable Task.
2. Effective Priority + Urgency на `NOW()`.
3. Effort: ≤ 45 min, `interruptible: true` предпочтительно.
4. Ответ: 3–5 кандидатов.

## 8. Эффективная важность и срочность

Наследование от ближайшего незакрытого и неудалённого родителя (см. «Наследование по DEPENDS_ON»
в [Онтология верхнего уровня](ontology://graph-organizer-domain-model)).

```cypher
MATCH (n {id: $id}) WHERE n.deleted IS NULL
OPTIONAL MATCH (n)-[:HAS_PRIORITY]->(own:Priority)
OPTIONAL MATCH path = (a)-[:DEPENDS_ON*1..]->(n)
  WHERE own IS NULL AND a.deleted IS NULL AND coalesce(a.status, '') <> 'done'
    AND (a)-[:HAS_PRIORITY]->()
WITH n, own, a, length(path) AS dist
ORDER BY dist ASC, a.id ASC
WITH n, own, head(collect(a)) AS nearest
OPTIONAL MATCH (nearest)-[:HAS_PRIORITY]->(inherited:Priority)
RETURN n.id AS id, coalesce(own.level, inherited.level) AS priority,
       CASE WHEN own IS NULL THEN nearest.id END AS inheritedFrom
```

Для Urgency запрос такой же, с заменой `HAS_PRIORITY` на `HAS_URGENCY` и `Priority` на `Urgency`
(возвращать нужные поля Urgency вместо `level`).

Уже записанные свойства, которых нет в `SET` запросов ниже, запросы не удаляют.

## 9. Уникальность ключа экземпляра

Один раз перед первой записью серии:

```cypher
CREATE CONSTRAINT task_occurrence_key IF NOT EXISTS
FOR (t:Task) REQUIRE t.occurrenceKey IS UNIQUE
```

## 10. Запись серии и слотов

Даты существующего ключа запрос не перезаписывает.

```cypher
MERGE (s:Series {id: $seriesId})
SET s.timeZone = $timeZone, s.frequency = $frequency, s.interval = $interval,
    s.byWeekday = $byWeekday, s.byMonthDay = $byMonthDay, s.localTime = $localTime,
    s.validFrom = $validFrom, s.validTo = $validTo, s.title = $title,
    s.prefix = $prefix, s.updatedAt = datetime()
ON CREATE SET s.createdAt = datetime()
WITH s
UNWIND $slots AS slot
MERGE (t:Task {occurrenceKey: slot.key})
ON CREATE SET t.id = slot.id, t.prefix = $prefix, t.seriesId = s.id,
    t.title = slot.title, t.status = 'open', t.summary = '',
    t.scheduleRole = 'execution', t.createdAt = datetime()
SET t.updatedAt = datetime()
MERGE (t)-[:HAS_URGENCY]->(u:Urgency)
ON CREATE SET u.dueFrom = datetime(slot.start), u.dueTo = datetime(slot.end),
    u.reason = 'window'
RETURN t.id AS id, t.occurrenceKey AS occurrenceKey
```

## 11. Чтение после записи

```cypher
MATCH (t:Task {seriesId: $seriesId})
WHERE t.deleted IS NULL
OPTIONAL MATCH (t)-[:HAS_URGENCY]->(u)
RETURN t.id AS id, t.occurrenceKey AS occurrenceKey, t.status AS status,
       u.dueFrom AS dueFrom, u.dueTo AS dueTo
ORDER BY t.occurrenceKey
```

## 12. Перенос одного экземпляра

В параметр неназванной даты передаётся `null`.

```cypher
MATCH (t:Task {id: $id})-[:HAS_URGENCY]->(u)
WHERE t.deleted IS NULL
SET u.dueFrom = coalesce(datetime($dueFrom), u.dueFrom),
    u.dueTo = coalesce(datetime($dueTo), u.dueTo),
    t.updatedAt = datetime()
RETURN t.id AS id, t.occurrenceKey AS occurrenceKey, u.dueFrom AS dueFrom, u.dueTo AS dueTo
```

## 13. События окна

```cypher
MATCH (n)-[:HAS_URGENCY]->(u:Urgency)
WHERE n.deleted IS NULL AND coalesce(n.status, '') <> 'done'
  AND u.reason = 'window'
  AND u.dueFrom < datetime($windowTo) AND u.dueTo > datetime($windowFrom)
RETURN n.id AS id, n.title AS title, u.dueFrom AS dueFrom, u.dueTo AS dueTo
ORDER BY u.dueFrom, n.id
SKIP $shown
```

## 14. Обязательства

Открытые экземпляры серии входят в эту выборку.

```cypher
MATCH (n)
WHERE n.deleted IS NULL AND coalesce(n.status, '') <> 'done'
  AND (
    EXISTS { MATCH (n)-[:HAS_URGENCY]->(u) WHERE u.reason IN ['commitment', 'deadline'] }
    OR n.seriesId IS NOT NULL
  )
RETURN n.id AS id, n.title AS title, n.seriesId AS seriesId, n.occurrenceKey AS occurrenceKey
ORDER BY n.id
SKIP $shown
```

## 15. Исполнимые шаги

`$prefix` равен `null`, когда контекст не назван.

```cypher
MATCH (n)
WHERE n.deleted IS NULL AND coalesce(n.status, '') <> 'done'
  AND ($prefix IS NULL OR n.prefix = $prefix)
  AND NOT EXISTS {
    MATCH (n)-[:DEPENDS_ON]->(b)
    WHERE b.deleted IS NULL AND coalesce(b.status, '') <> 'done'
  }
RETURN n.id AS id, n.title AS title, n.prefix AS prefix, n.assignee AS assignee,
       n.scheduleRole AS scheduleRole
ORDER BY n.id
SKIP $shown
```

## 16. Открытые задачи с прошедшим dueTo

```cypher
MATCH (n)-[:HAS_URGENCY]->(u)
WHERE n.deleted IS NULL AND coalesce(n.status, '') <> 'done'
  AND u.dueTo < datetime($now)
RETURN n.id AS id, n.title AS title, u.dueTo AS dueTo, u.reason AS reason
ORDER BY u.dueTo, n.id
SKIP $shown
```

## 17. Закрытие

```cypher
MATCH (n:Task {id: $id})
WHERE n.deleted IS NULL
SET n.status = 'done', n.updatedAt = datetime()
RETURN n.id AS id, n.status AS status
```

## 18. Закрытие и следующая задача

```cypher
MATCH (old:Task {id: $id})
WHERE old.deleted IS NULL
SET old.status = 'done', old.updatedAt = datetime()
CREATE (n:Task {
  id: $newId, prefix: old.prefix, title: $title, status: 'open', summary: '',
  createdAt: datetime(), updatedAt: datetime()
})
RETURN old.id AS closedId, n.id AS nextId
```

---
