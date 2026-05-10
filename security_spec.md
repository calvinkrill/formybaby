# Security Specification - a letter for my baby

## Data Invariants
1. A visit log must have a timestamp and valid ID logic.
2. Visit logs are publicly creatable (anonymous visits) but cannot be edited or deleted by anyone.
3. Visit logs can be read (list/get) by anyone to see the total count.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a visit with a manual ID. (Valid, since we use `addDoc` or random IDs normally, but we validate ID format).
2. **State Shortcutting**: Not applicable as there is no state flow for visits.
3. **Resource Poisoning**: Attempt to inject 1MB string into `userAgent`.
4. **Malicious Update**: Attempt to update a visit timestamp.
5. **Unauthorized Deletion**: Attempt to delete a visit log.
6. **Shadow Field**: Attempt to add `admin: true` to a visit log.
7. **Invalid Type**: Attempt to set `timestamp` as a number.
8. **Future Timestamp**: Attempt to set `timestamp` to a future date.
9. **Bulk Read**: Attempt to read the entire collection without limits (handled by client, but rules should restrict list).
10. **ID format attack**: Using `../` in document ID.
11. **PII Leak**: Not applicable currently as we don't store PII in visits.
12. **Mass Write**: Attempting to write 1000 docs per second (handled by Firestore quotas, but rules can't block this easily without auth).

## The Test Runner (Snippet)
We will verify these in `firestore.rules`.
