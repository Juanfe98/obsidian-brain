# Testing in Java — JUnit 5 & Mockito

## Glossary

| Term | Meaning |
|------|---------|
| **Unit test** | Tests a single class/method in isolation — no real DB, no real HTTP calls |
| **Integration test** | Tests multiple layers together — may use a real DB or Spring context |
| **Mock** | A fake object that simulates a dependency — you control what it returns |
| **Stub** | Telling a mock what to return when a specific method is called |
| **Verify** | Asserting that a method on a mock was called (or not called) |
| **AAA pattern** | Arrange, Act, Assert — the 3 phases every test should follow |
| **Test coverage** | The percentage of your code executed by tests |
| **@Mock** | Creates a mock — a fake object, methods return defaults (null, 0, false) |
| **@Spy** | Wraps a real object — real methods run unless you override specific ones |
| **@InjectMocks** | Creates the class under test and injects all @Mocks into it |
| **@Captor** | Captures arguments passed to a mock method so you can assert on them |

---

## Unit test vs Integration test

| | Unit Test | Integration Test |
|---|----------|-----------------|
| What it tests | One class in isolation | Multiple layers together |
| Dependencies | Mocked | Real or in-memory |
| Speed | Very fast | Slower |
| Scope | Small | Large |
| Annotations | `@ExtendWith(MockitoExtension.class)` | `@SpringBootTest` |

---

## JUnit 5 — the testing framework

JUnit provides the structure: annotations to mark tests, assertions to verify results.

### Core annotations

```java
@Test           // marks a method as a test
@BeforeEach     // runs before EACH test method
@AfterEach      // runs after EACH test method
@BeforeAll      // runs once before ALL tests in the class (must be static)
@AfterAll       // runs once after ALL tests in the class (must be static)
@Disabled       // skips this test
@DisplayName    // gives the test a human-readable name
```

### Basic test structure — AAA Pattern

Every test has 3 phases:
1. **Arrange** — set up the data and conditions
2. **Act** — call the method you're testing
3. **Assert** — verify the result is what you expected

```java
@Test
@DisplayName("Should return correct sum of two numbers")
void shouldReturnCorrectSum() {
    // Arrange
    Calculator calculator = new Calculator();
    int a = 5, b = 3;

    // Act
    int result = calculator.add(a, b);

    // Assert
    assertEquals(8, result);
}
```

### Common assertions

```java
assertEquals(expected, actual);              // values are equal
assertNotEquals(unexpected, actual);         // values are NOT equal
assertTrue(condition);                       // condition is true
assertFalse(condition);                      // condition is false
assertNull(value);                           // value is null
assertNotNull(value);                        // value is not null
assertThrows(Exception.class, () -> { ... }); // code throws an exception
assertAll(                                   // run multiple assertions
    () -> assertEquals(1, result.getId()),
    () -> assertEquals("Juan", result.getName())
);
```

---

## Mockito — mocking dependencies

When testing a class that depends on others (database, email service, etc.)
you don't want to use real implementations — they're slow, have side effects, and are hard to control.

Mockito creates **fake objects** that you control completely.

### Setup

```java
@ExtendWith(MockitoExtension.class) // enables Mockito annotations
class UserServiceTest {

    @Mock
    UserRepository userRepository; // fake repository — no real DB

    @InjectMocks
    UserService userService; // real class we're testing — mocks injected automatically
}
```

### Stubbing — tell the mock what to return

```java
@Test
void shouldReturnUserWhenFound() {
    // Arrange — stub the mock
    User fakeUser = new User(1L, "Juan", "juan@email.com");
    when(userRepository.findById(1L)).thenReturn(Optional.of(fakeUser));

    // Act
    User result = userService.findById(1L);

    // Assert
    assertEquals("Juan", result.getName());
    assertEquals("juan@email.com", result.getEmail());
}
```

### Stubbing exceptions

```java
@Test
void shouldThrowExceptionWhenUserNotFound() {
    // Arrange — mock returns empty
    when(userRepository.findById(99L)).thenReturn(Optional.empty());

    // Act & Assert — verify the exception is thrown
    assertThrows(RuntimeException.class, () -> userService.findById(99L));
}
```

### Verify — assert a method was called

```java
@Test
void shouldSaveUserWhenValid() {
    // Arrange
    User user = new User(null, "Juan", "juan@email.com");
    when(userRepository.save(user)).thenReturn(user);

    // Act
    userService.save(user);

    // Assert — verify repository.save() was called exactly once
    verify(userRepository, times(1)).save(user);
}

@Test
void shouldNotSaveWhenEmailIsInvalid() {
    User user = new User(null, "Juan", null); // no email

    assertThrows(IllegalArgumentException.class, () -> userService.save(user));

    // Verify save was NEVER called
    verify(userRepository, never()).save(any());
}
```

### @Mock vs @Spy

```java
// @Mock — completely fake object
// All methods return defaults: null, 0, false, empty list
@Mock
UserRepository userRepository;

// @Spy — wraps a REAL object
// Real methods run unless you specifically stub them
@Spy
UserValidator validator = new UserValidator();

// With spy — only stub what you need, real logic runs for the rest
doReturn(true).when(validator).isValidEmail("juan@email.com");
```

---

## Full test example — UserService

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("Should create user and send welcome email")
    void shouldCreateUserAndSendEmail() {
        // Arrange
        User user = new User(null, "Juan", "juan@email.com");
        User savedUser = new User(1L, "Juan", "juan@email.com");
        when(userRepository.save(user)).thenReturn(savedUser);

        // Act
        User result = userService.createUser(user);

        // Assert
        assertNotNull(result.getId());
        assertEquals("Juan", result.getName());
        verify(userRepository, times(1)).save(user);
        verify(emailService, times(1)).sendWelcome(savedUser);
    }

    @Test
    @DisplayName("Should throw exception when email is missing")
    void shouldThrowWhenEmailMissing() {
        User user = new User(null, "Juan", null);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(user));

        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendWelcome(any());
    }

    @BeforeEach
    void setUp() {
        // Runs before each test — reset state, common setup
    }
}
```

---

## Spring Boot integration tests

### @SpringBootTest — full application context
```java
@SpringBootTest
class OrderServiceIntegrationTest {

    @Autowired
    OrderService orderService; // real Spring bean

    @Autowired
    OrderRepository orderRepository; // real repository

    @Test
    void shouldPersistOrder() {
        Order order = new Order("PRODUCT-1", 99.99);
        Order saved = orderService.placeOrder(order);

        assertNotNull(saved.getId());
        assertTrue(orderRepository.existsById(saved.getId()));
    }
}
```

### @WebMvcTest — test only the controller layer
```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    MockMvc mockMvc; // simulates HTTP requests

    @MockBean
    UserService userService; // mocked — no real service needed

    @Test
    void shouldReturn200WhenUserFound() throws Exception {
        User user = new User(1L, "Juan", "juan@email.com");
        when(userService.findById(1L)).thenReturn(user);

        mockMvc.perform(get("/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Juan"));
    }

    @Test
    void shouldReturn404WhenUserNotFound() throws Exception {
        when(userService.findById(99L)).thenThrow(new RuntimeException("Not found"));

        mockMvc.perform(get("/users/99"))
            .andExpect(status().isNotFound());
    }
}
```

### @DataJpaTest — test repository with in-memory DB
```java
@DataJpaTest // uses H2 in-memory DB automatically
class UserRepositoryTest {

    @Autowired
    UserRepository userRepository;

    @Test
    void shouldFindUserByEmail() {
        User user = new User(null, "Juan", "juan@email.com");
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("juan@email.com");

        assertTrue(found.isPresent());
        assertEquals("Juan", found.get().getName());
    }
}
```

---

## Test coverage

Coverage = percentage of code lines executed by tests.

- **100% is not the goal** — testing trivial getters/setters adds noise
- **Aim for 70-80%** on business logic — focus on service layer
- Cover **edge cases**: null inputs, empty collections, boundary values, exceptions

---

## Interview answers

### What is the difference between a unit test and an integration test?
A unit test tests one class in isolation with all dependencies mocked — fast and focused. An integration test tests multiple layers together with real or near-real dependencies — slower but more realistic.

### What is Mockito?
A Java mocking framework that creates fake objects (mocks) to replace real dependencies in unit tests. You control what mocks return and can verify they were called correctly.

### What is the difference between @Mock and @Spy?
@Mock creates a completely fake object — all methods return defaults. @Spy wraps a real object — real methods run unless you stub specific ones.

### What is the AAA pattern?
Arrange (set up data), Act (call the method), Assert (verify the result). Every test should follow this structure for clarity.

### How do you test a Spring Boot controller?
Use @WebMvcTest with MockMvc to simulate HTTP requests without starting a full server. Mock the service layer with @MockBean.

### What is @InjectMocks?
A Mockito annotation that creates an instance of the class under test and automatically injects all @Mock and @Spy fields into it.
