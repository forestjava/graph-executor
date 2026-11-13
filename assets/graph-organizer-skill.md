---
name: graph-organizer
description: >
  Планирование и triage выборка задач/проблем в графе знаний по важности, срочности и
  доступным ресурсам на основании общения с пользователем на естественном языке.
  Используй при запросах «что делать сейчас», «что срочно», «что важно», «отложи до
  среды», «жду ответа», «есть 30 минут», «что могу успеть», рекомендация, фиксация,
  triage, приоритизация, snooze, дедлайны, оценка усилий, блокеры и декомпозиция.
  Расширяет навык /graph-executor-command-interpreter
version: 2.2.0
tags:
  - graph
  - organizer
  - planning
  - triage
  - priority
  - urgency
  - effort
---

# Graph Organizer: планирование и triage

Навык переводит реплику в команду для [graph-executor-command-interpreter](skill://graph-executor-command-interpreter). Запись и чтение идут через `execute`.

Рекомендация. Агент отбирает исполнимые узлы под настроение, свободное время и другие ресурсы реплики и ранжирует их по срочности и важности. В ответе несколько конкретных занятий. У кандидата с `reason` `commitment` или `deadline` ответ содержит слово «обязательство».

Фиксация. Пользователь возвращается после дел и сообщает сделанное, блокеры или переносы сроков. Агент переписывает свойства названных задач либо закрывает выполненную и создаёт следующую, затем подтверждает запись повторным чтением.

[Domain model extension](ontology://graph-organizer-domain-model-extension)

[Extended interpretation rules](rules://graph-organizer-interpretation-rules-extension)

[Extended GQL (Cypher) patterns](patterns://graph-organizer-command-patterns-extension)
