# Message Queues

## Glossary

| Term | Meaning |
|------|---------|
| **Message queue** | A component where producers send messages and consumers receive them asynchronously |
| **Producer** | Component that sends/publishes messages |
| **Consumer** | Component that receives/processes messages |
| **Topic** | A named channel (Kafka) where messages are published |
| **Queue** | A buffer of messages consumed by one consumer at a time (RabbitMQ / SQS) |
| **Partition** | A subdivision of a Kafka topic — enables parallelism |
| **Consumer group** | A set of consumers that together consume all partitions of a topic |
| **Offset** | The position of a message within a Kafka partition — consumers track this |
| **Broker** | A message queue server |
| **Exchange** | RabbitMQ component that routes messages to queues based on routing rules |
| **Pub-Sub** | Publish-Subscribe — one publisher, many independent subscribers |
| **Dead Letter Queue** | A queue where failed/unprocessable messages are sent for inspection |
| **Idempotency** | Processing the same message multiple times produces the same result |
| **At-least-once delivery** | Message is guaranteed to be delivered, possibly more than once |
| **Exactly-once delivery** | Message delivered exactly once — hardest to guarantee |

---

## Why message queues?

Without message queues — tight coupling and synchronous dependency:

```
[Order Service] → [Payment Service] → [Inventory Service] → [Email Service]
      ↑
If Email Service is slow or down → entire chain backs up or fails
```

With message queues — loose coupling and async processing:

```
[Order Service] → [Queue] → [Payment Service]
                         → [Inventory Service]
                         → [Email Service]

Order Service doesn't wait. Each service processes at its own pace.
Email Service being slow doesn't affect Order Service at all.
```

**Use message queues when:**
- Services have different processing speeds
- You want to decouple services (one service going down shouldn't fail others)
- You need to handle traffic spikes (queue absorbs bursts)
- Tasks can be processed asynchronously (email, notifications, reports)
- You need guaranteed delivery

---

## Core patterns

### Work Queue — distribute tasks across workers

```
[Producer] → [Queue] → [Worker 1]
                     → [Worker 2]
                     → [Worker 3]

Each message is delivered to ONE worker (competing consumers).
Workers share the load. Add more workers to scale processing.
```

Use case: email sending, image resizing, report generation, batch jobs.

### Publish-Subscribe (Fan-out) — one event, many consumers

```
[Publisher] → [Topic/Exchange] → [Email Service]
                              → [Analytics Service]
                              → [Audit Log Service]
                              → [Push Notification Service]

Each subscriber gets its OWN COPY of every message.
```

Use case: "Order placed" event → billing, inventory, notifications all react independently.

### Request-Reply (async RPC)

```
[Service A] → [Request Queue] → [Service B]
[Service A] ← [Reply Queue]   ← [Service B]

Service A sends a request and waits on a reply queue.
Used to make async call look synchronous.
```

---

## Kafka — high-throughput event streaming

Kafka is designed for high-throughput, durable, ordered event streaming.
Think of it as a distributed commit log.

### Core concepts

```
Topic: "orders"
├── Partition 0: [msg1, msg2, msg5, msg8...]
├── Partition 1: [msg3, msg6, msg9...]
└── Partition 2: [msg4, msg7, msg10...]
```

- **Topic** — a named stream of messages
- **Partition** — topics are split into partitions for parallelism
- **Offset** — each message has a position (offset) in its partition
- **Consumer group** — multiple consumers that together consume all partitions
- **Retention** — messages are kept for a configurable time (7 days default) — consumers can re-read

### How consumer groups work

```
Topic "orders" has 3 partitions
Consumer Group "payment-service" has 3 instances:

Instance 1 → Partition 0
Instance 2 → Partition 1
Instance 3 → Partition 2
```

- Each partition is consumed by exactly ONE instance in the group
- If one instance fails, its partitions are reassigned to others
- **Rule: you can't have more consumers than partitions in a group**

### Producer example (Java)

```java
Properties props = new Properties();
props.put("bootstrap.servers", "kafka:9092");
props.put("key.serializer",   "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// Send message to topic "orders"
ProducerRecord<String, String> record = new ProducerRecord<>("orders", orderId, orderJson);
producer.send(record, (metadata, ex) -> {
    if (ex != null) log.error("Failed to send", ex);
    else log.info("Sent to partition {}, offset {}", metadata.partition(), metadata.offset());
});

producer.flush();
producer.close();
```

### Consumer example (Java)

```java
Properties props = new Properties();
props.put("bootstrap.servers", "kafka:9092");
props.put("group.id", "payment-service");
props.put("auto.offset.reset", "earliest"); // start from beginning if no offset stored
props.put("key.deserializer",   "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(List.of("orders"));

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        processOrder(record.key(), record.value());
        // Offset is committed after processing (at-least-once delivery)
    }
}
```

### Spring Kafka (simpler)

```java
@KafkaListener(topics = "orders", groupId = "payment-service")
public void handleOrder(String orderJson) {
    Order order = objectMapper.readValue(orderJson, Order.class);
    paymentService.process(order);
}

@Autowired
private KafkaTemplate<String, String> kafkaTemplate;

public void publishOrder(Order order) {
    kafkaTemplate.send("orders", order.getId(), objectMapper.writeValueAsString(order));
}
```

---

## RabbitMQ — flexible message routing

RabbitMQ is a traditional message broker with rich routing capabilities.
Producers publish to **exchanges**; exchanges route to **queues** based on rules.

### Exchange types

| Type | Routing rule | Use case |
|------|-------------|----------|
| **Direct** | Exact routing key match | Specific service targeting |
| **Fanout** | Broadcast to ALL bound queues | Pub-sub, notifications |
| **Topic** | Wildcard routing key match (`*.error`, `order.#`) | Flexible filtering |
| **Headers** | Route by message headers instead of key | Complex routing |

```java
// Spring AMQP example
@RabbitListener(queues = "orders.payment")
public void processPayment(OrderMessage message) {
    paymentService.process(message);
}

@Autowired
private RabbitTemplate rabbitTemplate;

public void publishOrder(Order order) {
    rabbitTemplate.convertAndSend("orders.exchange", "orders.placed", order);
}
```

---

## Kafka vs RabbitMQ

| | Kafka | RabbitMQ |
|--|-------|----------|
| **Model** | Log-based (pull) — consumers read at their pace | Queue-based (push) — broker pushes to consumer |
| **Throughput** | Very high (millions/sec) | High (tens of thousands/sec) |
| **Retention** | Messages stored for days/weeks | Messages deleted after acknowledgment |
| **Replay** | Yes — consumers can re-read old messages | No — once consumed and acked, gone |
| **Ordering** | Per-partition ordering guaranteed | Per-queue ordering |
| **Routing** | Simple — topics and partitions | Rich — exchanges, bindings, routing keys |
| **Use case** | Event streaming, audit logs, analytics | Task queues, RPC, complex routing |
| **Consumer model** | Consumer groups pull from partitions | Competing consumers |

**Choose Kafka for:** High-throughput event streams, audit logs, event sourcing, analytics pipelines.
**Choose RabbitMQ for:** Task queues, complex routing, low-latency messaging, RPC patterns.

---

## Important concepts

### Idempotency — handle duplicate messages

At-least-once delivery means the same message may be delivered more than once
(network retry, consumer crash before acknowledgment).

**Your consumer must be idempotent**: processing the same message twice = same result.

```java
@KafkaListener(topics = "payments")
public void processPayment(PaymentEvent event) {
    // Check if already processed — idempotency key
    if (paymentRepository.existsByIdempotencyKey(event.getIdempotencyKey())) {
        log.info("Duplicate payment event, skipping: {}", event.getId());
        return;
    }

    paymentService.charge(event);
    paymentRepository.saveIdempotencyKey(event.getIdempotencyKey());
}
```

### Dead Letter Queue (DLQ)

Messages that fail processing (after retries) are sent to a DLQ for inspection.

```
Normal flow:
[Queue] → [Consumer] → processes successfully → message deleted

Failure flow:
[Queue] → [Consumer] → fails 3 times → [Dead Letter Queue]
                                               ↓
                                     Engineer inspects & fixes
```

---

## Interview answers

### Why use a message queue instead of direct API calls?
Message queues decouple services: the producer doesn't wait for the consumer, doesn't know if it's slow or down, and can't be affected by it. Queues absorb traffic spikes, enable retry on failure, and allow independent scaling of producers and consumers.

### What is the difference between a queue and pub-sub?
A queue delivers each message to ONE consumer (work distribution). Pub-sub delivers each message to ALL subscribers independently. Use queues for task distribution; use pub-sub for event fan-out where multiple services need to react to the same event.

### What is Kafka's main advantage over traditional queues?
Message retention and replayability. Kafka stores messages for days/weeks, and consumers can re-read any point in history. This enables audit logs, event sourcing, and debugging. Traditional queues like RabbitMQ delete messages once consumed.

### What is a consumer group in Kafka?
A set of consumer instances that together consume all partitions of a topic. Each partition is assigned to exactly one instance in the group. This enables horizontal scaling of consumers — add more instances to process faster.

### What is idempotency and why does it matter with message queues?
At-least-once delivery can result in duplicate messages (on retry or failure). Idempotent consumers produce the same outcome whether a message is processed once or multiple times — typically by checking if the operation was already performed using an idempotency key.

### What is a Dead Letter Queue?
A separate queue where messages go after repeated processing failures. This prevents bad messages from blocking the main queue. Engineers can inspect DLQ messages, fix bugs, and reprocess them.
