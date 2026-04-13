# Security

## Glossary

| Term | Meaning |
|------|---------|
| **Authentication** | Verifying WHO you are — "prove your identity" (login) |
| **Authorization** | Verifying WHAT you can do — "do you have permission?" (access control) |
| **JWT** | JSON Web Token — a compact, self-contained token encoding claims, signed to prevent tampering |
| **OAuth 2.0** | An authorization framework that allows an app to access resources on behalf of a user |
| **OpenID Connect** | OAuth 2.0 extension that adds authentication (who the user is, not just what they can access) |
| **BCrypt** | A password hashing algorithm with built-in salt and configurable work factor |
| **XSS** | Cross-Site Scripting — injecting malicious scripts into web pages viewed by others |
| **CSRF** | Cross-Site Request Forgery — tricking a user's browser into making unauthorized requests |
| **SQL Injection** | Inserting malicious SQL into user input to manipulate database queries |
| **HTTPS/TLS** | Encrypted transport layer — data in transit is encrypted between client and server |
| **Filter chain** | In Spring Security, a sequence of filters that process every HTTP request |
| **Principal** | The currently authenticated user/entity |

---

## Authentication vs Authorization

```
Authentication → Who are you?
   - Login with username/password
   - Verifying a JWT token
   - API key validation

Authorization → What can you do?
   - Can this user access /admin?
   - Can this user delete this record?
   - Role checks (ADMIN, USER, VIEWER)
```

**Common mistake:** Confusing the two. A request can be authenticated (we know who you are)
but still unauthorized (you don't have permission).

---

## JWT — JSON Web Token

A JWT is a signed, compact token that carries claims about the user.
No session stored on the server — the token is self-contained.

### Structure: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← Header (Base64)
.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJBRE1JTiIsImV4cCI6MTcwMDAwMH0  ← Payload (Base64)
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature (HMAC or RSA)
```

### Decoded payload example

```json
{
  "sub": "user-123",
  "email": "juan@email.com",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700003600
}
```

### How JWT authentication works

```
1. User logs in with username/password
2. Server validates credentials
3. Server creates JWT, signs with secret key, returns to client
4. Client stores JWT (memory, localStorage, httpOnly cookie)
5. Client sends JWT in every request: Authorization: Bearer <token>
6. Server validates signature + checks expiry — no DB lookup needed
7. Server extracts user info from payload
```

### JWT validation in Spring Boot

```java
@Component
public class JwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7); // remove "Bearer "

        try {
            Claims claims = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();

            String username = claims.getSubject();
            // Set authentication in SecurityContext
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(username, null, getAuthorities(claims));
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (JwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        chain.doFilter(request, response);
    }
}
```

### JWT pros and cons

| Pro | Con |
|-----|-----|
| Stateless — no session storage | Can't invalidate a token before expiry |
| Scalable — any server validates | Token grows with claims |
| Self-contained — carries user info | Must keep secret key secure |
| Works across microservices | If stolen, valid until expiry |

**Short expiry + refresh tokens** is the standard solution for invalidation.

---

## OAuth 2.0 — Authorization framework

OAuth 2.0 allows your app to access resources on behalf of a user,
**without the user giving you their password**.

### The 4 roles

```
Resource Owner    → The user who owns the data
Client            → Your application requesting access
Authorization Server → Issues tokens (Google, GitHub, Okta)
Resource Server   → The API that holds the user's data
```

### Authorization Code Flow (most secure, for web apps)

```
1. User clicks "Login with Google"
2. Your app redirects user to Google's authorization server
   GET https://accounts.google.com/o/oauth2/auth
       ?client_id=YOUR_APP
       &redirect_uri=https://yourapp.com/callback
       &response_type=code
       &scope=email profile

3. User logs in on Google and grants consent
4. Google redirects back with an authorization code:
   GET https://yourapp.com/callback?code=AUTH_CODE_HERE

5. Your backend exchanges code for tokens (server-to-server, secure):
   POST https://oauth2.googleapis.com/token
       code=AUTH_CODE_HERE
       client_secret=YOUR_SECRET

6. Google returns access_token (+ id_token if OpenID Connect)
7. Your app uses access_token to call Google APIs on behalf of user
```

### OAuth 2.0 vs OpenID Connect

| | OAuth 2.0 | OpenID Connect |
|--|-----------|----------------|
| Purpose | Authorization — access resources | Authentication — know who the user is |
| Token | Access token | Access token + ID token (JWT with user info) |
| Use case | "Can this app post on my behalf?" | "Who is logged in?" |

---

## Spring Security — Basics

### Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### Security configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())                  // disable for REST APIs (stateless)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // no sessions
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // public endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN") // role-protected
                .anyRequest().authenticated()                // everything else: must be logged in
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // always hash passwords
    }
}
```

### Role-based access in controllers

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")        // method-level authorization
    public List<User> getAllUsers() { ... }

    @GetMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    public User getUser(@PathVariable Long id) { ... }
}
```

---

## Password security — BCrypt

**Never store plain text passwords.** Always hash with BCrypt.

```java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

// Registration
String rawPassword = "myPassword123";
String hashed = encoder.encode(rawPassword);
// "$2a$10$N9qo8uLOickgx2ZMRZo..." — stored in DB

// Login — compare raw with hash
boolean matches = encoder.matches("myPassword123", hashed); // true
boolean bad     = encoder.matches("wrongPassword", hashed); // false
```

BCrypt properties:
- **Salted** — two identical passwords produce different hashes (prevents rainbow tables)
- **Slow by design** — work factor (rounds) makes brute-force impractical
- **One-way** — cannot reverse the hash to get the original password

---

## Common Vulnerabilities (OWASP Top 10)

### 1. SQL Injection

**Attacker inserts SQL into user input to manipulate queries.**

```java
// VULNERABLE
String query = "SELECT * FROM users WHERE email = '" + userInput + "'";
// userInput = "' OR '1'='1" → returns ALL users

// SAFE — use parameterized queries / prepared statements
String query = "SELECT * FROM users WHERE email = ?";
PreparedStatement stmt = conn.prepareStatement(query);
stmt.setString(1, userInput); // value is escaped, not interpolated

// In JPA — use @Query with named parameters
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
// JPA parameterizes automatically — safe by default
```

### 2. XSS — Cross-Site Scripting

**Attacker injects JavaScript into content shown to other users.**

```
Example: comment field stores <script>fetch('/steal?cookie='+document.cookie)</script>
Other users see the comment → their browser executes the script → attacker steals cookies
```

Prevention:
- **Escape output** — encode `<`, `>`, `"`, `'` in HTML output (React does this by default)
- **Content Security Policy (CSP)** header — restrict which scripts can run
- **HttpOnly cookies** — JavaScript cannot read them even if XSS succeeds

### 3. CSRF — Cross-Site Request Forgery

**Tricks user's browser into making a request to your app without the user's knowledge.**

```
User is logged in to bank.com
User visits evil.com which has:
<img src="https://bank.com/transfer?to=attacker&amount=1000">
Browser automatically sends the request with bank.com's session cookie
```

Prevention:
- **CSRF tokens** — unique token per form/session, verified server-side
- **SameSite cookies** — cookies not sent with cross-origin requests
- Spring Security enables CSRF protection by default (disable only for stateless REST APIs using JWT)

### 4. Broken Authentication

- Short/no token expiry
- Weak passwords allowed
- No rate limiting on login attempts
- Tokens stored in localStorage (XSS risk) — use httpOnly cookies instead

### 5. Sensitive Data Exposure

- Passwords in plain text
- API keys in code/logs
- Credit card numbers not masked
- PII in logs

---

## HTTPS / TLS

All production traffic must use HTTPS. TLS encrypts data in transit.

```
Without HTTPS:
Client → [password=abc123 sent as plain text] → Server
Attacker on network can read everything

With HTTPS:
Client → [encrypted gibberish] → Server
Attacker sees nothing useful
```

In Spring Boot — configure in `application.yml`:
```yaml
server:
  ssl:
    key-store: classpath:keystore.p12
    key-store-password: secret
    key-store-type: PKCS12
  port: 8443
```

---

## Security checklist for interviews

| Area | What to say |
|------|-------------|
| Passwords | BCrypt hashing, never plain text, salted |
| Tokens | JWT with short expiry + refresh tokens, httpOnly cookies |
| Input | Parameterized queries (SQL injection), output escaping (XSS) |
| Transport | HTTPS everywhere, HSTS header |
| Authorization | Role-based access, principle of least privilege |
| Rate limiting | Limit login attempts, throttle APIs |
| Secrets | Never in code/logs, use env vars or secrets managers |

---

## Interview answers

### What is the difference between authentication and authorization?
Authentication verifies identity — "who are you?" (login). Authorization verifies permissions — "what can you do?" (access control). You authenticate first, then authorize.

### How does JWT work?
The server creates a signed token containing user claims (id, roles, expiry). The client stores and sends this token with each request. The server validates the signature and reads the claims — no database lookup needed. The signature ensures the token wasn't tampered with.

### Why can't you invalidate a JWT before it expires?
Because JWTs are stateless — the server doesn't store them anywhere. To invalidate, you'd need a token blocklist (storing tokens to reject) which adds state. The standard approach is short expiry (15 minutes) plus a refresh token system.

### What is OAuth 2.0?
An authorization framework that lets users grant third-party apps access to their resources without sharing passwords. Your app gets an access token to act on the user's behalf.

### How do you prevent SQL injection?
Use parameterized queries or prepared statements — never concatenate user input into SQL strings. With JPA, use named parameters in `@Query` annotations. JPA's built-in methods are safe by default.

### What is XSS and how do you prevent it?
Cross-Site Scripting — an attacker injects JavaScript into content shown to users. Prevent by escaping all user-generated content before rendering in HTML, setting a Content Security Policy header, and using httpOnly cookies.

### How does BCrypt work and why is it preferred?
BCrypt adds a random salt to each password and hashes it multiple times (configurable rounds). Two identical passwords produce different hashes, preventing rainbow table attacks. The deliberate slowness makes brute-force computationally infeasible.
