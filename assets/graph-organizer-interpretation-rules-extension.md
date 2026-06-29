# Extended interpretation rules

Разбор реплики пользователя в четыре шага:

**1. Извлечь сущности** — найти все `PREFIX-NUMBER`; даты и относительные сроки («до пятницы», «через неделю»); людей и роли (`reasonDetail`: «Рома», «Первов»); ресурсы запроса (время, концентрация, прерываемость).

**2. Определить намерение** — triage выборка (чем заняться сейчас) · задать/обновить Priority · задать/обновить Urgency · задать/обновить Effort · декомпозиция / блокер · относительный порядок (`RANKS_ABOVE`) · только чтение контекста.

**3. Сопоставить с осями** — каждый смысл ровно на одну ось; не смешивать важность, срок и объём усилий. При неоднозначности (snooze vs deadline, hard vs soft) — уточнить у пользователя.

**4. Сформулировать команду** — одна или несколько декларативных инструкций для навыка[/graph-executor-command-interpreter](skill://graph-executor-command-interpreter) с id work-узлов и явными значениями свойств.

## Canonical phrase → axis

| Формулировка | Ось / операция |
|--------------|----------------|
| важно / критично / стратегически / приоритет | `HAS_PRIORITY` → `level` |
| не срочно / когда-нибудь / низкий приоритет | `HAS_PRIORITY` → `level: low` или `normal` |
| срочно / горит / дедлайн / до \<дата\> | `HAS_URGENCY` → `dueTo`, `reason: deadline` |
| выполнить \<окно дат\> / в этот период | `HAS_URGENCY` → `dueFrom` + `dueTo`, `reason: window` |
| отложи / не беспокоить / snooze / вернуться после | `HAS_URGENCY` → `dueFrom`, `reason: snooze` |
| жду / waiting / жду ответа \<кто\> | `HAS_URGENCY` → `dueFrom`, `reason: waiting`, `reasonDetail` |
| обещал / commitment | `HAS_URGENCY` → `dueTo` (+ опц. `dueFrom`), `reason: commitment`, `reasonDetail` |
| проверю у / delegation / делегировал | `HAS_URGENCY` → `dueFrom`, `reason: delegation`, `reasonDetail` |
| сознательно отложил / загружен | `HAS_URGENCY` → `dueFrom`, `reason: load` |
| hard deadline / нарушение обязательства | Urgency → `mode: hard` |
| ~N минут/часов / deep work / лёгкое / прерывается | `HAS_EFFORT` → `size`, `duration*`, `concentration`, `interruptible` |
| сначала X / blocked by / зависит от / жду Y | `DEPENDS_ON` (+ при необходимости свой Urgency/Effort на блокере) |
| X важнее/срочнее/тяжелее Y | `RANKS_ABOVE` между соответствующими Priority / Urgency / Effort |
| что делать / triage / что успею | чтение + pipeline triage (§ ниже) |

## Canonical phrase → Urgency `reason`

| reason | Когда | Типичные поля |
|--------|-------|---------------|
| `window` | выполнить в интервале | `dueFrom`, `dueTo` |
| `deadline` | сдать к дате | `dueTo`; опц. `mode: hard` |
| `snooze` | отложить, снять с фокуса до даты | только `dueFrom` |
| `waiting` | жду внешнее событие | `dueFrom`, `reasonDetail` |
| `commitment` | обещание | `dueTo` (+ опц. `dueFrom`), `reasonDetail` |
| `delegation` | проверить у делегата | `dueFrom`, `reasonDetail` |
| `load` | отложено из‑за загрузки | `dueFrom` |

Snooze, waiting, check-back, delegation-follow-up — все через **`dueFrom`** с разным `reason`.

---

## Triage выборка "Что может быть включено в текущий фокус исполнения"

**Вход:** `NOW()` = текущее время; имеющиеся ресурсы из реплики (время, `concentration`, `interruptible`).

**Выход:** короткий ранжированный список

Из пула TODO на запрос triage подсвечивается минимально необходимая область

Не предлагать задачи с `dueFrom > NOW()` или незакрытыми блокерами как «сделать сейчас» без явной оговорки.

---

### Pipeline

1. Пул: Task|Problem, deleted IS NULL, status <> 'done'

2. Важность
   effective Priority (с наследованием §6)
   → что высвечивается по importance

3. Срочность
   effective Urgency
   исключить: dueFrom > NOW()
   поднять: dueTo близко или просрочен
   → что высвечивается / убирается по несрочности

4. Исполнимость
   нет незакрытых DEPENDS_ON → actionable
   иначе → «не сейчас» + цепочка блокеров (декомпозиция)

5. Ресурсы
   effective Effort vs имеющиеся ресурсы
   → подходит / не подходит

6. Что может быть включено в текущий фокус исполнения
   агент предлагает 3–5 кандидатов

---

## Ресурсы запроса (из диалога с пользователем)

| Формулировка | Фильтр triage |
|--------------|---------------|
| есть N минут / час / полдня | `durationValue`, `durationUnit` ≤ N |
| до обеда / до встречи | `duration` + `NOW()` |
| только лёгкое / без deep work | `concentration` ≠ `deep` |
| могу прерываться | `interruptible: true` |
| между встречами / в дороге | малый `size`, `interruptible: true` |

Если ресурсы не названы — triage по важности и срочности; Effort — как подсказка.

---
