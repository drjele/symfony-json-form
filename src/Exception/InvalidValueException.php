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
                return $value;
            case \is_array($value):
                return \implode(', ', $value);
            case \is_object($value):
                return $value::class;
        }

        return \sprintf('unknown type `%s`', \gettype($value));
    }
}
