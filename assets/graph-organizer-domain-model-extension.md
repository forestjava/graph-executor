# Онтология планирования: Priority, Urgency, Effort

Дополнение к [Domain model](ontology://graph-executor-domain-model)

---

## Принципы

| Принцип | Содержание |
|---------|------------|
| **Узлы как сложные атрибуты** | Priority, Urgency, Effort — необязательные; хранятся узлами со связями, не полями Task/Problem. |
| **Без собственного id** | У Priority, Urgency, Effort **нет** доменного `id` (PREFIX-NUMBER). Вне привязки к задаче/проблеме они не существуют. Ровно **одна** оценка каждого типа на «задачный» узел. |
| **Наследование вниз** | Атрибут родителя распространяется на цепочку `DEPENDS_ON`, пока у потомка нет своего (§6). |
| **Относительное сравнение** | Между узлами одного label — ребро `RANKS_ABOVE`. |

---

## 1. Priority (важность)

**Label:** `Priority`  
**Синоним:** importance.

### Связь

```
(work:Task|Problem)-[:HAS_PRIORITY]->(p:Priority)
```

- Одна связь `HAS_PRIORITY` на work-узел.
- Узел Priority **без** `id`; идентифицируется через work-узел.

### Свойства

| Свойство | Тип | Смысл |
|----------|-----|--------|
| `level` | enum | `critical` · `high` · `normal` · `low` |

### Относительный порядок

```
(p1:Priority)-[:RANKS_ABOVE]->(p2:Priority)
```

Enum задаёт корзину; рёбра — нюанс внутри или между корзинами («одно важнее другого»).

---

## 2. Urgency (срочность)

**Label:** `Urgency`  
Единственная ось привязки к календарю и датам.

### Связь

```
(work)-[:HAS_URGENCY]->(u:Urgency)
```

- Одна связь `HAS_URGENCY` на work-узел.
- Узел **без** `id`.

### Универсальная модель времени

Вместо множества специализированных полей — **два абстрактных момента** и **атрибуция причины**:

| Свойство | Тип | Смысл |
|----------|-----|--------|
| `dueFrom` | date/datetime | **Приступить не ранее чем** (`due from`) — сознательное снятие с радара, ожидание внешнего события, «вернуться к проверке», начало допустимого окна |
| `dueTo` | date/datetime | **Закончить не позднее чем** (`due to`) — конец окна выполнения, точка «горения», жёсткий дедлайн, граница нарушения обязательства |
| `mode` | enum | `soft` · `hard` — что означает просрочка `dueTo` (мягко vs нарушение) |
| `reason` | string | Почему заданы рамки (см. ниже) |
| `reasonDetail` | string | Конкретика: «Рома», «Первов», «обещание дочери», «переезд»… |

#### Значения `reason`

| reason | Типичная конфигурация | Пример |
|--------|----------------------|--------|
| `window` | `dueFrom` + `dueTo` | выполнить 29–30 июня |
| `deadline` | только `dueTo` | сдать до пятницы |
| `snooze` | только `dueFrom` | не беспокоить до среды |
| `waiting` | `dueFrom` + `reasonDetail` | жду ответа Ромы |
| `commitment` | `dueTo` (+ опц. `dueFrom`) + `reasonDetail` | обещание; после даты = нарушение |
| `delegation` | `dueFrom` + `reasonDetail` | проверить статус у Первова после … |
| `load` | `dueFrom` | сознательно отложено из‑за загруженности |

**Сведённые эквивалентности:**

- Конец окна выполнения = точка «горения» = `dueTo` (при `mode: hard` или escalation-контексте).
- Snooze = waiting = check-back = delegation-follow-up → все через **`dueFrom`** с разным `reason`.
- Commitment «есть запас до X / нарушение после X» → `dueFrom` (опц.) + `dueTo` + `reason: commitment`.

### Относительный порядок

```
(u1:Urgency)-[:RANKS_ABOVE]->(u2:Urgency)
```

«U1 срочнее U2» — по датам, `mode`, рёбрам.

---

## 3. Effort (оценка усилий)

**Label:** `Effort`  
Только объём **времени и внимания**.

### Связь

```
(work)-[:HAS_EFFORT]->(e:Effort)
```

- Одна связь `HAS_EFFORT` на work-узел.
- Узел **без** `id`.

### Свойства

| Свойство | Тип | Смысл |
|----------|-----|--------|
| `size` | enum | `xs` · `s` · `m` · `l` · `xl` — грубая корзина |
| `durationValue` | number | Количество |
| `durationUnit` | enum | `minutes` · `hours` · `days` · `weeks` · `months` · `years` |
| `concentration` | enum | `deep` · `medium` · `light` — степень концентрации |
| `interruptible` | boolean | Можно прерывать / совмещать с другим контекстом |

**Примеры:** отладка — `deep`, `interruptible: false`; прогулка с дочерью — `light`, `interruptible: false`; посылка на почте — `interruptible: true` (перерыв между блоками deep work).

### Относительный порядок

```
(e1:Effort)-[:RANKS_ABOVE]->(e2:Effort)
```

---

## Наследование по DEPENDS_ON

```
(child)-[:DEPENDS_ON*1..]->(ancestor)-[:HAS_URGENCY|HAS_PRIORITY]->(attr)
```

Если у `child` нет своего `HAS_*`, используется атрибут предка.

| Атрибут | Наследование |
|---------|--------------|
| Priority | да, по умолчанию |
| Urgency | да, по умолчанию |
| Effort | нет, по умолчанию свой (блокер часто короче/проще родителя) |

---

## Рёбра

| Ребро | Направление | Смысл |
|-------|-------------|--------|
| `HAS_PRIORITY` | work → Priority | Важность (1:1) |
| `HAS_URGENCY` | work → Urgency | Срочность (1:1) |
| `HAS_EFFORT` | work → Effort | Усилия (1:1) |
| `RANKS_ABOVE` | Priority/Urgency/Effort → same label | Относительное «больше / срочнее / тяжелее» |
| `DEPENDS_ON` | child → blocker | Без изменений |

---
