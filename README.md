# Symfony Json Form

**You may fork and modify it as you wish**.

Any suggestions are welcomed.

## Usage

Add this to your **services.yaml**.

```yaml
services:
    _instanceof:
        Drjele\Symfony\JsonForm\Form\AbstractForm:
            calls:
                - [ setSerializer, [ '@serializer' ] ]
```

## Todo

* Unit tests.
