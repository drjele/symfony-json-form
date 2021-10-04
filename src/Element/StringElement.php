<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

final class StringElement extends AbstractElement
{
    public function __construct(string $name)
    {
        $this->name = $name;
    }

    protected function getType(): string
    {
        return 'string';
    }

    protected function renderValue($value): array
    {
        if (null !== $value && !\is_string($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'value' => $value,
        ];
    }
}
