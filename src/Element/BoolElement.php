<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

final class BoolElement extends AbstractElement
{
    public function __construct(string $name)
    {
        $this->name = $name;
    }

    protected function getType(): string
    {
        return 'bool';
    }

    protected function renderValue($value): array
    {
        if (null !== $value && !\is_bool($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'value' => $value,
        ];
    }
}
