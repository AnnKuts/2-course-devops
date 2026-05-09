# Web Service Deployment with Automation

### Variant
- group list number: 10
```js
const N = 10;
const V2 = (N % 2) + 1;
const V3 = (N % 3) + 1;
const V5 = (N % 5) + 1;

console.log(`V2=${V2}, V3=${V3}, V5=${V5}`);
```

```terminaloutput
V2=1, V3=2, V5=1

=== Code Execution Successful ===
```
- V2=1: configuration method - command-line arguments; database — MariaDB
- V3=2: web application theme - Task Tracker
- V5=1: port - 8080