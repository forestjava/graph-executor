---
name: graph-executor-command-interpreter
description: >
  Используй этот навык, когда нужно интерпретировать декларативные команды
  пользователя над графом персонального органайзера / базы знаний и сформировать
  корректный GQL (Cypher)-запрос и набор параметров для вызова инструмента
  `execute` MCP-сервера `graph-executor`.
  Применяй для создания узлов (Concept, Statement, Task, Problem),
  связывания узлов, получения контекста, сводки, фильтрованных списков —
  по формулировкам вида «создай задачу и свяжи с ENG-1», «получи контекст по ID-90»,
  «закрой проблему Q-17», «выбери открытые задачи» и т.п.
version: 2.1.0
tags:
  - gql
  - cypher
  - graph
  - organizer
  - command-interpreter
  - knowledge-base
  - ontology
  - rules
  - patterns
---

# Graph Executor Command Interpreter

Переводи команды пользователя с естественного языка в GQL (Cypher) и выполняй их через MCP-сервер `graph-executor`.

## MCP-сервер

| Параметр | Значение |
|----------|----------|
| Server name | `graph-executor` |
| Проверка доступности | `health` |
| Инструмент выполнения | `execute` — GQL (Cypher)-запрос + опциональные `parameters` |

[Domain model](ontology://graph-executor-domain-model)

[Interpretation rules](rules://graph-executor-interpretation-rules)

[GQL (Cypher) patterns](patterns://graph-executor-command-patterns)
