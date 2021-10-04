<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Exception;

class InvalidValueException extends Exception
{
    public function __construct(string $name, $value)
    {
        parent::__construct(
            \sprintf('invalid value `%s` for `%s`', $this->serialize($value), $name)
        );
    }

    private function serialize($value): string
    {
        /* @todo improve */

        switch (true) {
            case \is_scalar($value):
                if (\is_array($value)) {
                    return \implode(', ', $value);
                }

                return $value;
            case \is_object($value):
                return \get_class($value);
        }

        return \sprintf('unknown type `%s`', \gettype($value));
    }
}
