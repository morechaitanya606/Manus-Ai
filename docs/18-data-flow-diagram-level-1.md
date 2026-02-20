# 18. Data Flow Diagram (Level 1)

## 18.1 Text Representation

```text
Customer -> Frontend -> Backend -> Database
Admin    -> Frontend -> Backend -> Database
```

## 18.2 Interpretation

- Customer requests flow through the frontend to backend APIs and persist/read from the database.
- Admin operational requests follow the same application path with RBAC-based privileges.
