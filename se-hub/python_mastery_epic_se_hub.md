# EPIC: Python Mastery Learning Path for SE-HUB

## Epic Summary

Create a new **Python Mastery** academy inside SE-HUB to help a software engineer learn Python from zero to interview-ready level.

The learning path should be designed for a developer who already has strong experience with JavaScript, TypeScript, React, frontend architecture, and general software engineering, but has little or no hands-on Python experience.

The final result should be a complete academy available inside SE-HUB with structured modules, interview questions, coding challenges, practical examples, and a final backend-oriented project.

---

## Epic Goal

As a software engineer preparing for Python interviews, I want a complete Python learning path inside SE-HUB so that I can learn Python fundamentals, understand Python-specific concepts, practice coding challenges, and prepare for technical interviews confidently.

---

## Target Audience

- Senior frontend/fullstack engineer
- Strong JavaScript/TypeScript background
- Little or no real Python production experience
- Preparing for Python-focused technical interviews
- Wants practical, interview-oriented explanations

---

## Proposed Academy Name

```txt
Python Mastery
```

## Proposed Academy Slug

```txt
python-mastery
```

## Suggested Location

```txt
src/modules/python-mastery/
```

---

## High-Level Scope

This academy should cover:

- Python syntax and fundamentals
- Data types and collections
- Mutability and references
- Control flow
- Functions and scope
- Pythonic code
- Object-oriented Python
- Error handling
- Modules and packages
- Virtual environments and dependency management
- File I/O
- Standard library essentials
- Iterators and generators
- Decorators
- Context managers
- Modern Python typing
- Testing with pytest
- Async Python
- FastAPI backend basics
- Database and ORM basics
- Algorithms and data structures in Python
- Python interview question bank
- Python coding challenges
- Final practical project
- Python for JavaScript/TypeScript developers
- Glossary and cheat sheet

---

## Suggested Final Learning Path Order

```txt
01. Python Fundamentals
02. Data Types and Collections
03. Control Flow and Loops
04. Functions, Scope, and Arguments
05. Pythonic Code and Comprehensions
06. Object-Oriented Python
07. Error Handling and Debugging
08. Modules, Packages, and Environment Management
09. File I/O and Standard Library Essentials
10. Advanced Python Concepts
11. Modern Python Typing
12. Testing with Pytest
13. Async Python
14. Backend with FastAPI
15. Databases and ORM Basics
16. Algorithms and Data Structures in Python
17. Python Interview Question Bank
18. Python Coding Challenges
19. Final Python Interview Project
20. Python Glossary and Cheat Sheet
21. Python for JavaScript/TypeScript Developers
```

---

# Important Python Interview Topics to Cover

The academy must strongly cover these concepts because they are common in Python interviews:

```txt
- list vs tuple
- set vs list
- dict/hash map behavior
- mutability vs immutability
- shallow copy vs deep copy
- Python argument passing
- mutable default arguments
- LEGB scope
- *args and **kwargs
- decorators
- generators and yield
- iterators
- context managers
- with statement
- exception handling
- OOP: self, classmethod, staticmethod
- dataclasses
- dunder methods
- type hints
- Optional, Union, Literal, Protocol, TypedDict
- pytest fixtures and mocking
- async/await
- event loop
- GIL basics
- concurrency vs parallelism
- FastAPI basics
- Pydantic validation
- SQLAlchemy basics
- common standard library modules
- Big O in Python
- collections.Counter
- collections.defaultdict
- collections.deque
- heapq
- bisect
```

---

# Ticket 1: Create Python Mastery Academy Module Structure

## Description

As a SE-HUB user, I want a new Python Mastery academy registered in the platform so that I can access Python learning content from the dashboard and learning paths.

## Acceptance Criteria

- A new `python-mastery` academy exists under `src/modules/python-mastery`.
- The academy exports a valid `manifest` and `routes`.
- The academy appears in the SE-HUB dashboard/path discovery.
- The academy can be opened from `/learn/python-mastery/...`.
- The academy follows the existing SE-HUB academy contract.

## Dev Notes

Suggested structure:

```txt
src/modules/python-mastery/
  index.ts
  manifest.ts
  routes.ts
  content/
    01-python-fundamentals.tsx
    02-data-types-and-collections.tsx
    03-control-flow-and-loops.tsx
    04-functions-scope-and-arguments.tsx
    05-pythonic-code-and-comprehensions.tsx
    06-object-oriented-python.tsx
    07-error-handling-and-debugging.tsx
    08-modules-packages-and-envs.tsx
    09-file-io-and-standard-library.tsx
    10-advanced-python-concepts.tsx
    11-modern-python-typing.tsx
    12-testing-with-pytest.tsx
    13-async-python.tsx
    14-backend-with-fastapi.tsx
    15-databases-and-orm-basics.tsx
    16-algorithms-and-data-structures-python.tsx
    17-python-interview-question-bank.tsx
    18-python-coding-challenges.tsx
    19-final-python-interview-project.tsx
    20-python-glossary-and-cheat-sheet.tsx
    21-python-for-js-ts-developers.tsx
  components/
    PythonCodeBlock.tsx
    InterviewQuestion.tsx
    ChallengeCard.tsx
```

## Claude Prompt

```txt
You are working in the SE-HUB Next.js project.

Create a new academy module called `python-mastery`.

Goal:
Add a new Python learning path academy from zero to hero, focused on interview preparation.

Requirements:
1. Create the module under `src/modules/python-mastery`.
2. Export a `manifest` and `routes` from `src/modules/python-mastery/index.ts`.
3. Follow the same academy/module contract used by the existing academies in the project.
4. Add the academy to the global registry so `/learn/python-mastery/...` works.
5. Add the academy to the mock/discovery data so it appears in the dashboard and learning paths.
6. Use a clean title, description, estimated duration, difficulty, tags, and module list.

Academy metadata:
- title: Python Mastery
- slug: python-mastery
- description: Learn Python from fundamentals to advanced interview-ready topics.
- level: Beginner to Advanced
- audience: Software engineers coming from JavaScript/TypeScript
- tags: Python, Backend, Interviews, Algorithms, Testing, FastAPI

Do not over-engineer. Match the existing SE-HUB patterns.
```

---

# Ticket 2: Create Python Fundamentals Module

## Description

As a learner, I want to understand Python syntax and basic execution flow so that I can start writing simple Python programs confidently.

## Acceptance Criteria

- Module explains Python syntax, indentation, comments, variables, constants, and basic printing.
- Module compares Python syntax with JavaScript/TypeScript where helpful.
- Module includes interview questions.
- Module includes small exercises.
- Module explains `if __name__ == "__main__"` clearly.

## Topics

- What Python is
- Running Python files
- REPL basics
- Indentation-based blocks
- Variables
- Dynamic typing
- Naming conventions
- Comments
- Basic `print`
- Basic input
- Python script execution
- `if __name__ == "__main__"`

## Common Interview Questions

- What is Python?
- Why is Python considered dynamically typed?
- What does indentation mean in Python?
- What is the purpose of `if __name__ == "__main__"`?
- Is Python compiled or interpreted?

## Claude Prompt

```txt
Create the first content module for the SE-HUB Python Mastery academy.

File:
`src/modules/python-mastery/content/01-python-fundamentals.tsx`

Goal:
Teach Python fundamentals to a senior frontend/fullstack engineer who knows JavaScript/TypeScript but has not worked with Python.

Include:
1. Clear explanation of Python syntax.
2. Indentation rules.
3. Variables and dynamic typing.
4. Basic input/output.
5. How to run a Python file.
6. `if __name__ == "__main__"` explained deeply but simply.
7. Comparison notes with JavaScript/TypeScript.
8. 8 common interview questions with answers.
9. 5 small exercises.
10. A final mini challenge.

Use the existing content/component style in SE-HUB.
Keep the tone practical, senior-engineer friendly, and interview-oriented.
```

---

# Ticket 3: Create Python Data Types and Collections Module

## Description

As a learner, I want to understand Python’s core data types and collections so that I can solve basic problems and answer common interview questions.

## Acceptance Criteria

- Module explains primitive and collection types.
- Module clearly explains mutability vs immutability.
- Module includes examples for list, tuple, set, and dict.
- Module includes comparison with JS arrays, objects, maps, and sets.
- Module includes interview questions and coding exercises.

## Topics

- `int`, `float`, `bool`, `str`, `None`
- Lists
- Tuples
- Sets
- Dictionaries
- Mutability vs immutability
- Shallow copy vs reference
- Deep copy basics
- Slicing
- Membership checks
- Truthy/falsy values
- String operations

## Common Interview Questions

- Difference between list and tuple?
- Difference between set and list?
- What is a dictionary in Python?
- What does it mean that strings are immutable?
- What are truthy and falsy values in Python?
- How does slicing work?
- How do you copy a list safely?

## Claude Prompt

```txt
Create the Python Data Types and Collections module.

File:
`src/modules/python-mastery/content/02-data-types-and-collections.tsx`

Audience:
A senior JS/TS engineer learning Python for interviews.

Cover:
1. Primitive types: int, float, bool, str, None.
2. Collections: list, tuple, set, dict.
3. Mutability vs immutability.
4. Reference behavior and copying.
5. Shallow copy vs deep copy basics.
6. Slicing.
7. String operations.
8. Truthy/falsy values.
9. Python collections compared to JavaScript arrays, objects, Map, Set.
10. Common interview traps.
11. 10 interview questions with concise answers.
12. 8 coding exercises.

Add examples with clean Python code.
Make this module practical and interview-focused.
```

---

# Ticket 4: Create Control Flow and Loops Module

## Description

As a learner, I want to understand Python conditionals and loops so that I can write clear control flow and solve basic coding problems.

## Acceptance Criteria

- Module explains `if`, `elif`, `else`.
- Module explains `for`, `while`, `range`, `enumerate`, and `zip`.
- Module explains `break`, `continue`, and loop `else`.
- Module introduces `match/case` basics.
- Module includes coding exercises.

## Topics

- `if / elif / else`
- Comparison operators
- Logical operators
- `for` loops
- `while` loops
- `range`
- `enumerate`
- `zip`
- Loop `else`
- Pattern matching basics with `match/case`

## Common Interview Questions

- How does `range()` work?
- What is `enumerate()` used for?
- What is the difference between `break` and `continue`?
- Does Python have switch/case?
- What is loop `else` in Python?

## Claude Prompt

```txt
Create the Control Flow and Loops module for Python Mastery.

File:
`src/modules/python-mastery/content/03-control-flow-and-loops.tsx`

Cover:
1. if, elif, else.
2. Comparison and logical operators.
3. for loops.
4. while loops.
5. range.
6. enumerate.
7. zip.
8. break and continue.
9. Python loop else.
10. match/case basics.

Include:
- Practical examples.
- JavaScript/TypeScript comparisons where helpful.
- Common interview gotchas.
- 8 interview questions with answers.
- 8 exercises.
- 1 mini challenge involving lists and dictionaries.
```

---

# Ticket 5: Create Functions, Scope, and Arguments Module

## Description

As a learner, I want to understand Python functions deeply so that I can write reusable logic and explain argument behavior in interviews.

## Acceptance Criteria

- Module explains function declaration and return values.
- Module explains positional, keyword, default, `*args`, and `**kwargs`.
- Module explains scope and closures.
- Module explains mutable default argument pitfalls.
- Module includes interview questions.

## Topics

- `def`
- Return values
- Positional arguments
- Keyword arguments
- Default parameters
- `*args`
- `**kwargs`
- Scope
- LEGB rule
- Closures
- Lambda
- Mutable default arguments
- Python argument passing model

## Common Interview Questions

- What are `*args` and `**kwargs`?
- What is the LEGB rule?
- What is a closure?
- What is wrong with mutable default arguments?
- Are Python arguments passed by value or reference?

## Claude Prompt

```txt
Create the Functions, Scope, and Arguments module.

File:
`src/modules/python-mastery/content/04-functions-scope-and-arguments.tsx`

Cover:
1. Function syntax.
2. Return values.
3. Positional vs keyword arguments.
4. Default parameters.
5. *args and **kwargs.
6. Lambda functions.
7. Scope and the LEGB rule.
8. Closures.
9. Mutable default argument pitfall.
10. How Python argument passing actually works.

Include:
- Clear explanations.
- Code examples.
- JS/TS comparisons.
- 10 interview questions with answers.
- 8 exercises.
- 1 debugging challenge around mutable default args.
```

---

# Ticket 6: Create Pythonic Code and Comprehensions Module

## Description

As a learner, I want to write idiomatic Python so that my code looks clean and interview-ready.

## Acceptance Criteria

- Module explains list, dict, and set comprehensions.
- Module explains generator expressions.
- Module explains readability tradeoffs.
- Module includes Pythonic refactoring examples.
- Module introduces basic PEP 8 style principles.

## Topics

- List comprehensions
- Dict comprehensions
- Set comprehensions
- Generator expressions
- `any`
- `all`
- `sum`
- `min`
- `max`
- `sorted`
- Pythonic naming
- PEP 8 basics

## Claude Prompt

```txt
Create the Pythonic Code and Comprehensions module.

File:
`src/modules/python-mastery/content/05-pythonic-code-and-comprehensions.tsx`

Cover:
1. What “Pythonic” means.
2. List comprehensions.
3. Dict comprehensions.
4. Set comprehensions.
5. Generator expressions.
6. Useful built-ins: any, all, sum, min, max, sorted.
7. PEP 8 basics.
8. When not to use comprehensions.

Include:
- Before/after refactoring examples.
- Interview gotchas.
- 8 interview questions with answers.
- 8 exercises.
- 1 refactoring challenge.
```

---

# Ticket 7: Create Object-Oriented Python Module

## Description

As a learner, I want to understand OOP in Python so that I can model objects, use classes, and answer class-related interview questions.

## Acceptance Criteria

- Module explains classes, instances, methods, and attributes.
- Module explains `self`, inheritance, composition, class methods, static methods, and properties.
- Module explains dunder methods.
- Module introduces dataclasses.
- Module includes examples and interview questions.

## Topics

- Classes
- Objects
- `self`
- Instance attributes
- Class attributes
- Instance methods
- Class methods
- Static methods
- Inheritance
- Composition
- Encapsulation conventions
- Properties
- Dunder methods
- `__init__`
- `__repr__`
- `__str__`
- `dataclasses`

## Common Interview Questions

- What is `self`?
- Difference between instance attribute and class attribute?
- Difference between `@staticmethod` and `@classmethod`?
- What are dunder methods?
- What is a dataclass?
- Inheritance vs composition?

## Claude Prompt

```txt
Create the Object-Oriented Python module.

File:
`src/modules/python-mastery/content/06-object-oriented-python.tsx`

Cover:
1. Classes and objects.
2. self.
3. __init__.
4. Instance vs class attributes.
5. Instance methods.
6. @classmethod.
7. @staticmethod.
8. Properties.
9. Inheritance.
10. Composition.
11. Dunder methods.
12. __repr__ vs __str__.
13. dataclasses.

Include:
- Practical examples.
- JS/TS class comparisons.
- 12 interview questions with answers.
- 8 exercises.
- 1 mini project: model a small course/student system.
```

---

# Ticket 8: Create Error Handling and Debugging Module

## Description

As a learner, I want to understand Python exceptions and debugging so that I can write reliable Python code.

## Acceptance Criteria

- Module explains `try`, `except`, `else`, `finally`.
- Module explains raising custom exceptions.
- Module explains debugging basics.
- Module includes common mistakes.
- Module introduces logging basics.

## Topics

- Exceptions
- `try / except`
- Catching specific exceptions
- `else`
- `finally`
- `raise`
- Custom exceptions
- Debugging with `breakpoint()`
- Logging basics

## Common Interview Questions

- Difference between syntax errors and exceptions?
- Why should you avoid bare `except`?
- What does `finally` do?
- How do you create a custom exception?
- When should you raise exceptions?

## Claude Prompt

```txt
Create the Error Handling and Debugging module.

File:
`src/modules/python-mastery/content/07-error-handling-and-debugging.tsx`

Cover:
1. Exceptions.
2. try/except.
3. Specific exception handling.
4. else and finally.
5. raise.
6. Custom exceptions.
7. Why bare except is dangerous.
8. breakpoint().
9. Basic logging.

Include:
- Practical examples.
- Interview gotchas.
- 8 interview questions with answers.
- 6 debugging exercises.
- 1 challenge that requires designing a custom exception.
```

---

# Ticket 9: Create Modules, Packages, and Environment Management Module

## Description

As a learner, I want to understand Python project structure and dependencies so that I can work with real Python applications.

## Acceptance Criteria

- Module explains imports, modules, packages, and `__init__.py`.
- Module explains virtual environments.
- Module explains `pip`, PyPI, and dependency files.
- Module explains common project layouts.

## Topics

- Modules
- Packages
- Imports
- Absolute vs relative imports
- `__init__.py`
- Virtual environments
- `pip`
- `requirements.txt`
- `pyproject.toml`
- PyPI
- Basic project structure
- Environment variables

## Claude Prompt

```txt
Create the Modules, Packages, and Environment Management module.

File:
`src/modules/python-mastery/content/08-modules-packages-and-envs.tsx`

Cover:
1. Python modules.
2. Python packages.
3. imports.
4. Absolute vs relative imports.
5. __init__.py.
6. Virtual environments.
7. pip.
8. requirements.txt.
9. pyproject.toml basics.
10. PyPI.
11. Environment variables.
12. Recommended project structure.

Include:
- Real examples.
- Common import errors and how to debug them.
- 10 interview questions with answers.
- 6 exercises.
```

---

# Ticket 10: Create File I/O and Standard Library Essentials Module

## Description

As a learner, I want to understand Python file handling and useful standard library modules so that I can solve practical scripting and backend problems.

## Acceptance Criteria

- Module explains reading and writing files.
- Module explains context managers with `with`.
- Module introduces useful standard library modules.
- Module includes practical exercises.

## Topics

- File reading
- File writing
- `with open(...)`
- CSV
- JSON
- `pathlib`
- `os`
- `datetime`
- `collections`
- `itertools`
- `functools`
- `re`

## Common Interview Questions

- Why use `with open()`?
- Difference between `os.path` and `pathlib`?
- How do you parse JSON in Python?
- What is `collections.Counter`?
- What is `defaultdict`?

## Claude Prompt

```txt
Create the File I/O and Standard Library Essentials module.

File:
`src/modules/python-mastery/content/09-file-io-and-standard-library.tsx`

Cover:
1. Reading files.
2. Writing files.
3. with open and context managers.
4. JSON handling.
5. CSV handling.
6. pathlib.
7. os.
8. datetime.
9. collections: Counter, defaultdict, deque.
10. itertools basics.
11. functools basics.
12. regex with re.

Include:
- Practical examples.
- Interview questions.
- 8 exercises.
- 1 mini challenge: read a CSV file and summarize values.
```

---

# Ticket 11: Create Advanced Python Concepts Module

## Description

As a learner, I want to understand advanced Python concepts so that I can handle senior-level interview questions.

## Acceptance Criteria

- Module explains iterators, generators, decorators, and context managers.
- Module explains descriptors at a high level.
- Module explains memory/reference behavior.
- Module includes senior-level interview questions.

## Topics

- Iterables
- Iterators
- `iter`
- `next`
- Generators
- `yield`
- Decorators
- Higher-order functions
- Context managers
- `with`
- `__enter__`
- `__exit__`
- Descriptors intro
- Garbage collection basics
- Memory references
- Reference counting

## Common Interview Questions

- What is an iterator?
- What is a generator?
- Difference between `return` and `yield`?
- What is a decorator?
- How does a context manager work?
- What is garbage collection in Python?
- What is reference counting?

## Claude Prompt

```txt
Create the Advanced Python Concepts module.

File:
`src/modules/python-mastery/content/10-advanced-python-concepts.tsx`

Cover:
1. Iterables vs iterators.
2. iter and next.
3. Generators.
4. yield.
5. Generator expressions.
6. Decorators.
7. Higher-order functions.
8. Context managers.
9. __enter__ and __exit__.
10. Descriptor basics.
11. Reference counting.
12. Garbage collection basics.

Include:
- Deep but practical explanations.
- Senior interview questions.
- 12 interview questions with answers.
- 8 exercises.
- 1 challenge: create a custom timer decorator and custom context manager.
```

---

# Ticket 12: Create Modern Python Typing Module

## Description

As a learner, I want to understand Python type hints so that I can write maintainable Python code and explain typing in interviews.

## Acceptance Criteria

- Module explains basic and advanced type hints.
- Module explains Python typing compared to TypeScript.
- Module explains runtime vs static typing.
- Module introduces mypy/pyright conceptually.
- Module introduces Pydantic basics.

## Topics

- Type hints
- `list[str]`, `dict[str, int]`
- `Optional`
- `Union`
- `Literal`
- `TypedDict`
- `Protocol`
- Generics
- `TypeVar`
- Runtime vs static typing
- mypy
- pyright
- Pydantic basics

## Common Interview Questions

- Does Python enforce type hints at runtime?
- Difference between Python typing and TypeScript?
- What is `Optional`?
- What is a `Protocol`?
- What is `TypedDict`?
- What is Pydantic used for?

## Claude Prompt

```txt
Create the Modern Python Typing module.

File:
`src/modules/python-mastery/content/11-modern-python-typing.tsx`

Cover:
1. Why Python has type hints.
2. Runtime typing vs static typing.
3. Basic annotations.
4. list[str], dict[str, int], tuple.
5. Optional.
6. Union.
7. Literal.
8. TypedDict.
9. Protocol.
10. Generics and TypeVar.
11. mypy and pyright basics.
12. Pydantic overview.
13. Differences between Python typing and TypeScript.

Include:
- Practical examples.
- Common interview questions.
- 10 interview questions with answers.
- 8 exercises.
```

---

# Ticket 13: Create Testing with Pytest Module

## Description

As a learner, I want to test Python code with pytest so that I can write production-quality Python and discuss testing in interviews.

## Acceptance Criteria

- Module explains pytest basics.
- Module explains assertions, fixtures, parametrization, and mocking.
- Module includes examples and exercises.
- Module compares pytest with Jest/Vitest.

## Topics

- Why testing matters
- `pytest`
- Test naming
- Assertions
- Fixtures
- Parametrized tests
- Mocking
- Testing exceptions
- Test project structure
- Coverage basics

## Claude Prompt

```txt
Create the Testing Python with Pytest module.

File:
`src/modules/python-mastery/content/12-testing-with-pytest.tsx`

Cover:
1. pytest basics.
2. Test file naming.
3. Test function naming.
4. Assertions.
5. Fixtures.
6. Parametrized tests.
7. Mocking.
8. Testing exceptions.
9. Coverage basics.
10. Comparison with Jest/Vitest.

Include:
- Practical examples.
- 8 interview questions with answers.
- 8 exercises.
- 1 mini challenge: test a service function with fixtures and mocks.
```

---

# Ticket 14: Create Async Python Module

## Description

As a learner, I want to understand async Python so that I can discuss concurrency and backend performance in interviews.

## Acceptance Criteria

- Module explains sync vs async.
- Module explains `async`, `await`, coroutines, tasks, and event loop.
- Module explains when async helps and when it does not.
- Module includes interview questions.

## Topics

- Sync vs async
- Concurrency vs parallelism
- Event loop
- Coroutine
- `async def`
- `await`
- `asyncio`
- `asyncio.gather`
- Tasks
- Blocking vs non-blocking I/O
- Async in FastAPI

## Common Interview Questions

- What is a coroutine?
- What does `await` do?
- What is the event loop?
- Async vs threading?
- Concurrency vs parallelism?
- When should you use async Python?

## Claude Prompt

```txt
Create the Async Python module.

File:
`src/modules/python-mastery/content/13-async-python.tsx`

Cover:
1. Synchronous vs asynchronous execution.
2. Concurrency vs parallelism.
3. Event loop.
4. Coroutines.
5. async def.
6. await.
7. asyncio.
8. asyncio.gather.
9. Tasks.
10. Blocking vs non-blocking I/O.
11. Async use cases in backend APIs.

Include:
- Examples.
- JavaScript async/await comparisons.
- Common mistakes.
- 10 interview questions with answers.
- 6 exercises.
```

---

# Ticket 15: Create Python Backend with FastAPI Module

## Description

As a learner, I want to understand Python backend basics with FastAPI so that I can speak confidently about Python web APIs in interviews.

## Acceptance Criteria

- Module explains FastAPI basics.
- Module shows routes, request bodies, path params, query params, and response models.
- Module introduces Pydantic.
- Module includes simple API exercises.

## Topics

- FastAPI basics
- Routing
- Path parameters
- Query parameters
- Request body
- Response models
- Pydantic models
- Dependency injection in FastAPI
- Error handling
- Middleware intro
- OpenAPI docs
- Testing APIs

## Claude Prompt

```txt
Create the Python Backend with FastAPI module.

File:
`src/modules/python-mastery/content/14-backend-with-fastapi.tsx`

Cover:
1. What FastAPI is.
2. Basic API setup.
3. Routes.
4. Path params.
5. Query params.
6. Request body.
7. Response models.
8. Pydantic models.
9. Dependency injection basics.
10. Error handling.
11. Middleware intro.
12. OpenAPI docs.
13. Testing FastAPI endpoints.

Include:
- Code examples.
- Backend interview questions.
- 10 interview questions with answers.
- 1 mini project: create a task API.
```

---

# Ticket 16: Create Databases and ORM Basics Module

## Description

As a learner, I want to understand Python database integration so that I can discuss backend persistence in interviews.

## Acceptance Criteria

- Module explains relational DB basics from Python.
- Module introduces SQLAlchemy or SQLModel.
- Module explains sessions, models, migrations, and transactions.
- Module includes practical examples.

## Topics

- SQL from Python
- SQLite for learning
- PostgreSQL conceptually
- SQLAlchemy
- ORM models
- Sessions
- Queries
- Transactions
- Migrations with Alembic
- Repository pattern basics

## Claude Prompt

```txt
Create the Databases and ORM Basics module.

File:
`src/modules/python-mastery/content/15-databases-and-orm-basics.tsx`

Cover:
1. Connecting Python apps to databases.
2. SQLite for local learning.
3. PostgreSQL conceptually.
4. SQLAlchemy overview.
5. ORM models.
6. Sessions.
7. Queries.
8. Transactions.
9. Migrations with Alembic.
10. Repository pattern basics.

Include:
- Examples.
- Interview questions.
- 8 interview questions with answers.
- 1 mini challenge: design a user repository.
```

---

# Ticket 17: Create Algorithms and Data Structures in Python Module

## Description

As a learner, I want to solve common coding interview problems in Python so that I can use Python effectively during technical interviews.

## Acceptance Criteria

- Module explains Python-specific tools for algorithms.
- Module includes common patterns.
- Module includes coding exercises with hints.
- Module includes time and space complexity discussion.

## Topics

- Big O refresher
- Arrays/lists
- Strings
- Hash maps/dicts
- Sets
- Stacks
- Queues
- Linked lists
- Trees
- Graphs
- Sorting
- Binary search
- Two pointers
- Sliding window
- BFS/DFS
- Recursion
- Dynamic programming intro

## Python-Specific Tools

- `collections.Counter`
- `defaultdict`
- `deque`
- `heapq`
- `bisect`
- `set`
- `dict`
- `enumerate`
- `zip`

## Claude Prompt

```txt
Create the Algorithms and Data Structures in Python module.

File:
`src/modules/python-mastery/content/16-algorithms-and-data-structures-python.tsx`

Cover:
1. Big O refresher.
2. Lists.
3. Strings.
4. Dicts/hash maps.
5. Sets.
6. Stacks.
7. Queues with deque.
8. Linked lists.
9. Trees.
10. Graphs.
11. Sorting.
12. Binary search.
13. Two pointers.
14. Sliding window.
15. BFS/DFS.
16. Recursion.
17. Dynamic programming intro.
18. Python tools: Counter, defaultdict, deque, heapq, bisect.

Include:
- Common coding interview patterns.
- 15 coding exercises.
- Hints for each exercise.
- Expected complexity for each exercise.
- Python-specific tips for interviews.
```

---

# Ticket 18: Create Python Interview Question Bank

## Description

As a learner, I want a dedicated Python interview question bank so that I can quickly review common questions before interviews.

## Acceptance Criteria

- Question bank includes beginner, intermediate, and advanced questions.
- Each question includes a concise answer.
- Questions are grouped by topic.
- Includes coding and conceptual questions.
- Includes gotchas and code examples where useful.

## Question Categories

- Python basics
- Data types
- Mutability
- Functions
- OOP
- Modules/packages
- Exceptions
- Iterators/generators
- Decorators
- Context managers
- Typing
- Testing
- Async
- Backend
- Algorithms
- Performance

## Claude Prompt

```txt
Create a Python Interview Question Bank for the Python Mastery academy.

File:
`src/modules/python-mastery/content/17-python-interview-question-bank.tsx`

Create a structured question bank with at least 100 questions.

Group questions by:
1. Python basics.
2. Data types and collections.
3. Mutability and memory.
4. Functions and scope.
5. OOP.
6. Modules and packages.
7. Exceptions.
8. Iterators and generators.
9. Decorators.
10. Context managers.
11. Typing.
12. Testing.
13. Async.
14. Backend with FastAPI.
15. Algorithms and data structures.
16. Performance and debugging.

Each question should include:
- Question.
- Concise answer.
- Optional code example when useful.
- Interview gotcha when relevant.

Tone:
Concise, practical, and useful for last-minute interview review.
```

---

# Ticket 19: Create Python Coding Challenges Module

## Description

As a learner, I want Python coding challenges so that I can practice syntax, logic, and common interview patterns.

## Acceptance Criteria

- Module includes beginner, intermediate, and advanced challenges.
- Each challenge has requirements, hints, and expected concepts.
- Challenges avoid giving full solutions immediately.
- Challenges map to previous learning modules.

## Challenge Ideas

### Beginner

- Reverse a string
- Count vowels
- Check palindrome
- Find max number
- Remove duplicates
- Count words
- FizzBuzz
- Merge dictionaries
- Count character frequency
- Find second largest number

### Intermediate

- Group anagrams
- Two sum
- Valid parentheses
- Flatten nested list
- Implement LRU cache
- Parse log lines
- Read CSV and aggregate values
- Retry decorator
- Implement a queue using two stacks
- Merge intervals
- Sliding window maximum sum
- Find first non-repeating character

### Advanced

- Build custom iterator
- Build context manager
- Build mini test runner
- Build task queue simulation
- Async URL fetch simulator
- Build simple dependency injection container
- Implement trie
- Implement BFS/DFS

## Claude Prompt

```txt
Create the Python Coding Challenges module.

File:
`src/modules/python-mastery/content/18-python-coding-challenges.tsx`

Create at least 30 coding challenges grouped by difficulty:
- Beginner: 10
- Intermediate: 12
- Advanced: 8

For each challenge include:
1. Title.
2. Problem statement.
3. Concepts practiced.
4. Input/output example.
5. Hints.
6. Expected time complexity.
7. Optional stretch goal.

Do not include full solutions by default.
Make the challenges suitable for interview preparation.
```

---

# Ticket 20: Create Final Python Interview Project Module

## Description

As a learner, I want to build a realistic Python project so that I can consolidate the learning path and have something practical to discuss in interviews.

## Acceptance Criteria

- Module defines a final project.
- Project uses Python fundamentals, FastAPI, typing, tests, and persistence.
- Project includes milestones.
- Project includes interview talking points.
- Project includes self-evaluation rubric.

## Suggested Final Project

Build a small **Interview Tracker API**.

Features:

- Create candidates
- Create interviews
- Add feedback
- Track interview status
- Query candidates by status
- Persist data with SQLite
- Validate schemas with Pydantic
- Test services and endpoints with pytest
- Use clean project structure

## Claude Prompt

```txt
Create the Final Python Interview Project module.

File:
`src/modules/python-mastery/content/19-final-python-interview-project.tsx`

Project:
Build an Interview Tracker API using Python and FastAPI.

The module should include:
1. Project overview.
2. Learning goals.
3. Required features.
4. Suggested folder structure.
5. API endpoints.
6. Data models.
7. Validation rules.
8. Testing requirements.
9. Stretch goals.
10. Interview talking points.
11. Rubric for self-evaluation.

The project should combine:
- Python syntax.
- OOP where useful.
- Type hints.
- FastAPI.
- Pydantic.
- SQLite.
- Repository/service pattern.
- pytest.
- Error handling.

Make it practical and realistic for a software engineer preparing for interviews.
```

---

# Ticket 21: Add Python Mastery Navigation and Progress Metadata

## Description

As a learner, I want the Python path to show progress and clear navigation so that I can study it in order.

## Acceptance Criteria

- All Python modules are ordered correctly.
- Previous/next navigation works.
- Progress tracking works with `python-mastery`.
- Estimated duration is visible.
- Difficulty per module is visible.
- Tags per module are visible where the app supports it.

## Claude Prompt

```txt
Update the Python Mastery academy routes and manifest.

Goal:
Ensure the full learning path is ordered and works properly with SE-HUB progress tracking.

Requirements:
1. Register all modules in the correct order.
2. Add estimated duration per module.
3. Add difficulty per module.
4. Add tags per module.
5. Ensure previous/next navigation works.
6. Ensure progress tracking works for `python-mastery`.
7. Ensure all route slugs are stable and clean.

Use this order:
1. Python Fundamentals
2. Data Types and Collections
3. Control Flow and Loops
4. Functions, Scope, and Arguments
5. Pythonic Code and Comprehensions
6. Object-Oriented Python
7. Error Handling and Debugging
8. Modules, Packages, and Environments
9. File I/O and Standard Library
10. Advanced Python Concepts
11. Modern Python Typing
12. Testing with Pytest
13. Async Python
14. Backend with FastAPI
15. Databases and ORM Basics
16. Algorithms and Data Structures in Python
17. Python Interview Question Bank
18. Python Coding Challenges
19. Final Python Interview Project
20. Python Glossary and Cheat Sheet
21. Python for JavaScript/TypeScript Developers
```

---

# Ticket 22: Add Python Glossary and Cheat Sheet

## Description

As a learner, I want a Python glossary and cheat sheet so that I can quickly review key concepts before interviews.

## Acceptance Criteria

- Cheat sheet includes syntax examples.
- Glossary includes core Python terms.
- Page is easy to skim.
- Includes Python vs JavaScript/TypeScript comparison notes.
- Includes at least 60 glossary terms.

## Claude Prompt

```txt
Create a Python Glossary and Cheat Sheet module.

File:
`src/modules/python-mastery/content/20-python-glossary-and-cheat-sheet.tsx`

Include:
1. Syntax cheat sheet.
2. Data structures cheat sheet.
3. Functions cheat sheet.
4. OOP cheat sheet.
5. Async cheat sheet.
6. Testing cheat sheet.
7. Python standard library cheat sheet.
8. Python vs JavaScript/TypeScript comparison table.
9. Glossary of at least 60 Python terms.

Make this page highly scannable and useful for reviewing 30 minutes before an interview.
```

---

# Ticket 23: Add Python for JavaScript/TypeScript Developers Module

## Description

As a JavaScript/TypeScript engineer, I want a dedicated comparison module so that I can map familiar JS/TS concepts to Python quickly.

## Acceptance Criteria

- Module compares Python concepts with JS/TS concepts.
- Module highlights common mental model mistakes JS/TS developers make when learning Python.
- Module includes side-by-side examples.
- Module is practical and interview-oriented.

## Suggested Comparison Table

```txt
JavaScript/TypeScript        Python
const/let                    variable assignment
undefined/null               None
object                       dict
array                        list
Map                          dict
Set                          set
class                        class
try/catch                    try/except
Promise                      coroutine/task
async/await                  async/await
npm                          pip/PyPI
package.json                 pyproject.toml
Jest/Vitest                  pytest
interface/type               Protocol/TypedDict/dataclass/Pydantic
```

## Claude Prompt

```txt
Create a Python for JavaScript/TypeScript Developers module.

File:
`src/modules/python-mastery/content/21-python-for-js-ts-developers.tsx`

Goal:
Help a senior frontend/fullstack engineer quickly understand Python by comparing it with JavaScript and TypeScript.

Include:
1. Syntax differences.
2. Data type mapping.
3. Collections mapping.
4. Function differences.
5. Class/OOP differences.
6. Error handling differences.
7. Async comparison.
8. Package/dependency management comparison.
9. Testing comparison.
10. Typing comparison.
11. Common mental model mistakes JS developers make when learning Python.

Include examples in both JS/TS and Python.
Make this very practical and interview-focused.
```

---

# Recommended Implementation Order

Do not ask Claude to create all modules in one prompt. That will likely generate shallow content and make the code harder to review.

Recommended order:

```txt
1. Ticket 1: Create academy structure
2. Ticket 21: Add routes/navigation metadata
3. Tickets 2-6: Python basics
4. Tickets 7-12: Intermediate Python
5. Tickets 13-16: Professional/backend Python
6. Tickets 17-20: Interview prep, challenges, final project
7. Ticket 22: Glossary and cheat sheet
8. Ticket 23: Python for JS/TS Developers
```

---

# Most Important Modules for Interview Prep

If time is short, prioritize these modules first:

```txt
01. Data Types and Collections
02. Functions, Scope, and Arguments
03. Object-Oriented Python
04. Advanced Python Concepts
05. Modern Python Typing
06. Testing with Pytest
07. Async Python
08. Algorithms and Data Structures in Python
09. Python Interview Question Bank
10. Python for JavaScript/TypeScript Developers
```

---

# Suggested Definition of Done for the Epic

The epic can be considered complete when:

- `python-mastery` appears in the SE-HUB dashboard.
- All modules are available through the learning path.
- Each module has clear learning goals.
- Each module has practical examples.
- Each module includes interview questions.
- Each module includes exercises or challenges.
- Progress tracking works.
- Previous/next navigation works.
- The final project module exists.
- The question bank includes at least 100 questions.
- The coding challenges module includes at least 30 challenges.
- The glossary/cheat sheet is available for fast review.
- The academy feels consistent with the rest of SE-HUB.

---

# Notes for Claude Usage

Use one ticket at a time.

After Claude generates each ticket, review for:

- Existing SE-HUB patterns
- Correct route registration
- Clean file naming
- No duplicated route slugs
- No unnecessary abstraction
- Good content depth
- No broken imports
- Good TypeScript typing
- Good UI consistency
- No giant client components unless needed

Suggested workflow:

```txt
1. Send the ticket prompt to Claude.
2. Review generated files.
3. Run lint/typecheck/build.
4. Test route manually.
5. Commit ticket.
6. Continue with the next ticket.
```

---

# Senior Engineering Review Notes

The biggest architectural risk is allowing this academy to become too custom compared with the rest of SE-HUB.

Avoid special-casing Python-specific behavior in the global content viewer unless absolutely necessary.

Prefer:

- academy-local content
- academy-local components
- generic shell routing
- stable route contracts
- reusable content primitives

Avoid:

- hardcoded Python routes in the shell
- huge monolithic content files
- duplicated manifest data
- inconsistent module metadata
- generating everything in one massive Claude response

---

# Final Recommendation

This epic should create a practical, interview-focused Python academy that helps a JavaScript/TypeScript engineer become productive in Python quickly.

The strongest value of this path is not only learning Python syntax, but building the right mental model around:

- Python data structures
- mutability
- functions and scope
- OOP conventions
- decorators and generators
- async Python
- typing
- testing
- backend API development
- Python coding interview patterns

This will make the academy useful both as a learning platform and as a technical interview preparation system.
