# Extended GQL (Cypher) patterns

## Сводная схема

```
(work:Task|Problem)
  -[:HAS_PRIORITY]->(Priority { level })          // без id, 1:1
  -[:HAS_URGENCY]->(Urgency { dueFrom, dueTo, mode, reason, reasonDetail, reasonNote })
  -[:HAS_EFFORT]->(Effort { size, durationValue, durationUnit, concentration, interruptible })
  -[:DEPENDS_ON]->(blocker)

(Priority|Urgency|Effort)-[:RANKS_ABOVE]->(same label)
```

## Примеры применения

Узлы, свойства и рёбра из [docs/planning-ontology.md](../../../docs/planning-ontology.md).

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

---
