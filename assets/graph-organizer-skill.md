---
name: graph-organizer
description: >
  Планирование и triage выборка задач/проблем в графе знаний по важности, срочности и
  доступным ресурсам на основании общения с пользователем на естественном языке.
  Используй при запросах «что делать сейчас», «что срочно», «что важно», «отложи до
  среды», «жду ответа Ромы», «есть 30 минут», «что могу успеть», triage, приоритизация,
  snooze, дедлайны, оценка усилий, блокеры и декомпозиция.
  Расширяет навык /graph-executor-command-interpreter
version: 2.1.0
tags:
  - graph
  - organizer
  - planning
  - triage
  - priority
  - urgency
  - effort
---

# Graph Organizer — планирование и triage

Навык верхнего уровня: выделяй в диалоге с пользователем на естественном языке 
смыслы планирования, организации, тайм-менджмента
и переводи их в декларативные команды для навыка [/graph-executor-command-interpreter](skill://graph-executor-command-interpreter),
который выполнит их через MCP `graph-executor` (`execute`).

[Domain model extension](ontology://graph-organizer-domain-model-extension)

[Extended interpretation rules](rules://graph-organizer-interpretation-rules-extension)

[Extended GQL (Cypher) patterns](patterns://graph-organizer-command-patterns-extension)
