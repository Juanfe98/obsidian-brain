# Spring Boot Basics

## Glossary

| Term | Meaning |
|------|---------|
| **Spring Framework** | A large Java framework that provides tools for building enterprise applications |
| **Spring Boot** | An opinionated layer on top of Spring that removes most configuration boilerplate — just run and go |
| **Bean** | Any object managed by Spring. Spring creates it, wires it, and destroys it |
| **IoC (Inversion of Control)** | Instead of your code creating dependencies, Spring creates and manages them for you |
| **Dependency Injection (DI)** | Spring provides ("injects") the dependencies a class needs automatically |
| **IoC Container** | The Spring engine that manages beans — creates, wires, and destroys them |
| **Annotation** | A label starting with `@` that gives Spring instructions. E.g. `@Service`, `@RestController` |
| **Auto-configuration** | Spring Boot automatically sets up components based on what's on the classpath |
| **REST API** | An HTTP interface for your application. Clients call URLs, your app responds with data |
| **Endpoint** | A URL your REST API exposes. E.g. `GET /users`, `POST /orders` |
| **Request** | Data coming IN to your API from a client |
| **Response** | Data going OUT from your API back to the client |
| **JSON** | The most common data format for REST APIs — key/value text format |
| **JPA** | Java Persistence API — a standard for mapping Java objects to database tables |
| **Repository** | A class that talks to the database |
| **application.properties** | The config file where you set database URLs, ports, credentials, etc. |

---

## Spring vs Spring Boot — what's the difference?

**Spring Framework** is powerful but requires a lot of XML/Java configuration to get started.

**Spring Boot** adds:
- **Auto-configuration** — detects what you're using and configures it automatically
- **Embedded server** — no need to install Tomcat separately, it's built in
- **Starter dependencies** — one dependency pulls in everything you need
- **Opinionated defaults** — sensible defaults so you write less config

> Think of Spring as the engine and Spring Boot as the car — already assembled, ready to drive.

---

## The application layers

A typical Spring Boot app is structured in 3 layers:

```
┌─────────────────────────────────┐
│     Controller Layer            │  ← Receives HTTP requests, returns responses
│     @RestController             │
└────────────────┬────────────────┘
                 │ calls
┌────────────────▼────────────────┐
│     Service Layer               │  ← Business logic lives here
│     @Service                    │
└────────────────┬────────────────┘
                 │ calls
┌────────────────▼────────────────┐
│     Repository Layer            │  ← Talks to the database
│     @Repository                 │
└─────────────────────────────────┘
```

Each layer has one responsibility — this is SRP in practice.

---

## Core annotations

### @SpringBootApplication
The entry point of every Spring Boot app. Combines 3 annotations:
- `@Configuration` — this class defines beans
- `@EnableAutoConfiguration` — let Spring Boot auto-configure
- `@ComponentScan` — scan this package for Spring components

```java
@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}
```

---

### @RestController — the Controller layer
Handles incoming HTTP requests and returns responses (usually JSON).
Combines `@Controller` + `@ResponseBody`.

```java
@RestController
@RequestMapping("/users")  // base path for all endpoints in this class
public class UserController {

    private final UserService userService;

    // Constructor injection (preferred over @Autowired on field)
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping              // GET /users
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/{id}")     // GET /users/123
    public User getUserById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping             // POST /users
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }

    @PutMapping("/{id}")     // PUT /users/123
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.update(id, user);
    }

    @DeleteMapping("/{id}")  // DELETE /users/123
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

### HTTP method annotations
| Annotation | HTTP Method | Use for |
|-----------|------------|---------|
| `@GetMapping` | GET | Retrieve data |
| `@PostMapping` | POST | Create new resource |
| `@PutMapping` | PUT | Replace entire resource |
| `@PatchMapping` | PATCH | Partial update |
| `@DeleteMapping` | DELETE | Remove resource |

### Common parameter annotations
| Annotation | Meaning | Example |
|-----------|---------|---------|
| `@PathVariable` | Value from the URL path | `/users/{id}` |
| `@RequestParam` | Value from query string | `/users?page=1` |
| `@RequestBody` | Value from request body (JSON) | POST body |

---

### @Service — the Service layer
Contains business logic. Spring creates one instance (Singleton) and injects it where needed.

```java
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public User save(User user) {
        // business logic — validate, transform, etc.
        if (user.getEmail() == null) throw new IllegalArgumentException("Email required");
        return userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
```

---

### @Repository — the Repository layer
Talks to the database. Spring Data JPA generates all the SQL for you — no queries needed for basic operations.

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository gives you for free:
    // findAll(), findById(), save(), delete(), count(), existsById()...

    // Custom queries — just name the method correctly, Spring writes the SQL
    List<User> findByEmail(String email);
    List<User> findByActiveTrue();
    List<User> findByNameContaining(String keyword);
    Optional<User> findByEmailAndActive(String email, boolean active);
}
```

Spring Data JPA reads the method name and generates the SQL automatically.

---

### @Entity — the data model
Maps a Java class to a database table.

```java
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto-increment
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private boolean active = true;

    // Getters and setters (or use @Data from Lombok)
}
```

---

### @Component, @Service, @Repository, @Controller — what's the difference?

All four register a class as a Spring bean. The difference is **semantic** (meaning):

| Annotation | Layer | Extra behavior |
|-----------|-------|---------------|
| `@Component` | Any | Generic bean — no special meaning |
| `@Service` | Business logic | Marks intent — no extra behavior |
| `@Repository` | Database | Translates DB exceptions to Spring exceptions |
| `@Controller` | HTTP | Handles HTTP requests |
| `@RestController` | HTTP | `@Controller` + auto JSON response |

---

## Dependency Injection — 3 ways

### 1. Constructor injection (PREFERRED)
```java
@Service
public class OrderService {
    private final PaymentService paymentService; // final — can't be changed

    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```
Best practice — makes dependencies explicit, works well with tests, allows `final` fields.

### 2. Field injection (common but not recommended)
```java
@Service
public class OrderService {
    @Autowired
    private PaymentService paymentService; // Spring injects directly into the field
}
```
Shorter but harder to test — you can't inject a mock without Spring context.

### 3. Setter injection (rarely used)
```java
@Service
public class OrderService {
    private PaymentService paymentService;

    @Autowired
    public void setPaymentService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

> **Rule:** Always prefer constructor injection. It's the Spring team's recommendation.

---

## application.properties — configuration file

Located at `src/main/resources/application.properties`.
This is where you configure database, server port, logging, etc.

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=secret
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update       # auto-create/update tables
spring.jpa.show-sql=true                   # print SQL to console
spring.jpa.properties.hibernate.format_sql=true

# Logging
logging.level.org.springframework=INFO
logging.level.com.myapp=DEBUG
```

Can also be written as `application.yml` (YAML format — more readable):

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

---

## Bean lifecycle

Every Spring bean goes through these phases:

```
1. Instantiation    — Spring creates the object
2. Injection        — dependencies are injected
3. @PostConstruct   — your custom init code runs
4. Ready            — bean is in use by the application
5. @PreDestroy      — your cleanup code runs before destruction
6. Destruction      — Spring removes the bean
```

```java
@Service
public class CacheService {

    @PostConstruct
    public void init() {
        System.out.println("Cache warming up..."); // runs after injection
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("Clearing cache..."); // runs before shutdown
    }
}
```

---

## A complete mini REST API

```java
// Model
@Entity
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double price;
    // getters/setters
}

// Repository
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContaining(String keyword);
}

// Service
@Service
public class ProductService {
    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List<Product> findAll() { return repository.findAll(); }

    public Product findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product save(Product product) {
        if (product.getPrice() < 0) throw new IllegalArgumentException("Price cannot be negative");
        return repository.save(product);
    }
}

// Controller
@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Product create(@RequestBody Product product) { return service.save(product); }
}
```

This is the pattern you'll write every day as a Java backend developer.

---

## Interview answers

### What is Spring Boot?
An opinionated framework built on top of Spring that removes boilerplate configuration, includes an embedded server, and provides auto-configuration so you can start building immediately.

### What is Inversion of Control (IoC)?
Instead of your code creating its dependencies, Spring creates and manages them. You declare what you need, Spring provides it.

### What is Dependency Injection?
The mechanism Spring uses to implement IoC — it injects the required dependencies into a class, typically through the constructor.

### What is the difference between @Component, @Service, and @Repository?
All register a Spring bean. The difference is semantic — @Service marks business logic, @Repository marks data access (and adds DB exception translation), @Component is a generic marker.

### Why is constructor injection preferred over field injection?
Constructor injection makes dependencies explicit, allows fields to be final (immutable), and makes the class easier to test — you can inject mocks without needing Spring.

### What does @SpringBootApplication do?
It combines @Configuration, @EnableAutoConfiguration, and @ComponentScan — it's the entry point that bootstraps the entire application.

### What is Spring Data JPA?
A Spring module that eliminates boilerplate database code. You define a repository interface, and Spring generates the implementation — including SQL for methods named following conventions like findByEmail().

### What is the difference between @Controller and @RestController?
@Controller returns views (HTML). @RestController returns data (JSON/XML) directly — it combines @Controller and @ResponseBody.
